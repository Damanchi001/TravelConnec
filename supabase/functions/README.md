# Supabase Edge Functions for Stripe Integration

This directory contains Supabase Edge Functions that handle Stripe webhook processing, escrow management, and payout processing for the travel platform.

## Functions Overview

### 1. `stripe-webhook`
Handles incoming Stripe webhooks for payment events.

**Events Handled:**
- `payment_intent.succeeded`: Updates payment and booking status, creates escrow
- `payment_intent.payment_failed`: Updates payment and booking status to failed
- `account.updated`: Updates connected account status

**Environment Variables Required:**
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `STRIPE_SECRET_KEY`: Stripe secret key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### 2. `release-escrow-funds`
Releases escrow funds to the host's Stripe connected account.

**Triggers:**
- Called automatically after successful check-in (24 hours)
- Can be called manually for dispute resolution

**Parameters:**
```json
{
  "escrowId": "uuid",
  "amount": 100.00,
  "reason": "Automatic release after check-in"
}
```

### 3. `process-payout`
Processes individual payouts to hosts.

**Parameters:**
```json
{
  "payoutId": "uuid",
  "stripeAccountId": "acct_...",
  "amount": 100.00,
  "currency": "usd"
}
```

### 4. `trigger-escrow-release`
Checks if escrow should be released based on check-in time.

**Parameters:**
```json
{
  "bookingId": "uuid"
}
```

**Logic:**
- Checks if 24 hours have passed since check-in
- Automatically calls `release-escrow-funds` if conditions are met

### 5. `process-scheduled-payouts`
Processes all pending payouts that are due for payment.

**Triggers:**
- Should be called by a cron job or scheduled task
- Processes all eligible payouts in batch

### 6. `notify-escrow-dispute`
Sends notifications when escrow is disputed.

**Parameters:**
```json
{
  "escrowId": "uuid",
  "reason": "Dispute reason"
}
```

## Deployment

### Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Logged into Supabase: `supabase login`
3. Linked to project: `supabase link --project-ref your-project-ref`

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy

# Deploy individual function
supabase functions deploy stripe-webhook
supabase functions deploy release-escrow-funds
# ... etc
```

### Set Environment Variables
```bash
# Set required environment variables
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_SECRET_KEY=sk_...
```

## Webhook Configuration

### Stripe Dashboard Setup
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Database Tables

The functions interact with these database tables:
- `payments`: Payment transactions
- `bookings`: Booking records
- `escrow`: Escrow holdings
- `payouts`: Host payouts
- `check_ins`: Check-in records
- `stripe_connected_accounts`: Host Stripe accounts
- `notifications`: User notifications

## Error Handling

All functions include comprehensive error handling:
- Invalid webhook signatures are rejected
- Database errors are logged and handled gracefully
- Stripe API errors are caught and reported
- Functions return appropriate HTTP status codes

## Security

- Webhook signatures are verified using Stripe's signing secret
- All database operations use service role key for admin access
- CORS headers are properly configured
- Sensitive data is not logged

## Monitoring

Monitor function performance and errors in:
- Supabase Dashboard → Edge Functions
- Stripe Dashboard → Events & Webhooks
- Application logs for detailed error information

## Testing

Test functions locally using:
```bash
# Serve functions locally
supabase functions serve

# Test webhook endpoint
curl -X POST http://localhost:54321/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: ..." \
  -d @test-webhook-payload.json