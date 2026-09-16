// The single Stripe webhook endpoint. Register this URL in the Stripe
// dashboard listening for: checkout.session.completed,
// customer.subscription.updated, customer.subscription.deleted,
// account.updated. See STRIPE_SETUP.md.
import type Stripe from "npm:stripe@^17.0.0";
import { stripe, BOOKING_PLATFORM_FEE_PERCENT } from "../_shared/stripe.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or STRIPE_WEBHOOK_SECRET", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // constructEventAsync (not constructEvent) - Deno has no Node crypto module.
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChanged(event.data.object as Stripe.Subscription);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Still 200 back to Stripe once signature is verified, to avoid endless
    // retries on a bug in our own handling - but log loudly so it's noticed.
    return new Response(JSON.stringify({ received: true, handlerError: String(err) }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const kind = session.metadata?.kind;

  if (kind === "booking" && session.metadata?.booking_id) {
    const bookingId = session.metadata.booking_id;

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, customer_id, business_id, total_price")
      .eq("id", bookingId)
      .single();
    if (!booking) return;

    await supabaseAdmin
      .from("bookings")
      .update({ status: "confirmed", deposit_paid: true })
      .eq("id", bookingId);

    const amount = Number(booking.total_price);
    const fee = Math.round(amount * BOOKING_PLATFORM_FEE_PERCENT * 100) / 100;

    await supabaseAdmin.from("payments").insert({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      business_id: booking.business_id,
      amount,
      currency: "gbp",
      type: "full",
      status: "succeeded",
      platform_fee: fee,
      business_amount: Math.round((amount - fee) * 100) / 100,
      stripe_payment_intent_id: session.payment_intent as string | null,
    });
  }

  if (kind === "subscription" && session.metadata?.business_id) {
    const businessId = session.metadata.business_id;
    const renewsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from("businesses")
      .update({ subscription_status: "active", subscription_renews_at: renewsAt })
      .eq("id", businessId);

    await maybeGoLive(businessId);
  }
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.business_id;
  if (!businessId) return;

  const status = subscription.status === "active" || subscription.status === "trialing"
    ? "active"
    : subscription.status === "past_due"
    ? "past_due"
    : "canceled";

  await supabaseAdmin.from("businesses").update({ subscription_status: status }).eq("id", businessId);

  if (status === "active") {
    await maybeGoLive(businessId);
  } else {
    // Not paying -> hide the listing again. Their data is untouched.
    await supabaseAdmin.from("businesses").update({ is_approved: false }).eq("id", businessId);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("stripe_connect_account_id", account.id)
    .maybeSingle();
  if (!business) return;

  const onboarded = Boolean(account.charges_enabled && account.payouts_enabled);
  await supabaseAdmin.from("businesses").update({ stripe_connect_onboarded: onboarded }).eq("id", business.id);

  if (onboarded) await maybeGoLive(business.id);
}

/// A business only goes live once it's both subscribed AND can receive money.
async function maybeGoLive(businessId: string) {
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("subscription_status, stripe_connect_onboarded")
    .eq("id", businessId)
    .single();

  if (business?.subscription_status === "active" && business?.stripe_connect_onboarded) {
    await supabaseAdmin.from("businesses").update({ is_approved: true }).eq("id", businessId);
  }
}
