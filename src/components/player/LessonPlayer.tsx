'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface LessonPlayerProps {
  lessonId: string
  videoId: string       // buscado via Netlify Function autenticada
  onComplete?: () => void
}

export default function LessonPlayer({ lessonId, videoId, onComplete }: LessonPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout>()
  const completedRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const supabase = createClient()

  const markComplete = useCallback(async () => {
    if (completedRef.current) return
    completedRef.current = true

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await fetch('/.netlify/functions/mark-lesson-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ lessonId }),
    })

    onComplete?.()
  }, [lessonId, supabase, onComplete])

  useEffect(() => {
    if (!videoId) return

    const initPlayer = () => {
      if (!containerRef.current || playerRef.current) return

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, color: 'white' },
        events: {
          onReady: () => setReady(true),
          onError: () => setError(true),
          onStateChange: (e: any) => {
            // Inicia monitoramento quando o vídeo está tocando
            if (e.data === window.YT.PlayerState.PLAYING) {
              intervalRef.current = setInterval(() => {
                const player = playerRef.current
                if (!player?.getCurrentTime) return
                const current = player.getCurrentTime()
                const duration = player.getDuration()
                if (duration > 0 && current / duration >= 0.9) {
                  markComplete()
                  clearInterval(intervalRef.current)
                }
              }, 5000)
            } else {
              clearInterval(intervalRef.current)
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      clearInterval(intervalRef.current)
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [videoId, markComplete])

  if (error) {
    return (
      <div className="aspect-video bg-dark-700 rounded-2xl flex items-center justify-center">
        <p className="text-white/40 text-sm">Erro ao carregar o vídeo. Tente novamente.</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-dark-700 rounded-2xl overflow-hidden">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
