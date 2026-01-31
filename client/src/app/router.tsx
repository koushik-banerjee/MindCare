import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Loading } from "@/components/loading";

const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const AuthCallbackPage = lazy(() => import("@/pages/auth/auth-callback"));
const AiChatPage = lazy(() => import("@/pages/chat/ai-chat"));
const BookConsultantPage = lazy(() => import("@/pages/booking/book-consultant"));
const ResourceHubPage = lazy(() => import("@/pages/resources/resource-hub"));
const PeerSupportPage = lazy(() => import("@/pages/community/peer-support"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route
            path="login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="register"
            element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="auth/callback"
            element={<AuthCallbackPage />}
          />
          <Route
            path="chat"
            element={
              <ProtectedRoute>
                <AiChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="booking"
            element={
              <ProtectedRoute>
                <BookConsultantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="resources"
            element={
              <ProtectedRoute>
                <ResourceHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="community"
            element={
              <ProtectedRoute>
                <PeerSupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export { AppRoutes };
