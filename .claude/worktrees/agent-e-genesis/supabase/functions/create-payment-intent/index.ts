// Supabase Edge Function: create-payment-intent
// Создаёт Stripe Payment Intent для покупки токенов / инвестиций
//
// Деплой: supabase functions deploy create-payment-intent
// Секрет: supabase secrets set STRIPE_SECRET_KEY=sk_live_... (или sk_test_...)
//
// Вызов с фронта:
//   const { data } = await supabase.functions.invoke('create-payment-intent', {
//     body: { amount_usd: 200, description: 'VOD Token x1000', application_id: '...' }
//   })
//   // → { client_secret: 'pi_xxx_secret_xxx' }

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured. Add it in Supabase → Settings → Edge Functions → Secrets');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { amount_usd, description, application_id, currency = 'usd', metadata = {} } = await req.json();

    if (!amount_usd || amount_usd < 1) {
      throw new Error('amount_usd must be at least 1');
    }

    // Stripe works in cents
    const amount_cents = Math.round(amount_usd * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: currency.toLowerCase(),
      description: description || 'VODPROM Investment',
      metadata: {
        application_id: application_id || '',
        platform: 'vodprom',
        ...metadata,
      },
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount_cents,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
