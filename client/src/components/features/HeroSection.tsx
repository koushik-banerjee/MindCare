import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 mb-5">
              <Heart size={14} className="text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Your Mental Wellbeing Matters
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-5 leading-[1.15] tracking-tight">
              Professional Mental Health Support,{" "}
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Simplified for You
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-muted-foreground mb-7 max-w-lg leading-relaxed font-medium">
              Experience a new standard in wellness. MindCare combines advanced AI
              support with human expertise to provide a safe, confidential space
              for your growth.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto mb-8">
              <Link
                to="/chat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-1 active:scale-95"
              >
                Start AI Session
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/booking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-white px-7 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary/5 hover:border-primary/40 active:scale-95"
              >
                Book Specialist
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 text-xs font-semibold text-muted-foreground/80">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Specialist Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>24/7 AI Availability</span>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative lg:ml-auto max-w-md lg:max-w-xl">
            <div className="relative z-10 overflow-hidden rounded-[2rem] border-[6px] border-white shadow-2xl">
              <img
                src="/consultant.png"
                alt="Mental Health Consultant"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Decorative elements behind image */}
            <div className="absolute -top-4 -right-4 h-48 w-48 rounded-full bg-primary/10 -z-10 blur-2xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 h-56 w-56 rounded-full bg-secondary/10 -z-10 blur-2xl animate-pulse delay-700" />

            {/* Float Card 1 */}
            <div className="absolute -left-6 top-1/4 z-20 hidden xl:block animate-bounce-slow">
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-foreground uppercase tracking-wider">Safe Space</p>
                    <p className="text-[9px] font-bold text-muted-foreground">Encryption Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
