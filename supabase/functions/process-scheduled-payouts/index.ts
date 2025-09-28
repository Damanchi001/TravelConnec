import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('Processing scheduled payouts...')

    // Get all pending payouts that are scheduled for processing
    const now = new Date().toISOString()

    const { data: pendingPayouts, error: payoutsError } = await supabaseClient
      .from('payouts')
      .select(`
        *,
        bookings (
          host_id,
          stripe_connected_accounts (
            stripe_account_id,
            charges_enabled,
            payouts_enabled
          )
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now)

    if (payoutsError) {
      console.error('Error fetching pending payouts:', payoutsError)
      throw payoutsError
    }

    if (!pendingPayouts || pendingPayouts.length === 0) {
      console.log('No pending payouts to process')
      return new Response(
        JSON.stringify({
          message: 'No pending payouts to process',
          processed: 0,
          failed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Filter payouts where host account is ready
    const eligiblePayouts = pendingPayouts.filter(payout =>
      payout.bookings?.stripe_connected_accounts?.charges_enabled &&
      payout.bookings?.stripe_connected_accounts?.payouts_enabled &&
      payout.bookings?.stripe_connected_accounts?.stripe_account_id
    )

    console.log(`Found ${eligiblePayouts.length} eligible payouts out of ${pendingPayouts.length} pending`)

    let processed = 0
    let failed = 0
    const results = []

    // Process each eligible payout
    for (const payout of eligiblePayouts) {
      try {
        console.log(`Processing payout ${payout.id} for host ${payout.bookings.host_id}`)

        // Call the process-payout function
        const { data: payoutResult, error: payoutError } = await supabaseClient.functions.invoke('process-payout', {
          body: {
            payoutId: payout.id,
            stripeAccountId: payout.bookings.stripe_connected_accounts.stripe_account_id,
            amount: payout.amount,
            currency: payout.currency,
          },
        })

        if (payoutError) {
          console.error(`Failed to process payout ${payout.id}:`, payoutError)
          failed++

          // Update payout status to failed
          await supabaseClient
            .from('payouts')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('id', payout.id)

          results.push({
            payoutId: payout.id,
            status: 'failed',
            error: payoutError.message,
          })
        } else {
          console.log(`Successfully processed payout ${payout.id}`)
          processed++
          results.push({
            payoutId: payout.id,
            status: 'success',
            transferId: payoutResult.payout.transfer_id,
          })
        }
      } catch (error) {
        console.error(`Error processing payout ${payout.id}:`, error)
        failed++

        // Update payout status to failed
        await supabaseClient
          .from('payouts')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', payout.id)

        results.push({
          payoutId: payout.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(`Scheduled payout processing complete. Processed: ${processed}, Failed: ${failed}`)

    return new Response(
      JSON.stringify({
        message: 'Scheduled payout processing complete',
        processed,
        failed,
        total: eligiblePayouts.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing scheduled payouts:', error)
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