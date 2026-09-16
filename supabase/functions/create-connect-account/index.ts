// Creates (or reuses) a Stripe Express connected account for a business and
// returns a Stripe-hosted onboarding link. The app opens this URL in the
// browser; the business fills in ID + bank details on Stripe's own page.
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
      .select("id, name, stripe_connect_account_id")
      .eq("id", business_id)
      .single();
    if (error || !business) return json({ error: "business not found" }, 404);

    let accountId: string | null = business.stripe_connect_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        business_profile: { name: business.name },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await supabaseAdmin
        .from("businesses")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", business_id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: APP_RETURN_URL,
      return_url: APP_RETURN_URL,
      type: "account_onboarding",
    });

    return json({ url: accountLink.url });
  } catch (err) {
    console.error("create-connect-account error:", err);
    return json({ error: String(err) }, 500);
  }
});
