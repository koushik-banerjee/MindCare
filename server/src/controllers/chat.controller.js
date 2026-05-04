import { supabase } from "../supabaseClient.js";
import OpenAI from "openai";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";
import { logger } from "../lib/logger.js";

const AI_PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are a supportive mental health assistant and psychological consultant. 
Your goal is to be empathetic, avoid clinical diagnosis, and provide structured support.
You MUST ALWAYS return your response in a clear, supportive JSON format matching this schema:
{
  "acknowledgment": "Briefly acknowledge what the user said",
  "empathyStatement": "Provide a warm, empathetic statement validated their feelings",
  "suggestions": ["3-4 practical, supportive next steps or coping strategies"],
  "followUpQuestion": "A gentle question to continue the conversation",
  "moodAnalysis": "One or two words describing their detected emotional state",
  "isCrisis": boolean
}`;

const ChatResponseSchema = z.object({
  acknowledgment: z.string().describe("Briefly acknowledge what the user said"),
  empathyStatement: z.string().describe("Provide a warm, empathetic statement validated their feelings"),
  suggestions: z.array(z.string()).describe("3-4 practical, supportive next steps or coping strategies"),
  followUpQuestion: z.string().describe("A gentle question to continue the conversation"),
  moodAnalysis: z.string().describe("One or two words describing their detected emotional state"),
  isCrisis: z.boolean().describe("Whether the message indicates an immediate mental health crisis")
});

const openaiClient = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

// Initialize GoogleGenAI with the new SDK
const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

/**
 * Send AI chat message
 */
export async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch prior conversation history for context (last 10 exchanges)
    const { data: history, error: historyError } = await supabase
      .from("chat_messages")
      .select("message, response")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(10);

    if (historyError) throw historyError;

    const aiResult = await generateAIResponse(message, history || []);

    // Save conversation to database
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        message,
        response: JSON.stringify(aiResult),
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...aiResult,
      conversationId: data.id,
    });
  } catch (error) {
    logger.error("chat.send_failed", { requestId: req.requestId, error });
    res.status(500).json({ error: "Failed to send message" });
  }
}

/**
 * Get user's conversation history
 */
export async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const parsedData = data.map(msg => {
      try {
        return { ...msg, response: JSON.parse(msg.response) };
      } catch (e) {
        return msg;
      }
    });

    res.json(parsedData || []);
  } catch (error) {
    logger.error("chat.get_conversations_failed", { requestId: req.requestId, error });
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
}

/**
 * Main AI response generator using Gemini 3 + Thinking Config
 */
async function generateAIResponse(message, history = []) {
  // Hard safety guard check first
  const manualCrisis = detectCrisis(message);
  if (manualCrisis) {
    return {
      acknowledgment: "I hear you, and it's very important that you've shared this.",
      empathyStatement: "I'm really concerned about what you're sharing. Please know that you're not alone, and there is help available immediately. Your life matters.",
      suggestions: [
        "Call 988 (National Suicide Prevention Lifeline)",
        "Text HOME to 741741 (Crisis Text Line)",
        "Go to the nearest emergency room"
      ],
      followUpQuestion: "Would you like me to help you find more local resources?",
      moodAnalysis: "Crisis Detected",
      isCrisis: true
    };
  }

  if (AI_PROVIDER === "openai") {
    return { 
      response: "OpenAI provider is currently not implemented for structured output in this version.",
      moodAnalysis: "Neutral",
      suggestedSteps: ["Configure Gemini for the best experience"],
      isCrisis: false
    };
  }

  if (AI_PROVIDER === "gemini" || AI_PROVIDER === "mock") {
    if (!ai && AI_PROVIDER !== "mock") {
      throw new Error("Gemini API key is not configured");
    }

    if (!ai) {
      return {
        response: "I'm here to support you. It sounds like you're going through a lot. (Mock Response)",
        moodAnalysis: "Seeking Support",
        suggestedSteps: ["Practice deep breathing", "Talk to a friend"],
        isCrisis: false
      };
    }

    const contents = [];
    // Add history as strings for context
    const fullPrompt = [
      SYSTEM_PROMPT,
      "\nCONVERSATION HISTORY:\n",
      ...history.map(entry => {
        let prevText = entry.response;
        try {
          const parsed = JSON.parse(entry.response);
          prevText = `${parsed.acknowledgment} ${parsed.empathyStatement}`;
        } catch (e) {}
        return `User: ${entry.message}\nAssistant: ${prevText}`;
      }),
      `User: ${message}`,
      "\nReturn the response in the specified JSON format."
    ].join("\n");

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: fullPrompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        // We'll parse the JSON from the text output as @google/genai might have different JSON mode props
      }
    });

    const responseText = result.text || "{}";
    
    try {
      // Find JSON block if AI wrapped it in markdown
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      const parsed = JSON.parse(cleanJson);
      return ChatResponseSchema.parse(parsed);
    } catch (error) {
      logger.error("chat.parse_failed", { responseLength: responseText.length, error });
      return {
        acknowledgment: "I hear you.",
        empathyStatement: "I'm sorry, I'm having trouble processing that right now.",
        suggestions: ["Try rephrasing your message"],
        followUpQuestion: "Would you like to try telling me more about it?",
        moodAnalysis: "Unknown",
        isCrisis: false
      };
    }
  }

  return {
    response: "AI Provider not supported.",
    moodAnalysis: "Error",
    suggestedSteps: [],
    isCrisis: false
  };
}

function detectCrisis(message) {
  const messageLower = message.toLowerCase();
  const crisisKeywords = [
    "suicide", "kill myself", "end it all", "want to die", "hurt myself",
    "slashing", "shooting myself", "taking all my pills"
  ];
  return crisisKeywords.some(keyword => messageLower.includes(keyword));
}
