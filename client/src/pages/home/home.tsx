import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Calendar, Users, Sparkles } from 'lucide-react'

const testimonials = [
  {
    name: 'Amina, Student',
    quote: 'MindCare helped me organize my thoughts during exam season and feel supported daily.',
  },
  {
    name: 'Rahul, Student',
    quote: 'Booking a consultant was simple, and the AI check-ins made me more consistent.',
  },
  {
    name: 'Sara, Student',
    quote: 'The peer support space made me feel less alone and more understood.',
  },
]

const faqs = [
  {
    question: 'Is MindCare a replacement for medical treatment?',
    answer: 'No. MindCare provides support tools and resources, but it does not replace professional medical diagnosis or emergency care.',
  },
  {
    question: 'Is my data private?',
    answer: 'Yes. We prioritize privacy and only use your data to improve your in-app support experience.',
  },
  {
    question: 'How do I start with a consultant?',
    answer: 'Create an account, open Booking, choose a consultant, and request an appointment slot.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-lg font-semibold">MindCare</p>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#community" className="hover:text-foreground">Community</a>
            <a href="#resources" className="hover:text-foreground">Resources</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 md:grid-cols-[1.15fr_1fr] md:items-center md:px-8">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              AI-powered mental wellness for students
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Your AI Companion for Mental Wellness
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Get guided emotional support, connect with verified consultants, and build healthier routines with a safe support community.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/register">Start Free Chat</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Book a Consultant</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mood Check-In</CardTitle>
                <CardDescription>Daily reflection insights</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                “You seem stressed this week. Want a 5-minute grounding exercise?”
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Support Snapshot</CardTitle>
                <CardDescription>AI + consultant pathway</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                2 pending consultant slots and 1 recommended coping plan for today.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle>AI Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                24/7 guided conversations, journaling prompts, and emotional check-ins.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Consultant Booking</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Schedule sessions with consultants and track appointment status clearly.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Peer Support</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Join a respectful student community, share safely, and receive support.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
          <h2 className="mb-6 text-2xl font-semibold">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardContent className="pt-6"><p className="text-sm font-semibold">1. Sign Up</p><p className="mt-2 text-sm text-muted-foreground">Create your account and choose your support goals.</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm font-semibold">2. Match & Explore</p><p className="mt-2 text-sm text-muted-foreground">Use AI chat, discover resources, and request consultant support.</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm font-semibold">3. Start Healing</p><p className="mt-2 text-sm text-muted-foreground">Build consistent wellness habits with guided follow-ups.</p></CardContent></Card>
          </div>
        </section>

        <section id="community" className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
          <h2 className="mb-6 text-2xl font-semibold">Student stories</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">“{item.quote}”</p>
                  <p className="mt-3 text-sm font-semibold">{item.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="resources" className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>FAQs</CardTitle>
                <CardDescription>Quick answers before you begin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-lg border p-3">
                    <p className="text-sm font-semibold">{faq.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle>Start your journey today</CardTitle>
                <CardDescription className="text-primary-foreground/85">
                  Support is one step away.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/register">Create Free Account</Link>
                </Button>
                <Button variant="outline" className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
          <div className="mb-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-4">
            <p className="font-semibold text-foreground">MindCare</p>
            <p>Features</p>
            <p>Consultants</p>
            <p>Resources</p>
          </div>
          <div className="rounded-lg border bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Crisis Disclaimer</p>
            <p className="mt-1">If you are in immediate danger or crisis, contact local emergency services or a crisis helpline immediately.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
