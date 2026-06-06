'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, BookOpen, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-display font-700 text-xl">
          <BookOpen className="w-6 h-6 text-brand-400" strokeWidth={1.5} />
          <span className="text-gradient">LearnHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="/courses" className="hover:text-white transition-colors">Cursos</Link>
          <Link href="/#about" className="hover:text-white transition-colors">Sobre</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link href="/dashboard"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              <User className="w-4 h-4" />
              Minha área
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
                Entrar
              </Link>
              <Link href="/login?tab=signup"
                className="bg-brand-500 hover:bg-brand-400 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Começar grátis
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white/60" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <Link href="/courses" className="text-sm text-white/70 hover:text-white" onClick={() => setOpen(false)}>Cursos</Link>
          {user
            ? <Link href="/dashboard" className="text-sm text-brand-400" onClick={() => setOpen(false)}>Minha área</Link>
            : <Link href="/login" className="text-sm text-brand-400" onClick={() => setOpen(false)}>Entrar / Cadastrar</Link>
          }
        </div>
      )}
    </nav>
  )
}
