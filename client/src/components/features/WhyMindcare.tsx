import { Shield, Zap, Globe, TrendingUp, Lock, Smile } from "lucide-react";
import { LuBrain } from "react-icons/lu";

const benefits = [
  {
    icon: Shield,
    title: "Completely Confidential",
    description:
      "Your privacy and data security are our top priority. All conversations are encrypted and protected.",
  },
  {
    icon: Zap,
    title: "Instant Support",
    description:
      "Get help immediately whenever you need it, without waiting for appointments or dealing with stigma.",
  },
  {
    icon: Globe,
    title: "Multilingual Resources",
    description:
      "Access content in your preferred language. Mental health support should be accessible to everyone.",
  },
  {
    icon: TrendingUp,
    title: "Evidence-Based",
    description:
      "Our AI and expert consultants use proven psychological interventions and therapeutic techniques.",
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description:
      "Your information is never shared. We comply with all data protection and healthcare regulations.",
  },
  {
    icon: Smile,
    title: "Holistic Wellness",
    description:
      "Beyond crisis support, we help you build long-term mental health resilience and wellbeing.",
  },
];

export function WhyMindcare() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary bg-primary/5 rounded-full">
            The Mindcare Advantage
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 tracking-tight flex items-center justify-center gap-3">
            Why Choose <span className="flex items-center gap-2"><div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center"><LuBrain className="h-6 w-6 md:h-8 md:w-8 text-primary" /></div>MindCare</span>?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're committed to providing accessible, affordable, and effective mental health support
            tailored for the modern student.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-primary/5 border border-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <Icon size={28} className="text-primary group-hover:text-white transition-colors duration-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-xl text-foreground mb-2 tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-10 rounded-[2.5rem] bg-white border border-primary/5 shadow-2xl shadow-primary/5">
            <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-3">
              10K+
            </div>
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">
              Students Helped
            </p>
          </div>
          <div className="text-center p-10 rounded-[2.5rem] bg-white border border-primary/5 shadow-2xl shadow-primary/5">
            <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 to-secondary bg-clip-text text-transparent mb-3">
              4.9★
            </div>
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">
              Satisfaction
            </p>
          </div>
          <div className="text-center p-10 rounded-[2.5rem] bg-white border border-primary/5 shadow-2xl shadow-primary/5">
            <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-secondary to-pink-500 bg-clip-text text-transparent mb-3">
              24/7
            </div>
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">
              Available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
