// useStripePayment — хук для создания Stripe Payment Intent через Supabase Edge Function
//
// Использование:
//   const { createPaymentIntent, loading, error } = useStripePayment()
//   const { client_secret } = await createPaymentIntent({ amount_usd: 200, description: 'VOD x1000' })

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PaymentIntentOptions {
  amount_usd: number;
  description?: string;
  application_id?: string;
  currency?: string;
}

interface PaymentIntentResult {
  client_secret: string;
  payment_intent_id: string;
  amount_cents: number;
}

export function useStripePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (opts: PaymentIntentOptions): Promise<PaymentIntentResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
        body: opts,
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data as PaymentIntentResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Stripe error';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPaymentIntent, loading, error };
}
