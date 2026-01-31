import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Calendar, BookOpen, Users, LayoutDashboard, LogOut } from "lucide-react";

export function Navbar() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { supabase } = await import("@/services/supabase");
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <span className="text-xl">🧠</span>
          <span>MINDCARE</span>
        </Link>
        <nav className="ml-8 flex items-center gap-6">
          {user && (
            <>
              <Link
                to="/chat"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                AI Chat
              </Link>
              <Link
                to="/booking"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Calendar className="h-4 w-4" />
                Book
              </Link>
              <Link
                to="/resources"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" />
                Resources
              </Link>
              <Link
                to="/community"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Users className="h-4 w-4" />
                Community
              </Link>
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.email}</span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {profile?.role ?? "student"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
