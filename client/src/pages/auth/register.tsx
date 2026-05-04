import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuBrain } from 'react-icons/lu'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student' as 'student' | 'consultant' | 'admin',
  })
  const [error, setError] = useState('')

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await signUp.mutateAsync({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      })
      navigate('/chat')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
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
              Join a safer and smarter mental wellness platform.
            </h1>
            <p className="mt-4 max-w-sm text-lg text-white/90 font-medium">
              Create your account to start AI chat, consultant booking, and peer support.
            </p>
          </div>
          <div className="relative z-10 rounded-xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm text-sm font-medium text-white/95">
            Your data stays private and your wellbeing comes first.
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
              <CardTitle className="text-3xl font-semibold">Create account</CardTitle>
              <CardDescription>Set up your profile to continue.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  >
                    <option value="student">Student seeking support</option>
                    <option value="consultant">Mental health consultant</option>
                  </select>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={signUp.isPending}
                >
                  {signUp.isPending ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </div>

              <div className="mt-6 rounded-md bg-amber-50 p-4">
                <p className="text-xs text-amber-800">
                  ⚠️ <strong>Important:</strong> This platform provides support and resources but is not a substitute
                  for professional mental health care. In case of emergency, please contact local crisis services.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
