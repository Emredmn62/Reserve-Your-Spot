// Stripe Checkout for the business's yearly listing fee.
import { stripe, APP_RETURN_URL } from "../_shared/stripe.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { business_id } = await req.json();
    if (!business_id) return json({ error: "business_id required" }, 400);

    const { data: business, error } = await supabaseAdmin
      .from("businesses")
      .select("id, name")
      .eq("id", business_id)
      .single();
    if (error || !business) return json({ error: "business not found" }, 404);

    const priceId = Deno.env.get("STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID");
    if (!priceId) return json({ error: "STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID secret is not set" }, 500);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: APP_RETURN_URL,
      cancel_url: APP_RETURN_URL,
      client_reference_id: business_id,
      metadata: { kind: "subscription", business_id },
      subscription_data: { metadata: { business_id } },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("create-subscription-checkout error:", err);
    return json({ error: String(err) }, 500);
  }
});
