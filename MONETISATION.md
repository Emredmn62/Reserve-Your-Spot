# Reserve Your Spot — pricing & how businesses get paid

> Superseded the original £10/month-no-fee plan below with the model we
> settled on: a small yearly fee plus a per-booking commission. Cheaper to
> try, scales with how well the app actually works for each business.

## The plan

| | |
|---|---|
| **Listing fee** | **£20 / year** per business (edit `AppConstants.SubscriptionYearlyPrice` for a different number) |
| **Booking cut** | **5%** of every booking, taken automatically via Stripe |
| **How money moves** | Customer pays the full price in-app. Stripe splits it instantly: 95% straight to the business's own bank, 5% to yours. You never hold customer money. |
| **Onboarding** | **Invite-only.** A business needs a valid, unused invite code to create a listing — one code per business. |
| **Going live** | A listing is **Pending** until BOTH: the £20/year fee is paid, and the business has connected a Stripe account to receive money. Then it's visible to customers. |

Full implementation details, secrets, and the deploy steps are in **`STRIPE_SETUP.md`**.

### Why this over a flat monthly fee
With zero businesses on the app on day one, the biggest problem isn't
revenue — it's convincing the *first* businesses to bother signing up. £20/year
is a low-risk "sure, why not" compared to a recurring monthly bill for an app
with no track record yet. And taking 5% of bookings means you only make real
money once the app is actually generating business for them — your incentives
line up with theirs. This is close to how Fresha built its market share against
subscription-only rivals like Booksy.

---

## What's built (works right now on mock data, no backend needed)

- **Business model** (`Models/Business.cs`): `SubscriptionStatus`, `SubscriptionRenewsAt`,
  `StripeConnectAccountId`, `StripeConnectOnboarded`, and `IsReadyToGoLive` (both true)
- **Invite code gate** on Setup Your Business (`IReferralService`, seed codes `FOUNDER-001..003` in mock)
- **Dashboard "Step 1 / Step 2" banners** — Subscribe, then Connect to Stripe — both required before a listing goes live; a green "You're live" banner once it has
- **Full in-app payment** for bookings (not a deposit) — `PaymentPage` sends the customer to Stripe Checkout for the whole service price, waits for confirmation, then shows the booking as confirmed
- **`IPaymentService`** redesigned around Stripe Checkout: `CreateBookingCheckoutAsync`, `CreateSubscriptionCheckoutAsync`, `CreateConnectOnboardingLinkAsync` — each returns a URL the app opens in the browser
- **Real backend code, ready to deploy**: `Services/PaymentService.cs`, `Services/ReferralService.cs`, and four Supabase Edge Functions in `supabase/functions/` that actually talk to Stripe
- Mock versions of everything above so the whole flow is demoable with zero setup — Subscribe/Connect/Pay all complete instantly with no real money moving

## What only you can do — see STRIPE_SETUP.md for the exact steps

1. Create a Stripe account, turn on **Connect**
2. Create the £20/year recurring price
3. `supabase functions deploy` the four functions already written
4. Set the Stripe secrets (`supabase secrets set ...`)
5. Add the webhook endpoint in the Stripe dashboard
6. Paste your real keys into `AppConstants.cs`
7. Flip `MauiProgram.cs` from `Mock*` services to the real ones

---

## The full flow, end to end

1. Business signs up → "I'm a business owner" → **Setup Your Business** → enters
   a valid **invite code** → listing created as **Pending**, code marked used
2. Dashboard shows **Step 1: Subscribe — £20/year** → Stripe Checkout → paid
3. Dashboard shows **Step 2: Connect to Stripe** → Stripe Express onboarding
   (ID + bank details, hosted by Stripe) → completed
4. Webhook sees both are done → flips `is_approved = true` → listing now
   appears in customer search and the feed
5. Business adds services, staff, posts
6. Customer books a service → pays the **full price** in-app via Stripe
   Checkout → webhook confirms → 95% goes to the business, 5% to you,
   booking flips to **Confirmed**
7. If the business's subscription lapses or is cancelled, the webhook flips
   `is_approved = false` again — listing hidden, nothing deleted

## Handing out invite codes

Once real: in the Supabase SQL editor,
```sql
insert into referral_codes (code, issued_to) values ('BARBER-JON', 'Jon @ Fade St');
```
Give `BARBER-JON` to that one business. It's consumed the moment they sign up with it.
