import { Router } from "express";
import OpenAI from "openai";
import { supabase } from "../supabaseClient.js";
import { authMiddleware } from "../middleware/roleAuth.js";

const router = Router();
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "self-harm",
  "hurt myself",
];

const CRISIS_RESPONSE =
  "I'm really concerned about what you're sharing. Your safety matters. Please reach out to a crisis helpline immediately:\n\n**India:** 24/7 Mental Health Helpline - 1800-599-0019\n**International:** Befrienders Worldwide - find a helpline at befrienders.org\n\nYou're not alone. Professional support is available right now.";

const SAFETY_SYSTEM_PROMPT = `You are a supportive mental wellness assistant for MINDCARE. You provide emotional support, coping strategies, and general wellness guidance.

CRITICAL RULES:
1. NEVER diagnose mental health conditions. You are not a clinician.
2. NEVER prescribe medication or suggest specific treatments.
3. Always encourage users to seek professional help for serious concerns.
4. Be empathetic, non-judgmental, and supportive.
5. If someone mentions crisis keywords (suicide, self-harm, etc.), respond with crisis resources immediately.
6. Keep responses concise and helpful (2-4 paragraphs max).`;

router.use(authMiddleware);

router.get("/history", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch chat history" });
  }
});

router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message required" });
    }

    const lowerMsg = message.toLowerCase();
    const isCrisis = CRISIS_KEYWORDS.some((kw) => lowerMsg.includes(kw));
    if (isCrisis) {
      await supabase.from("chat_history").insert({
        user_id: req.user.id,
        role: "user",
        content: message,
      });
      await supabase.from("chat_history").insert({
        user_id: req.user.id,
        role: "assistant",
        content: CRISIS_RESPONSE,
      });
      return res.json({ content: CRISIS_RESPONSE });
    }

    if (!openai) {
      return res.json({
        content:
          "AI chat is not configured. Please add OPENAI_API_KEY to your server environment.",
      });
    }

    const { data: history } = await supabase
      .from("chat_history")
      .select("role, content")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages = [
      { role: "system", content: SAFETY_SYSTEM_PROMPT },
      ...(history || []).map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
    });

    const assistantContent =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    await supabase.from("chat_history").insert([
      { user_id: req.user.id, role: "user", content: message },
      { user_id: req.user.id, role: "assistant", content: assistantContent },
    ]);

    res.json({ content: assistantContent });
  } catch (err) {
    res.status(500).json({ message: err.message || "Chat failed" });
  }
});

export { router as chatRoutes };
