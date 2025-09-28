import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotifyEscrowDisputeRequest {
  escrowId: string
  reason: string
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

    const { escrowId, reason }: NotifyEscrowDisputeRequest = await req.json()

    if (!escrowId || !reason) {
      throw new Error('Missing required parameters: escrowId and reason')
    }

    console.log(`Notifying escrow dispute: ${escrowId}, reason: ${reason}`)

    // Get escrow details with booking and user information
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow')
      .select(`
        *,
        bookings (
          id,
          guest_id,
          host_id,
          booking_code,
          user_profiles_guest:guest_id (
            id,
            first_name,
            last_name,
            email
          ),
          user_profiles_host:host_id (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', escrowId)
      .single()

    if (escrowError || !escrow) {
      console.error('Error fetching escrow:', escrowError)
      throw new Error('Escrow not found')
    }

    const booking = escrow.bookings
    const guest = booking?.user_profiles_guest
    const host = booking?.user_profiles_host

    if (!guest || !host) {
      throw new Error('Guest or host information not found')
    }

    // Create notifications for both guest and host
    const notifications = [
      {
        user_id: guest.id,
        type: 'escrow_dispute',
        title: 'Escrow Dispute Filed',
        message: `A dispute has been filed for your booking ${booking.booking_code}. Reason: ${reason}`,
        data: {
          escrow_id: escrowId,
          booking_id: booking.id,
          dispute_reason: reason,
        },
      },
      {
        user_id: host.id,
        type: 'escrow_dispute',
        title: 'Escrow Dispute Filed',
        message: `A dispute has been filed for booking ${booking.booking_code}. Reason: ${reason}`,
        data: {
          escrow_id: escrowId,
          booking_id: booking.id,
          dispute_reason: reason,
        },
      },
    ]

    // Insert notifications
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Error creating notifications:', notificationError)
      // Don't throw here as the dispute was already filed
    }

    // TODO: Send email notifications if email service is configured
    // This could integrate with SendGrid, Postmark, or similar service

    console.log(`Successfully notified parties about escrow dispute: ${escrowId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dispute notifications sent successfully',
        escrow_id: escrowId,
        notified_users: [guest.id, host.id],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error notifying escrow dispute:', error)
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