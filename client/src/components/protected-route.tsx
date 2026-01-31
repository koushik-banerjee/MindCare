import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "./loading";
import type { UserRole } from "@/services/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  roles?: UserRole[];
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  roles = [],
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (requireAuth === false) {
    if (user) {
      return <Navigate to="/chat" replace state={{ from: location }} />;
    }
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && profile && !roles.includes(profile.role)) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}
