import { Link, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { LuBrain } from "react-icons/lu"
import {
  MessageCircle,
  Calendar,
  BookOpen,
  Users,
  LayoutDashboard,
  LogOut
} from 'lucide-react'

interface NavbarProps {
  onClose?: () => void
}

export default function Navbar({ onClose }: NavbarProps) {
  const { session, user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut.mutateAsync()
    navigate('/')
  }

  const initials = user?.full_name
    ? user.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U'

  if (!session) return null

  return (
    <aside className="flex h-full w-full flex-col border-r bg-background">
      <div className="border-b px-5 py-4">
        <Link to="/chat" className="flex items-center gap-2 group/logo" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover/logo:bg-primary/20">
            <LuBrain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover/logo:text-primary">
              MindCare
            </span>
            <p className="text-[10px] leading-none text-muted-foreground mt-0.5">Mental Wellness</p>
          </div>
        </Link>
      </div>

      <div className="px-3 py-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="w-full justify-start" onClick={onClose}>
            <Link to="/chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI Chat
            </Link>
          </Button>

          {user?.role !== 'admin' && (
            <Button variant="ghost" size="sm" asChild className="w-full justify-start" onClick={onClose}>
              <Link to="/booking" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Booking
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" asChild className="w-full justify-start" onClick={onClose}>
            <Link to="/resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="w-full justify-start" onClick={onClose}>
            <Link to="/community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Peer Support
            </Link>
          </Button>

          {user?.role === 'admin' && (
            <Button variant="ghost" size="sm" asChild className="w-full justify-start" onClick={onClose}>
              <Link to="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-auto border-t p-4">
        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors mb-4 group"
          onClick={onClose}
        >
          <Avatar key={user?.avatar_url} className="h-9 w-9 border border-primary/10">
            <AvatarImage src={user?.avatar_url} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="truncate text-sm font-medium leading-none group-hover:text-primary transition-colors">
              {user?.full_name || user?.email}
            </p>
            <p className="truncate text-xs text-muted-foreground capitalize mt-1">
              {user?.role}
            </p>
          </div>
        </Link>

        <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
