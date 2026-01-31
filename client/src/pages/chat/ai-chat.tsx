import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, AlertCircle } from "lucide-react";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export default function AiChatPage() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["chat-history"],
    queryFn: () => api.get<Message[]>("/chat/history"),
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post<{ content: string }>("/chat/message", { message });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, sendMutation.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate(msg);
  };

  const messages: Message[] = [
    ...history,
    ...(sendMutation.isPending && sendMutation.variables
      ? [
          { role: "user" as const, content: sendMutation.variables },
          { role: "assistant" as const, content: "..." },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b pb-4">
          <h1 className="text-xl font-semibold">AI Wellness Chat</h1>
          <p className="text-sm text-muted-foreground">
            A supportive space for mental wellness. I&apos;m here to listen and offer
            guidance—not diagnosis. If you&apos;re in crisis, please reach out to a
            professional helpline.
          </p>
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Disclaimer:</strong> This chat does not provide medical
              advice or diagnosis. For emergencies, contact a crisis helpline
              immediately.
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="ml-auto h-16 w-2/3" />
                <Skeleton className="h-16 w-3/4" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p className="mb-2">Start a conversation</p>
                <p className="text-sm">
                  Share what&apos;s on your mind. I&apos;m here to support you.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t p-4"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[44px] resize-none"
              rows={1}
              disabled={sendMutation.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0"
              disabled={!input.trim() || sendMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
