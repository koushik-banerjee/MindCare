import { Link } from "react-router-dom";
import {
  MessageCircle,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "AI Chat Support",
    description:
      "Get instant psychological support and solutions for your mental health concerns through our advanced AI assistant. Available 24/7 for immediate help.",
    link: "/ai-chat",
    gradient: "from-purple-500 to-primary",
    bgGradient: "from-primary/5 to-transparent",
  },
  {
    icon: Calendar,
    title: "Expert Consultations",
    description:
      "Book secure and confidential appointments with licensed psychological consultants. Schedule at your convenience with flexible time slots.",
    link: "/booking",
    gradient: "from-secondary to-teal-500",
    bgGradient: "from-secondary/5 to-transparent",
  },
  {
    icon: BookOpen,
    title: "Resource Hub",
    description:
      "Access curated multimedia content including wellness videos, guided audio sessions, and educational materials in multiple languages.",
    link: "/resources",
    gradient: "from-cyan-500 to-blue-500",
    bgGradient: "from-blue-500/5 to-transparent",
  },
  {
    icon: Users,
    title: "Peer Community",
    description:
      "Connect with other students in moderated forums and support groups. Share experiences, offer support, and build meaningful connections.",
    link: "/community",
    gradient: "from-emerald-500 to-green-500",
    bgGradient: "from-green-500/5 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Monitor your mental health journey with personalized progress tracking, insights, and recommendations based on your interactions.",
    link: "/",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/5 to-transparent",
  },
];

export function FeaturesShowcase() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary bg-primary/5 rounded-full">
            Our Ecosystem
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 tracking-tight">
            Comprehensive Support <br className="hidden md:block" /> For Your Mind
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need for your psychological wellbeing in one integrated platform.
            Choose the path that works best for you.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-20 px-2 lg:px-0">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                className="group relative flex flex-col h-full rounded-[2rem] border border-border bg-white transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative p-8 flex flex-col h-full z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon size={28} />
                  </div>

                  {/* Content */}
                  <h3 className="font-black text-xl text-foreground mb-3 leading-tight tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-8 line-clamp-4 leading-relaxed font-medium">
                    {feature.description}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    Explore
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Your Wellness Journey?
          </h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who are taking control of their mental health with MindCare.
          </p>
          <Link
            to="/ai-chat"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary transition-transform hover:scale-105 active:scale-95"
          >
            Start Free Chat
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
