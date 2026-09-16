// Stripe Checkout for one booking, paid in full by the customer. The money
// goes straight to the business's connected Stripe account; your cut is
// taken automatically as a Stripe "application fee" (a destination charge).
import { stripe, APP_RETURN_URL, BOOKING_PLATFORM_FEE_PERCENT } from "../_shared/stripe.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { booking_id } = await req.json();
    if (!booking_id) return json({ error: "booking_id required" }, 400);

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id, business_id, total_price, service_id")
      .eq("id", booking_id)
      .single();
    if (bookingError || !booking) return json({ error: "booking not found" }, 404);

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, name, stripe_connect_account_id, stripe_connect_onboarded")
      .eq("id", booking.business_id)
      .single();
    if (businessError || !business) return json({ error: "business not found" }, 404);

    if (!business.stripe_connect_account_id || !business.stripe_connect_onboarded) {
      return json({ error: "This business hasn't connected Stripe yet - they can't take payments." }, 400);
    }

    const { data: service } = await supabaseAdmin
      .from("services")
      .select("name")
      .eq("id", booking.service_id)
      .maybeSingle();

    const amountPence = Math.round(Number(booking.total_price) * 100);
    const feePence = Math.round(amountPence * BOOKING_PLATFORM_FEE_PERCENT);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: amountPence,
            product_data: {
              name: service?.name ?? "Booking",
              description: business.name,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: feePence,
        transfer_data: { destination: business.stripe_connect_account_id },
      },
      success_url: APP_RETURN_URL,
      cancel_url: APP_RETURN_URL,
      metadata: { kind: "booking", booking_id },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("create-booking-checkout error:", err);
    return json({ error: String(err) }, 500);
  }
});
