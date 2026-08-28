import { supabase } from './supabase';
import { Payment } from '../types';
import { PLATFORM_FEE_PERCENT, SUPABASE_URL } from '../constants/AppConstants';

export const paymentService = {
  async createPaymentIntent(
    bookingId: string,
    amount: number,
    currency = 'gbp'
  ): Promise<{ clientSecret: string | null; error: string | null }> {
    // Calls a Supabase Edge Function that wraps Stripe
    // Deploy this function to: supabase/functions/create-payment-intent/index.ts
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ bookingId, amount: Math.round(amount * 100), currency }),
      });

      if (!response.ok) {
        const err = await response.json();
        return { clientSecret: null, error: err.message ?? 'Payment setup failed.' };
      }

      const { clientSecret } = await response.json();
      return { clientSecret, error: null };
    } catch (e: any) {
      return { clientSecret: null, error: e.message ?? 'Network error.' };
    }
  },

  async recordPayment(payment: Partial<Payment>): Promise<{ data: Payment | null; error: string | null }> {
    const platformFee = (payment.amount ?? 0) * PLATFORM_FEE_PERCENT;
    const businessAmount = (payment.amount ?? 0) - platformFee;

    const { data, error } = await supabase
      .from('payments')
      .insert({ ...payment, platform_fee: platformFee, business_amount: businessAmount })
      .select()
      .single();

    return { data: data as Payment | null, error: error?.message ?? null };
  },

  async confirmDepositPaid(bookingId: string, stripeIntentId: string): Promise<{ error: string | null }> {
    const { error: bookingErr } = await supabase
      .from('bookings')
      .update({ deposit_paid: true, status: 'confirmed' })
      .eq('id', bookingId);

    if (bookingErr) return { error: bookingErr.message };

    const { error: payErr } = await supabase
      .from('payments')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', stripeIntentId);

    return { error: payErr?.message ?? null };
  },

  async refundDeposit(paymentId: string): Promise<{ error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/refund-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        const err = await response.json();
        return { error: err.message ?? 'Refund failed.' };
      }

      await supabase.from('payments').update({ status: 'refunded' }).eq('id', paymentId);
      return { error: null };
    } catch (e: any) {
      return { error: e.message ?? 'Refund error.' };
    }
  },

  async getBusinessPayments(businessId: string): Promise<Payment[]> {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    return (data as Payment[]) ?? [];
  },

  calculateDeposit(price: number, depositPercentage: number): number {
    return Math.round((price * depositPercentage) / 100 * 100) / 100;
  },
};

/*
============================================================
SUPABASE EDGE FUNCTION — create-payment-intent
Save as: supabase/functions/create-payment-intent/index.ts
============================================================

import Stripe from 'https://esm.sh/stripe@14.0.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });

serve(async (req) => {
  const { bookingId, amount, currency } = await req.json();
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { bookingId, userId: user.id },
  });

  return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
============================================================
*/
