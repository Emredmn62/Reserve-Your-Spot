# Getting paid — the checklist

Everything Stripe-related is already written: the app, the payment screens, and
the four backend functions in `supabase/functions/`. This is the list of
things only you can do — accounts, keys, and one deploy command each.

**You need Supabase set up first** (see `README.md` → Quick Start → 1. Set up
Supabase) — the payment functions live inside that project.

---

## 1. Create your Stripe account

1. [stripe.com](https://stripe.com) → create an account for your business (or yourself).
2. **Activate Stripe Connect**: Dashboard → search "Connect" → **Get started**.
   Choose **Platform or marketplace**. This is what lets *other people's*
   bank accounts receive money through your app.
3. Dashboard → **Developers → API keys**. Copy the **Publishable key** and
   **Secret key** (test mode first — switch to live mode later, same steps).

## 2. Create the yearly listing price

1. Dashboard → **Product catalog → + Add product**.
2. Name: `Reserve Your Spot — Business Listing`.
3. Pricing: **Recurring**, **Yearly**, **£20.00** (or whatever you set
   `SubscriptionYearlyPrice` to in `AppConstants.cs`).
4. Save, then copy the **Price ID** (`price_...`) — you'll need it in step 4.

## 3. Deploy the payment functions

In a terminal, from the repo root (`Reserve Your Spot/`, the one with `supabase/` in it):

```bash
npm install -g supabase
```
```bash
supabase login
```
```bash
supabase init
```
```bash
supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
```
(Project ref is in your Supabase dashboard URL: `supabase.com/dashboard/project/`**`abcdefgh`**)

```bash
supabase functions deploy create-connect-account create-subscription-checkout create-booking-checkout stripe-webhook
```

## 4. Set the secrets the functions read

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID=price_...
supabase secrets set APP_RETURN_URL=https://YOUR_GITHUB_USERNAME.github.io/Reserve-Your-Spot/payment-complete.html
```

`payment-complete.html` is already in the repo — turn on GitHub Pages once
(**Settings → Pages → Deploy from branch → main → / (root)**) and that URL
will work. It's a plain "you're done, close this tab" page — the app doesn't
need a deep link, it polls in the background.

## 5. Point the webhook at your function

1. Dashboard → **Developers → Webhooks → + Add endpoint**.
2. Endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Listen for these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `account.updated`
4. Save, then open the endpoint and copy its **Signing secret** (`whsec_...`):

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 6. Tell the app about your keys

In `Reserve Your Spot/Constants/AppConstants.cs`:

```csharp
public const string SupabaseUrl = "https://YOUR_PROJECT_REF.supabase.co";
public const string SupabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
public const string StripePublishableKey = "pk_test_...";
```

(The `StripeSubscriptionYearlyPriceId` constant in the same file isn't used by
the app directly — the Edge Function reads the price from its own secret in
step 4 — but keep it updated for reference.)

## 7. Switch from mock to real

In `Reserve Your Spot/MauiProgram.cs` → `RegisterServices`, swap:

```csharp
services.AddSingleton<IAuthService, MockAuthService>();
services.AddSingleton<IBusinessService, MockBusinessService>();
services.AddSingleton<IBookingService, MockBookingService>();
services.AddSingleton<IPaymentService, MockPaymentService>();
services.AddSingleton<IReferralService, MockReferralService>();
```

for:

```csharp
services.AddSingleton<IAuthService, AuthService>();
services.AddSingleton<IBusinessService, BusinessService>();
services.AddSingleton<IBookingService, BookingService>();
services.AddSingleton<IPaymentService, PaymentService>();
services.AddSingleton<IReferralService, ReferralService>();
```

Rebuild (`dotnet build ... -c Release`), test with a **real card in test
mode** (Stripe's test card `4242 4242 4242 4242`, any future date, any CVC)
end to end: create a business → subscribe → connect a test bank account
(Stripe gives you fake test details in Connect's test mode) → book a service
as a customer → confirm the booking shows Confirmed and a row appears in
`payments`.

---

## How the money actually moves

```
Customer pays £30 for a haircut
        │
        ▼
Stripe Checkout (hosted page, card never touches your app)
        │
        ├── 95% (£28.50) ──► the business's own Stripe balance ──► their bank
        └──  5% (£1.50)  ──► your Stripe balance ──► your bank
```

You never hold customer money — Stripe splits it in the same transaction.
That's what keeps you out of UK e-money/payment-institution licensing.

## What's mocked vs real, one more time

| | Mock (now) | Real (after this checklist) |
|---|---|---|
| Business subscribes | Instantly flips a flag, no money moves | Real Stripe Checkout, real £20/year charge |
| Business connects Stripe | Instantly flips a flag | Real Stripe Express onboarding |
| Customer pays for a booking | Instantly marked paid, no money moves | Real Stripe Checkout, real split payment |
