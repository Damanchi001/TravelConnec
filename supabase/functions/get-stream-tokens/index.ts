import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenRequest {
  userId: string
}

interface TokenResponse {
  chatToken: string
  videoToken: string
  feedsToken: string
}

serve(async (req) => {
  console.log('[get-stream-tokens] Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[get-stream-tokens] No authorization header');
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    console.log('[get-stream-tokens] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      error: userError?.message
    });

    if (userError || !user) {
      console.error('[get-stream-tokens] Invalid user token:', userError);
      throw new Error('Invalid user token')
    }

    const { userId }: TokenRequest = await req.json()
    console.log('[get-stream-tokens] Request body:', { userId });

    if (!userId) {
      console.error('[get-stream-tokens] userId is required');
      throw new Error('userId is required')
    }

    if (userId !== user.id) {
      console.error('[get-stream-tokens] Unauthorized: userId mismatch', { requested: userId, authenticated: user.id });
      throw new Error('Unauthorized: userId does not match authenticated user')
    }

    const chatSecret = Deno.env.get('STREAM_CHAT_SECRET')
    const videoSecret = Deno.env.get('STREAM_VIDEO_SECRET')
    const feedsSecret = Deno.env.get('STREAM_FEEDS_SECRET')

    console.log('[get-stream-tokens] Environment check:', {
      hasChatSecret: !!chatSecret,
      hasVideoSecret: !!videoSecret,
      hasFeedsSecret: !!feedsSecret
    });

    if (!chatSecret || !videoSecret || !feedsSecret) {
      console.warn('[get-stream-tokens] Missing secrets, using mock tokens');
      const tokens: TokenResponse = {
        chatToken: generateMockToken(userId, 'chat'),
        videoToken: generateMockToken(userId, 'video'),
        feedsToken: generateMockToken(userId, 'feeds'),
      }

      console.log('[get-stream-tokens] Returning mock tokens');
      return new Response(JSON.stringify(tokens), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log('[get-stream-tokens] Generating real tokens');
    const tokens: TokenResponse = {
      chatToken: await generateStreamToken(userId, chatSecret),
      videoToken: await generateStreamToken(userId, videoSecret),
      feedsToken: await generateStreamToken(userId, feedsSecret),
    }

    console.log('[get-stream-tokens] Tokens generated successfully');
    return new Response(JSON.stringify(tokens), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[get-stream-tokens] Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// Helper function for base64url encoding
function base64urlEncode(input: string): string {
  return btoa(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateStreamToken(userId: string, secret: string): Promise<string> {
  console.log(`[generateStreamToken] Generating token for user: ${userId}`);

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64urlEncode(JSON.stringify({
    user_id: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24*60*60,
  }));

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const data = `${header}.${payload}`;
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureB64 = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));

  const token = `${header}.${payload}.${signatureB64}`;
  console.log(`[generateStreamToken] Generated token: ${token.substring(0, 50)}...`);

  return token;
}

function generateMockToken(userId: string, service: string): string {
  console.log(`[generateMockToken] Generating mock token for user: ${userId}, service: ${service}`);

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64urlEncode(JSON.stringify({
    user_id: userId,
    service,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24*60*60,
  }));
  const signature = base64urlEncode('mock-signature');

  const token = `${header}.${payload}.${signature}`;
  console.log(`[generateMockToken] Generated mock token: ${token.substring(0, 50)}...`);

  return token;
}
