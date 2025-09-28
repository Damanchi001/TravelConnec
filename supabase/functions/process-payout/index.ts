import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPayoutRequest {
  payoutId: string
  stripeAccountId: string
  amount: number
  currency?: string
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

    const { payoutId, stripeAccountId, amount, currency = 'usd' }: ProcessPayoutRequest = await req.json()

    if (!payoutId || !stripeAccountId || !amount) {
      throw new Error('Missing required parameters: payoutId, stripeAccountId, and amount')
    }

    console.log(`Processing payout: ${payoutId}, amount: ${amount} ${currency}`)

    // Verify payout exists and is in pending status
    const { data: payout, error: payoutError } = await supabaseClient
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .eq('status', 'pending')
      .single()

    if (payoutError || !payout) {
      console.error('Payout not found or not pending:', payoutError)
      throw new Error('Payout not found or not in pending status')
    }

    // Create transfer to host's connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      destination: stripeAccountId,
      transfer_group: `payout_${payoutId}`,
      metadata: {
        payout_id: payoutId,
        booking_id: payout.booking_id,
        host_id: payout.host_id,
      },
    })

    console.log(`Created Stripe transfer: ${transfer.id}`)

    // Update payout record
    const { error: updateError } = await supabaseClient
      .from('payouts')
      .update({
        stripe_transfer_id: transfer.id,
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payoutId)

    if (updateError) {
      console.error('Error updating payout:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        payout: {
          id: payoutId,
          status: 'paid',
          transfer_id: transfer.id,
          amount: amount,
          currency: currency,
          paid_at: new Date().toISOString(),
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing payout:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})