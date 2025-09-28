import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReleaseEscrowRequest {
  escrowId: string
  amount: number
  reason?: string
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

    const { escrowId, amount, reason }: ReleaseEscrowRequest = await req.json()

    if (!escrowId || !amount) {
      throw new Error('Missing required parameters: escrowId and amount')
    }

    console.log(`Releasing escrow funds: ${escrowId}, amount: ${amount}`)

    // Get escrow details with booking and host information
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow')
      .select(`
        *,
        bookings (
          host_id,
          stripe_connected_accounts (
            stripe_account_id
          )
        )
      `)
      .eq('id', escrowId)
      .single()

    if (escrowError || !escrow) {
      console.error('Error fetching escrow:', escrowError)
      throw new Error('Escrow not found')
    }

    if (escrow.status === 'released') {
      throw new Error('Escrow has already been released')
    }

    // Check if host has a connected Stripe account
    const connectedAccount = escrow.bookings?.stripe_connected_accounts
    if (!connectedAccount?.stripe_account_id) {
      throw new Error('Host does not have a connected Stripe account')
    }

    // Create transfer to host's connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: connectedAccount.stripe_account_id,
      transfer_group: `escrow_${escrowId}`,
      metadata: {
        escrow_id: escrowId,
        booking_id: escrow.booking_id,
        reason: reason || 'Escrow release',
      },
    })

    console.log(`Created Stripe transfer: ${transfer.id}`)

    // Update escrow status
    const { error: updateError } = await supabaseClient
      .from('escrow')
      .update({
        status: 'released',
        released_amount: amount,
        release_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', escrowId)

    if (updateError) {
      console.error('Error updating escrow:', updateError)
      throw updateError
    }

    // Update booking status to completed if escrow is released
    const { error: bookingError } = await supabaseClient
      .from('bookings')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', escrow.booking_id)

    if (bookingError) {
      console.error('Error updating booking:', bookingError)
      // Don't throw here as the escrow release was successful
    }

    return new Response(
      JSON.stringify({
        success: true,
        transfer: {
          id: transfer.id,
          amount: transfer.amount,
          destination: transfer.destination,
        },
        escrow: {
          id: escrowId,
          status: 'released',
          released_amount: amount,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error releasing escrow funds:', error)
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