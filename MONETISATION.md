# Reserve Your Spot — pricing & how businesses pay

## The plan

| | |
|---|---|
| **Price** | **£10 / month** per business |
| **Free trial** | **First 3 months free**, then billed monthly |
| **Booking cut** | **None.** We don't take a percentage of deposits (competitors like Fresha do). The subscription is the whole model. |
| **Onboarding** | **Invite-only.** A business needs a valid invite code — **one code per business** — to create a listing. |
| **Going live** | A new listing is **Pending**. It only appears to customers once the subscription is **active**. |

Constants live in `Reserve Your Spot/Constants/AppConstants.cs`
(`SubscriptionMonthlyPrice`, `FreeTrialMonths`, `DepositPlatformFeePercent = 0`).

### Why £10 (not £15)
Booksy / Setmore / Acuity sit at £15–30/mo. £10 undercuts everyone and is an
easy "yes" for a brand-new app with no reputation yet. Once you have reviews and
a few hundred businesses you can raise it for *new* signups and grandfather early
ones. **Founder option:** offer the first ~20 businesses **£5/mo locked forever** —
creates urgency and rewards the people who took the risk early.

---

## What's already built (works on mock data, no backend)

- Single £10 plan + 3-month-trial copy in the business signup flow
- **Invite code field** on "Setup Your Business" — required, validated, one-per-business
  (`IReferralService` / `MockReferralService`, seed codes `FOUNDER-001..003`)
- New listings are created **Pending** (`IsApproved = false`); customers only ever
  see approved listings (`MockBusinessService` filters on `IsApproved`)
- The app starts **empty** — no demo businesses

## What still needs the real backend (only you can start these)

### 1. Supabase (free tier)
- Create a project at supabase.com
- Run the SQL in `Reserve Your Spot/Services/SupabaseService.cs` (comment block)
- Add two tables:
  ```sql
  create table referral_codes (
    code text primary key,
    issued_to text,
    used_by_business_id uuid references businesses(id),
    created_at timestamptz default now(),
    used_at timestamptz
  );
  alter table businesses add column subscription_status text default 'none';
  -- values: none | trialing | active | past_due | canceled
  ```
- Put URL + anon key in `AppConstants.cs`

### 2. Stripe (you — needs your identity + bank details, I can't do this)
- Create a Stripe account, add your bank for payouts
- **Products → add a product** "Reserve Your Spot — Business", recurring, £10/month,
  **add a free trial of 3 months** on the price (or set `trial_period_days: 90`
  when creating the subscription)
- Copy the **Price ID** (`price_...`) into `AppConstants.StripeSubscriptionPriceId`
- Copy the publishable key into `AppConstants.StripePublishableKey`
- Money from every subscription lands in **your** Stripe balance and pays out to
  **your** bank automatically. No Stripe Connect needed — you're the only merchant.

### 3. Supabase Edge Functions (I can write these once you have keys)
| Function | Does |
|---|---|
| `create-subscription-checkout` | Business taps "Subscribe" → returns a Stripe Checkout URL for the £10 plan with the 3-month trial |
| `stripe-webhook` | Stripe calls this on `checkout.session.completed`, `customer.subscription.updated/deleted` → sets `businesses.subscription_status` and flips `is_approved` to true when `active`/`trialing`, false when `canceled`/`past_due` |

### 4. App changes (I do these once the above exists)
- Swap the 4 `Mock*` lines in `MauiProgram.RegisterServices` for the real
  `AuthService` / `BusinessService` / `BookingService` / `PaymentService`
- Real `ReferralService` hitting the `referral_codes` table
- Business **Dashboard**: if `subscription_status` is `none`, show a
  "You're pending — Subscribe to go live" banner + button that opens the
  Checkout URL. If `trialing`, show "Free trial — N days left".
- A tiny **admin** way to mint invite codes (either the existing `booklocal-web`
  admin panel, or just `insert into referral_codes` by hand at first)

---

## The full flow, end to end

1. Business installs the app → **Sign up** → "I'm a business owner"
2. **Setup Your Business** → fills profile + enters **invite code** → listing saved as **Pending**, code marked used
3. Dashboard shows **"Subscribe to go live — £10/mo, 3 months free"**
4. Taps Subscribe → Stripe Checkout → enters card (not charged for 90 days)
5. Stripe → `stripe-webhook` → `subscription_status = trialing`, `is_approved = true`
6. Listing now appears in customer search. Business adds services + staff.
7. After 3 months Stripe charges £10/mo automatically → stays `active`
8. If a payment fails or they cancel → webhook sets `is_approved = false` → listing hidden (data kept)

## Handing out invite codes

Until the admin UI exists: in Supabase SQL editor,
```sql
insert into referral_codes (code, issued_to) values ('BARBER-JON', 'Jon @ Fade St');
```
Give `BARBER-JON` to that one business. When they sign up it's consumed and can't be reused.
