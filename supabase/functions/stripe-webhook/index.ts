import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabaseClient, event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(supabaseClient, event.data.object as Stripe.PaymentIntent)
        break

      case 'account.updated':
        await handleAccountUpdated(supabaseClient, event.data.object as Stripe.Account)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handlePaymentIntentSucceeded(supabaseClient: any, paymentIntent: Stripe.PaymentIntent) {
  const paymentIntentId = paymentIntent.id

  console.log(`Processing successful payment: ${paymentIntentId}`)

  // Update payment status
  const { data: payment, error: paymentError } = await supabaseClient
    .from('payments')
    .update({
      status: 'succeeded',
      paid_amount: paymentIntent.amount_received / 100, // Convert from cents
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select()
    .single()

  if (paymentError) {
    console.error('Error updating payment:', paymentError)
    throw paymentError
  }

  if (!payment) {
    console.log(`No payment record found for payment intent: ${paymentIntentId}`)
    return
  }

  // Update booking status to confirmed
  const { error: bookingError } = await supabaseClient
    .from('bookings')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.booking_id)

  if (bookingError) {
    console.error('Error updating booking:', bookingError)
    throw bookingError
  }

  // Create escrow record if it doesn't exist
  const { data: existingEscrow } = await supabaseClient
    .from('escrow')
    .select('*')
    .eq('booking_id', payment.booking_id)
    .single()

  if (!existingEscrow) {
    const { error: escrowError } = await supabaseClient
      .from('escrow')
      .insert({
        booking_id: payment.booking_id,
        status: 'held',
        held_amount: payment.host_amount,
        released_amount: 0,
      })

    if (escrowError) {
      console.error('Error creating escrow:', escrowError)
      throw escrowError
    }
  }

  // Create payout record for the host
  const { data: booking } = await supabaseClient
    .from('bookings')
    .select('host_id')
    .eq('id', payment.booking_id)
    .single()

  if (booking) {
    const { error: payoutError } = await supabaseClient
      .from('payouts')
      .insert({
        booking_id: payment.booking_id,
        host_id: booking.host_id,
        amount: payment.host_amount,
        currency: payment.currency,
        status: 'pending',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      })

    if (payoutError) {
      console.error('Error creating payout:', payoutError)
      throw payoutError
    }
  }

  console.log(`Successfully processed payment intent: ${paymentIntentId}`)
}

async function handlePaymentIntentFailed(supabaseClient: any, paymentIntent: Stripe.PaymentIntent) {
  const paymentIntentId = paymentIntent.id

  console.log(`Processing failed payment: ${paymentIntentId}`)

  // Update payment status
  const { error: paymentError } = await supabaseClient
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntentId)

  if (paymentError) {
    console.error('Error updating payment:', paymentError)
    throw paymentError
  }

  // Update booking status to cancelled
  const { data: payment } = await supabaseClient
    .from('payments')
    .select('booking_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (payment) {
    const { error: bookingError } = await supabaseClient
      .from('bookings')
      .update({
        payment_status: 'failed',
        status: 'cancelled',
        cancellation_reason: 'Payment failed',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id)

    if (bookingError) {
      console.error('Error updating booking:', bookingError)
      throw bookingError
    }
  }

  console.log(`Successfully processed failed payment intent: ${paymentIntentId}`)
}

async function handleAccountUpdated(supabaseClient: any, account: Stripe.Account) {
  const accountId = account.id

  console.log(`Processing account update: ${accountId}`)

  // Update connected account status
  const { error } = await supabaseClient
    .from('stripe_connected_accounts')
    .update({
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_account_id', accountId)

  if (error) {
    console.error('Error updating connected account:', error)
    throw error
  }

  console.log(`Successfully processed account update: ${accountId}`)
}