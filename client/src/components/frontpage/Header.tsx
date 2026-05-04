import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LuBrain } from "react-icons/lu";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "AI Chat", path: "/ai-chat" },
    { name: "Book Appointment", path: "/booking" },
    { name: "Resources", path: "/resources" },
    { name: "Community", path: "/community" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group/logo">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover/logo:bg-primary/20">
            <LuBrain className="h-6 w-6 text-primary" />
          </div>
          <span className="hidden font-bold tracking-tight text-foreground sm:inline-block transition-colors group-hover/logo:text-primary">
            MindCare
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.path
                  ? "text-primary"
                  : "text-foreground/70"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link
            to="/booking"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b border-border transition-colors hover:bg-muted",
                  location.pathname === link.path
                    ? "text-primary bg-primary/5"
                    : "text-foreground/70"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/booking"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium text-primary"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
