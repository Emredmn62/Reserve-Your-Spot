import Stripe from "npm:stripe@^17.0.0";

// STRIPE_SECRET_KEY is set with: supabase secrets set STRIPE_SECRET_KEY=sk_...
export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(), // Deno has no Node net APIs - use fetch
});

// Keep in sync with Reserve Your Spot/Constants/AppConstants.cs -> BookingPlatformFeePercent.
// Overridable via `supabase secrets set BOOKING_PLATFORM_FEE_PERCENT=0.05` without a redeploy.
export const BOOKING_PLATFORM_FEE_PERCENT =
  Number(Deno.env.get("BOOKING_PLATFORM_FEE_PERCENT")) || 0.05;

// Where Stripe sends the customer back after Checkout / Connect onboarding.
// The app is polling in the background, so this just needs to be a page that
// says "you're done, you can close this / go back to the app". See
// payment-complete.html in the repo root - host it (e.g. GitHub Pages) and
// set this to its URL with: supabase secrets set APP_RETURN_URL=https://...
export const APP_RETURN_URL =
  Deno.env.get("APP_RETURN_URL") ?? "https://example.com/payment-complete.html";
