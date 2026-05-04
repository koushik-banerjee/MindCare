import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layout'
import ProtectedRoute from '@/components/protected-route'

// Auth pages
import Login from '@/pages/auth/login'
import Register from '@/pages/auth/register'

// Feature pages
import AIChat from '@/pages/chat/ai-chat'
import BookConsultant from '@/pages/booking/book-consultant'
import ResourceHub from '@/pages/resources/resource-hub'
import PeerSupport from '@/pages/community/peer-support'
import AdminDashboard from '@/pages/admin/dashboard'
import IndexPage from '@/pages/frontpage/Index'
import Profile from '@/pages/profile/Profile'

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute allowedRoles={['student', 'consultant']}>
                <BookConsultant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourceHub />
              </ProtectedRoute>
            }
          />

          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <PeerSupport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
