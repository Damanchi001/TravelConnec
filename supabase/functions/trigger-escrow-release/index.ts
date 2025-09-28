import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TriggerEscrowReleaseRequest {
  bookingId: string
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

    const { bookingId }: TriggerEscrowReleaseRequest = await req.json()

    if (!bookingId) {
      throw new Error('Missing required parameter: bookingId')
    }

    console.log(`Checking escrow release for booking: ${bookingId}`)

    // Get escrow and check-in information
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (escrowError || !escrow) {
      console.log('No escrow found for booking:', bookingId)
      return new Response(
        JSON.stringify({ message: 'No escrow found for this booking' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (escrow.status === 'released') {
      console.log('Escrow already released for booking:', bookingId)
      return new Response(
        JSON.stringify({ message: 'Escrow already released' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Get check-in information
    const { data: checkIn, error: checkInError } = await supabaseClient
      .from('check_ins')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (checkInError || !checkIn) {
      console.log('No check-in found for booking:', bookingId)
      return new Response(
        JSON.stringify({ message: 'No check-in found for this booking' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Check if 24 hours have passed since check-in
    const checkInTime = new Date(checkIn.checked_in_at)
    const autoReleaseTime = new Date(checkInTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
    const now = new Date()

    if (now < autoReleaseTime) {
      const hoursRemaining = Math.ceil((autoReleaseTime.getTime() - now.getTime()) / (60 * 60 * 1000))
      console.log(`Escrow release not yet due. ${hoursRemaining} hours remaining for booking: ${bookingId}`)
      return new Response(
        JSON.stringify({
          message: `Escrow release not yet due. ${hoursRemaining} hours remaining.`,
          release_due_at: autoReleaseTime.toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Time to release escrow
    console.log(`Releasing escrow for booking: ${bookingId}`)

    // Call the release-escrow-funds function
    const { data: releaseResult, error: releaseError } = await supabaseClient.functions.invoke('release-escrow-funds', {
      body: {
        escrowId: escrow.id,
        amount: escrow.held_amount,
        reason: 'Automatic release after successful check-in',
      },
    })

    if (releaseError) {
      console.error('Error releasing escrow:', releaseError)
      throw new Error('Failed to release escrow funds')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Escrow released successfully',
        escrow: releaseResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error triggering escrow release:', error)
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