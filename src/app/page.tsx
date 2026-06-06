'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import CourseCard from '@/components/ui/CourseCard'
import type { Course } from '@/types/database'

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setCourses(data) })
  }, [])

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(61,110,245,0.15),transparent)]" />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block glass text-xs text-brand-400 px-4 py-2 rounded-full mb-8 font-medium">
            ✦ Plataforma de cursos online
          </span>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-[0.95] mb-6">
            Aprenda o que<br />
            <span className="text-gradient">o mercado pede.</span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Cursos práticos e diretos ao ponto. Sem enrolação, sem teoria inútil.
            Só o que você precisa para crescer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses"
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(61,110,245,0.4)]">
              Ver todos os cursos <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="flex items-center justify-center gap-2 glass text-white/80 hover:text-white font-medium px-8 py-4 rounded-xl transition-colors">
              Criar conta grátis
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-16 text-sm text-white/30">
            <span>+500 alunos</span>
            <span className="w-px h-4 bg-white/10" />
            <span>+20 cursos</span>
            <span className="w-px h-4 bg-white/10" />
            <span>Certificado incluso</span>
          </div>
        </div>
      </section>

      {/* Cursos em destaque */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-400 text-sm font-medium mb-2">Destaques</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Cursos mais procurados</h2>
          </div>
          <Link href="/courses" className="text-sm text-white/40 hover:text-white transition-colors hidden md:block">
            Ver todos →
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-dark-600" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-dark-600 rounded w-1/3" />
                  <div className="h-5 bg-dark-600 rounded w-3/4" />
                  <div className="h-3 bg-dark-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="border-t border-white/5 py-24">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Acesso imediato', desc: 'Comprou, assistiu. Sem espera para liberar o conteúdo.' },
            { icon: Shield, title: 'Garantia de 7 dias', desc: 'Não gostou? Devolvemos 100% do seu dinheiro.' },
            { icon: Users, title: 'Comunidade ativa', desc: 'Tire dúvidas e conecte-se com outros alunos.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6">
              <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <span className="font-display font-bold text-white/60">LearnHub</span>
          <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
