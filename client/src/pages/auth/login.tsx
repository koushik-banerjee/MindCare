import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuBrain } from 'react-icons/lu'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn.mutateAsync({ email, password })
      navigate('/chat')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl border bg-white shadow-sm md:grid-cols-[1.05fr_1fr]">
        <div className="relative hidden flex-col justify-between bg-primary px-10 py-12 text-primary-foreground md:flex">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/auth-wellness.png"
              alt="Mental Wellness"
              className="h-full w-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-primary/40" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <LuBrain className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white">MindCare</p>
            </div>
            <h1 className="mt-8 text-4xl font-bold leading-tight">
              Mental wellness support designed for students.
            </h1>
            <p className="mt-4 max-w-sm text-lg text-white/90 font-medium">
              Chat with AI, book consultants, and join a supportive peer community.
            </p>
          </div>
          <div className="relative z-10 rounded-xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm text-sm font-medium text-white/95">
            Secure, private, and focused on emotionally safe interactions.
          </div>
        </div>

        <div className="relative flex items-center justify-center p-6 md:p-10">
          {/* Return to Home Link inside form area */}
          <Link
            to="/"
            className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-white shadow-sm hover:bg-muted transition-all duration-300 group"
          >
            <Home size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">Home</span>
          </Link>

          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="space-y-2 px-0">
              <CardTitle className="text-3xl font-semibold">Sign in</CardTitle>
              <CardDescription>Welcome back. Enter your credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="h-11 w-full" disabled={signIn.isPending}>
                  {signIn.isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
