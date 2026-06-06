import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, BarChart2 } from 'lucide-react'
import type { Course } from '@/types/database'

interface CourseCardProps {
  course: Course & { instructor_name?: string; lessons_count?: number }
}

export default function CourseCard({ course }: CourseCardProps) {
  const price = (course.price_cents / 100).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  })

  const levelLabel = { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' }
  const levelColor = { beginner: 'text-emerald-400', intermediate: 'text-amber-400', advanced: 'text-rose-400' }

  const thumbnail = course.thumbnail_url
    ?? `https://img.youtube.com/vi/placeholder/mqdefault.jpg`

  return (
    <Link href={`/courses/${course.slug}`} className="block card-hover">
      <div className="glass rounded-2xl overflow-hidden group">
        <div className="relative aspect-video bg-dark-700">
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm ${levelColor[course.level]}`}>
            {levelLabel[course.level]}
          </span>
        </div>

        <div className="p-5">
          <p className="text-xs text-white/40 mb-2">{course.category}</p>
          <h3 className="font-display font-semibold text-white leading-snug mb-3 line-clamp-2">
            {course.title}
          </h3>

          {course.instructor_name && (
            <p className="text-sm text-white/50 mb-4">por {course.instructor_name}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.8
            </span>
            {course.lessons_count && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {course.lessons_count} aulas
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="font-display font-bold text-lg text-white">{price}</span>
            <span className="text-xs bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full">
              Ver curso
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
