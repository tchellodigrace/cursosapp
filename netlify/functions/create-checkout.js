// netlify/functions/create-checkout.js

const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
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
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Faça login para continuar' }) }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Sessão expirada. Faça login novamente.' }) }
  }

  const { courseId } = JSON.parse(event.body || '{}')
  if (!courseId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'courseId obrigatório' }) }

  // Verifica se já está matriculado
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existing) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Você já está matriculado neste curso.' }) }
  }

  // Busca dados do curso
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, price_cents, thumbnail_url, slug')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (courseError || !course) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Curso não encontrado' }) }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: {
          name: course.title,
          images: course.thumbnail_url ? [course.thumbnail_url] : [],
        },
        unit_amount: course.price_cents,
      },
      quantity: 1,
    }],
    metadata: {
      courseId: course.id,
      userId: user.id,
    },
    success_url: `${siteUrl}/courses/${course.slug}?success=true`,
    cancel_url: `${siteUrl}/courses/${course.slug}?canceled=true`,
  })

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ url: session.url }),
  }
}
