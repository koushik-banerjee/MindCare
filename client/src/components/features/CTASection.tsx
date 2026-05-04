import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white to-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left side - Content */}
            <div>
              <div className="inline-block px-4 py-1 mb-4 text-xs font-black uppercase tracking-widest text-secondary bg-secondary/10 rounded-full">
                Get Started
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight tracking-tight">
                Your Journey to <br /> Wellness Starts Here
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-medium">
                No credit card required. Start with our free AI chat and scale your
                support whenever you're ready.
              </p>

              <ul className="space-y-6 mb-10">
                <li className="flex items-start gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <CheckCircle2 size={24} className="text-secondary group-hover:text-white" />
                  </div>
                  <div>
                    <span className="font-black text-foreground text-lg tracking-tight">Free AI Chat</span>
                    <p className="text-sm text-muted-foreground font-medium">
                      Unlimited access to private psychological support
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <CheckCircle2 size={24} className="text-secondary group-hover:text-white" />
                  </div>
                  <div>
                    <span className="font-black text-foreground text-lg tracking-tight">Community Forums</span>
                    <p className="text-sm text-muted-foreground font-medium">
                      Join a safe space for peer-to-peer connection
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <CheckCircle2 size={24} className="text-secondary group-hover:text-white" />
                  </div>
                  <div>
                    <span className="font-black text-foreground text-lg tracking-tight">Wellness Library</span>
                    <p className="text-sm text-muted-foreground font-medium">
                      Personalized multimedia content for self-growth
                    </p>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:-translate-y-1 active:scale-95"
                >
                  Create Free Account
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-primary/20 bg-white px-8 py-4 font-black text-primary transition-all hover:bg-primary/5 active:scale-95"
                >
                  Book Specialist
                </Link>
              </div>
            </div>

            {/* Right side - Visual */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                {/* Background shapes */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />

                {/* Card */}
                <div className="relative bg-white rounded-[2.5rem] p-8 border border-primary/5 shadow-2xl">
                  <div className="space-y-6">
                    {/* Message bubbles illustration */}
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <div className="bg-primary/5 text-primary rounded-3xl rounded-tr-none px-5 py-3 max-w-[85%] text-xs font-bold leading-relaxed border border-primary/10">
                          Hi AI, I've been feeling a bit overwhelmed lately with exams coming up. Can you help?
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-primary text-primary-foreground rounded-3xl rounded-tl-none px-5 py-3 max-w-[85%] text-xs font-bold leading-relaxed shadow-lg shadow-primary/20">
                          Of course! It's completely normal to feel this way. Let's break down some quick grounding techniques together. Ready?
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-primary/5 text-primary rounded-3xl rounded-tr-none px-5 py-3 max-w-[85%] text-xs font-bold leading-relaxed border border-primary/10">
                          Yes, please. That would be great.
                        </div>
                      </div>
                    </div>

                    {/* Input area */}
                    <div className="flex gap-2 pt-6 border-t border-muted">
                      <div className="flex-1 h-10 rounded-2xl bg-muted/50 border border-muted px-4 py-2 text-[10px] font-bold text-muted-foreground flex items-center">
                        Thinking...
                      </div>
                      <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ArrowRight size={18} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial CTA */}
          <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <blockquote className="relative z-10 max-w-3xl mx-auto">
              <p className="text-xl md:text-3xl font-black mb-10 leading-tight italic">
                "MindCare has transformed how I approach my mental health. The AI is
                surprisingly empathetic, and the experts are truly world-class."
              </p>
              <footer className="flex items-center justify-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-white/20 p-1">
                  <div className="h-full w-full rounded-full bg-indigo-400 flex items-center justify-center font-bold">SM</div>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg">Koushik Banerjee</p>
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Developer</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
