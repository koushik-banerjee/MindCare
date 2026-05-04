import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";
import { LuBrain } from "react-icons/lu";

export function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-white to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <LuBrain className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold tracking-tight text-foreground">MindCare</span>
            </div>
            <p className="text-sm text-foreground/70 mb-4">
              Providing accessible digital psychological interventions for students' mental wellbeing.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/ai-chat" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  AI Chat
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/community" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Community Forum
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:support@mindcare.com" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  support@mindcare.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <address className="text-sm text-foreground/70 not-italic">
                  123 Wellness St, Health City, HC 12345
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-foreground/60">
          <p>&copy; 2024 MindCare. All rights reserved.</p>
          <p>
            Providing accessible mental health support for students worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
