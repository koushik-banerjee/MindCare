import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { LuBrain } from "react-icons/lu"
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30 md:grid md:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="sticky top-0 h-screen">
          <Navbar />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <LuBrain className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">MindCare</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <Navbar onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
