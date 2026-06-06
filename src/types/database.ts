export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'instructor' | 'admin'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      courses: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          thumbnail_url: string | null
          price_cents: number
          instructor_id: string
          is_published: boolean
          category: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          position: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['modules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          youtube_video_id: string | null
          duration_seconds: number | null
          position: number
          is_preview: boolean
          type: 'video' | 'text' | 'quiz'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          stripe_payment_id: string | null
          enrolled_at: string
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'enrolled_at'>
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lesson_progress']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lesson_progress']['Insert']>
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          issued_at: string
        }
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'issued_at'>
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>
      }
    }
  }
}

// Tipos auxiliares para uso nos componentes
export type Course = Database['public']['Tables']['courses']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Module = Database['public']['Tables']['modules']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
