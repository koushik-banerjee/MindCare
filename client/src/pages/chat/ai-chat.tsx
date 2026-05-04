import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { chatApi } from '@/services/api'
import { Send, Bot, User, AlertTriangle } from 'lucide-react'

interface StructuredResponse {
  acknowledgment: string
  empathyStatement: string
  suggestions: string[]
  followUpQuestion: string
  moodAnalysis: string
  isCrisis: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string | StructuredResponse
  timestamp: Date
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: {
        acknowledgment: "Hello! I'm MindCare AI.",
        empathyStatement: "I'm here to provide emotional support and a safe space for you. How are you feeling today?",
        suggestions: ["Share what's on your mind", "Ask for a coping technique", "Just talk about your day"],
        followUpQuestion: "Would you like to start by telling me how your day has been?",
        moodAnalysis: "Supportive",
        isCrisis: false
      },
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data, // data is now the structured response object
          timestamp: new Date(),
        },
      ])
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: {
            acknowledgment: "I'm sorry.",
            empathyStatement: `I encountered an error: ${error.message}. Please try again.`,
            suggestions: ["Check your connection", "Try again in a moment"],
            followUpQuestion: "Shall we try again?",
            moodAnalysis: "Error",
            isCrisis: false
          },
          timestamp: new Date(),
        },
      ])
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMessage.isPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    await sendMessage.mutateAsync(input)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)] max-w-6xl gap-4 grid-cols-1 lg:grid-cols-[1fr_320px]">
      <Card className="h-full flex flex-col overflow-hidden shadow-2xl border-primary/5 bg-background/60 backdrop-blur-xl">
        {/* Header */}
        <div className="border-b bg-muted/20 p-2 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-primary/90">MindCare Consultant</h2>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-widest">
                  Gemini 3 Flash Active
                </p>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200/50 bg-amber-50/30 p-3 shadow-sm transition-all hover:shadow-md">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-[13px] leading-snug text-amber-900/80 font-medium">
              <strong>Supportive Care:</strong> Direct psychological consultancy.
              In crisis? Contact emergency services immediately.
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-8 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/5 hover:scrollbar-thumb-primary/10 transition-all bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [background-position:center]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
            >
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 hover:rotate-12 shadow-sm ${message.role === 'user' ? 'bg-primary shadow-primary/20' : 'bg-muted border shadow-sm'
                  }`}
              >
                {message.role === 'user' ? (
                  <User className="h-6 w-6 text-white" />
                ) : (
                  <Bot className="h-6 w-6 text-primary" />
                )}
              </div>
              <div
                className={`flex-1 max-w-[90%] md:max-w-[80%] space-y-2 group transition-all duration-500 ${message.role === 'user' ? 'items-end text-right' : 'items-start'
                  }`}
              >
                <div
                  className={`p-5 rounded-3xl shadow-lg transition-all duration-500 hover:shadow-xl ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-background/90 backdrop-blur-2xl border border-primary/10 rounded-tl-none ring-1 ring-black/5'
                    }`}
                >
                  {typeof message.content === 'string' ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                  ) : (
                    <div className="space-y-5 text-left">
                      {/* Acknowledgment */}
                      <div className="space-y-1">
                        <p className="text-[15px] leading-relaxed font-semibold text-primary/80 italic">
                          "{message.content.acknowledgment}"
                        </p>
                      </div>

                      {/* Empathy */}
                      <p className="text-[16px] leading-relaxed font-medium text-foreground/90 bg-primary/5 p-3 rounded-2xl border-l-4 border-primary">
                        {message.content.empathyStatement}
                      </p>

                      <div className="grid gap-4 md:grid-cols-1">
                        {/* Suggested Steps */}
                        {message.content.suggestions && message.content.suggestions.length > 0 && (
                          <div className="bg-muted/30 rounded-2xl p-4 border border-primary/5 space-y-3">
                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary/60">
                              <span className="h-1 w-4 bg-primary/40 rounded-full" />
                              Coping Strategies
                            </h4>
                            <ul className="grid gap-2">
                              {message.content.suggestions.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-[14px] leading-tight text-muted-foreground group/item">
                                  <div className="h-5 w-5 rounded-full bg-white border border-primary/10 flex items-center justify-center shrink-0 shadow-sm group-hover/item:border-primary/30 transition-colors">
                                    <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                                  </div>
                                  <span className="pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Mood & Follow-up Row */}
                        <div className="flex flex-wrap gap-4 items-end justify-between pt-2">
                          <div className="space-y-3 flex-1 min-w-[200px]">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60">Insight</h4>
                            <p className="text-[15px] font-bold text-foreground/80 leading-snug">
                              {message.content.followUpQuestion}
                            </p>
                          </div>

                          {message.content.moodAnalysis && (
                            <div className="px-4 py-2 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                                {message.content.moodAnalysis}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Crisis Warning */}
                      {message.content.isCrisis && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive text-[14px] font-bold flex items-center gap-3 animate-bounce">
                          <div className="h-8 w-8 bg-destructive rounded-full flex items-center justify-center text-white shrink-0">🆘</div>
                          <span>Please seek professional help immediately. You are not alone.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 px-2 opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold tracking-tighter">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 rounded-lg border bg-muted/50 p-4">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-muted/30 p-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind... (Shift + Enter for new line)"
              className="min-h-[40px] max-h-[80px] h-[40px] resize-none"
              disabled={sendMessage.isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="h-[40px] w-[40px]"
              disabled={!input.trim() || sendMessage.isPending}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Your conversations are private and saved for continuity of care
          </p>
        </div>
      </Card>

      <Card className="hidden h-full lg:flex lg:flex-col">
        <div className="border-b p-4">
          <h3 className="font-semibold">Quick prompts</h3>
          <p className="text-sm text-muted-foreground">Start with one of these prompts</p>
        </div>
        <div className="space-y-2 p-4">
          {[
            'I feel overwhelmed with coursework',
            'How can I reduce anxiety before exams?',
            'Help me build a healthy daily routine',
            'I need grounding techniques right now',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => setInput(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
