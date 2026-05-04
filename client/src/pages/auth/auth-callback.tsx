import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { api } from "@/services/api";
import Loading from "@/components/loading";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError("Authentication failed. Please try again.");
            setTimeout(() => navigate("/login"), 2000);
            return;
          }
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError("Authentication failed. Please try again.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        if (session?.user) {
          try {
            await api.get("/auth/profile");
          } catch {
            await api.post("/auth/register-profile", {
              userId: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? "",
              role: session.user.user_metadata?.role ?? "student",
            });
          }
          navigate("/chat", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        setError("Something went wrong. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return <Loading />;
}
