// netlify/functions/mark-lesson-complete.js

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

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Não autorizado' }) }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token inválido' }) }
  }

  const { lessonId } = JSON.parse(event.body || '{}')
  if (!lessonId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'lessonId obrigatório' }) }

  // Marca aula como concluída (upsert)
  const { error: progressError } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })

  if (progressError) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: progressError.message }) }
  }

  // Verifica se o curso foi 100% concluído
  const { data: lesson } = await supabase
    .from('lessons')
    .select('modules!inner(course_id)')
    .eq('id', lessonId)
    .single()

  const courseId = lesson?.modules?.course_id
  if (!courseId) return { statusCode: 200, headers, body: JSON.stringify({ completed: true }) }

  // Conta total de aulas do curso
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .in('module_id',
      supabase.from('modules').select('id').eq('course_id', courseId)
    )

  // Conta aulas concluídas pelo aluno nesse curso
  const { count: completedLessons } = await supabase
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', true)
    .in('lesson_id',
      supabase.from('lessons').select('id')
        .in('module_id', supabase.from('modules').select('id').eq('course_id', courseId))
    )

  let certificateIssued = false
  if (totalLessons && completedLessons && completedLessons >= totalLessons) {
    // Emite certificado (ignora conflito se já existe)
    const { error: certError } = await supabase
      .from('certificates')
      .insert({ user_id: user.id, course_id: courseId })

    if (!certError) certificateIssued = true
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ completed: true, certificateIssued }),
  }
}
