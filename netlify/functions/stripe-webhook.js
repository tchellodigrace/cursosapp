// netlify/functions/stripe-webhook.js

const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const sig = event.headers['stripe-signature']
  let stripeEvent

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return { statusCode: 400, body: `Webhook error: ${err.message}` }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    const { courseId, userId } = session.metadata || {}

    if (!courseId || !userId) {
      console.error('Metadata incompleta no evento Stripe')
      return { statusCode: 400, body: 'Metadata ausente' }
    }

    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        stripe_payment_id: session.payment_intent,
      })

    if (error && !error.message.includes('duplicate')) {
      console.error('Erro ao criar matrícula:', error)
      return { statusCode: 500, body: 'Erro ao processar matrícula' }
    }

    console.log(`✓ Matrícula criada: user=${userId} course=${courseId}`)
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
