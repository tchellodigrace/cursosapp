'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Award, BookOpen, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EnrolledCourse {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  total_lessons: number
  completed_lessons: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      // Busca matrículas com dados do curso
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('courses(id, title, slug, thumbnail_url)')
        .eq('user_id', user.id)

      if (enrollments) {
        // Busca progresso para cada curso
        const enriched = await Promise.all(enrollments.map(async (e: any) => {
          const course = e.courses
          
          // Primeiro busca os módulos do curso
          const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', course.id)
          
          // Corrigido: garante que modules é um array e extrai os IDs
          const moduleIds = (modules || []).map((m: { id: string }) => m.id)
          
          // Depois usa os IDs na consulta
          const { count: total } = await supabase
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .in('module_id', moduleIds)

          const { count: done } = await supabase
            .from('lesson_progress')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true)
            .in('lesson_id',
              supabase.from('lessons').select('id')
                .in('module_id', moduleIds)
            )

          return {
            ...course,
            total_lessons: total || 0,
            completed_lessons: done || 0,
          }
        }))
        setCourses(enriched)
      }

      setLoading(false)
    }
    init()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-lg text-gradient">LearnHub</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40 hidden md:block">{user?.email}</span>
          <button onClick={signOut}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-10">
          Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'aluno'} 👋
        </h1>

        {courses.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
            <p className="text-white/40 mb-6">Você ainda não tem cursos. Que tal começar?</p>
            <Link href="/courses"
              className="inline-block bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors">
              Explorar cursos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const pct = course.total_lessons > 0
                ? Math.round((course.completed_lessons / course.total_lessons) * 100)
                : 0
              const finished = pct === 100

              return (
                <div key={course.id} className="glass rounded-2xl overflow-hidden">
                  <div className="relative aspect-video bg-dark-700">
                    {course.thumbnail_url && (
                      <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover opacity-70" />
                    )}
                    {finished && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" /> Concluído
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-semibold text-white mb-4 line-clamp-2">{course.title}</h3>

                    <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                      <span>{course.completed_lessons}/{course.total_lessons} aulas</span>
                      <span>{pct}%</span>
                    </div>

                    <div className="h-1.5 bg-dark-600 rounded-full mb-5 overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>

                    <Link href={`/learn/${course.slug}`}
                      className="w-full flex items-center justify-center gap-2 bg-brand-500/20 hover:bg-brand-500 text-brand-400 hover:text-white text-sm font-medium py-2.5 rounded-xl transition-all duration-200">
                      <Play className="w-4 h-4" fill="currentColor" />
                      {pct === 0 ? 'Começar' : pct === 100 ? 'Rever curso' : 'Continuar'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
