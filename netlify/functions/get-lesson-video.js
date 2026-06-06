// netlify/functions/get-lesson-video.js
// Retorna o youtube_video_id apenas para alunos matriculados

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Verifica JWT do usuário
  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token inválido' }) }
  }

  const lessonId = event.queryStringParameters?.lessonId
  if (!lessonId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'lessonId obrigatório' }) }
  }

  // Busca a aula e verifica se é preview ou se o usuário está matriculado
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      id, youtube_video_id, is_preview,
      modules!inner(course_id)
    `)
    .eq('id', lessonId)
    .single()

  if (lessonError || !lesson) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Aula não encontrada' }) }
  }

  // Preview: retorna sem checar matrícula
  if (lesson.is_preview) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ videoId: lesson.youtube_video_id }),
    }
  }

  // Verifica matrícula
  const courseId = lesson.modules?.course_id
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (!enrollment) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Acesso negado. Matricule-se para assistir.' }) }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ videoId: lesson.youtube_video_id }),
  }
}
