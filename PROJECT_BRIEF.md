# Reserve Your Spot — full project brief

*Written for another AI assistant picking up this project cold. Paste this whole
file into a new chat and you'll have everything needed to understand, discuss,
or continue building this app without re-deriving any of it.*

Repo: **https://github.com/Emredmn62/Reserve-Your-Spot** (public)
Local path: `C:\Users\emred\source\repos\Reserve Your Spot\`

---

## 1. What this app is

**Reserve Your Spot** is a booking marketplace app for local service businesses —
barbers, hair salons, nail techs, personal trainers, massage therapists, and
similar. Think **Fresha / Booksy**, but the core discovery surface is an
**Instagram-style feed** rather than a plain directory: customers scroll photo
posts from nearby businesses, tap one, and book.

**One-line pitch:** *"Know where to go before you get there — scroll a feed of
local businesses, book in seconds, pay in-app."*

**Two sides of the app, one codebase:**
- **Customers** — browse the feed/search with no account needed, book a
  service, pay in full in-app, manage their bookings.
- **Business owners** — sign up with an invite code, subscribe (£20/year),
  connect a Stripe account to get paid, then post content, manage bookings,
  block off time they're unavailable.

The product previously went through a name/scope change: it started as
**"BookLocal"** (a generic multi-vertical booking app, business-directory style)
and was renamed to **"Reserve Your Spot"** partway through, with the Home
screen redesigned from a directory into a content feed. Some legacy internal
naming (`booklocal-mobile`, `booklocal-web`, `com.companyname.booklocal`) still
exists in less-visible places — see §7.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| **Main app** | **.NET MAUI (C#)** — native, targets Windows, Android, iOS from one codebase |
| Architecture | MVVM via `CommunityToolkit.Mvvm` (source-generated `[ObservableProperty]`/`[RelayCommand]`) |
| Navigation | .NET MAUI **Shell** (`AppShell.xaml`) — a customer `TabBar` and a business `TabBar`, plus registered flat routes for detail pages |
| Backend (planned) | **Supabase** — Postgres + Auth + Storage. **Not connected yet** — app runs on mock in-memory data (see §4) |
| Payments | **Stripe + Stripe Connect** (destination charges) via **Supabase Edge Functions** (Deno/TypeScript). Written and ready, **not deployed yet** |
| Two other folders in the repo | `booklocal-mobile/` (Expo/React Native) and `booklocal-web/` (Next.js 15 admin panel) — early scaffolds from the original "BookLocal" concept, **largely untouched and not the active focus**. All real development effort has gone into the MAUI app. |

Design language: **dark background (`#0A0A0A`) + gold accents (`#C9A84C`)**,
premium/minimal aesthetic. Colours/styles centralised in `App.xaml`.

---

## 3. The product, screen by screen (as actually built)

### Onboarding & auth
- 3-slide carousel → **Get Started** (always jumps straight into the app as a
  guest, from any slide — this was a real bug that got fixed: the button used
  to only work from the last slide) or **Sign In** link.
- **Browsing requires no account.** Home feed, Search, and business profiles
  are fully open. An account is only required at the *moment* you try to do
  something: tap **Book Now**, tap the favourite ♡, or open the **Bookings**,
  **Saved**, or **Profile** tabs — all three redirect a guest to Login.
- Register screen has an explicit **"I'm a business owner"** toggle, which
  branches signup into the business-onboarding flow instead of straight into
  the customer app.

### Customer side
- **Home** = the feed: photo + caption posts from *approved* businesses,
  newest-first, each showing the business's avatar/initials, name, category,
  "Xh ago", and a tap-through to their profile. Category chips above it filter
  into Search. Feed cards are rounded, shadowed, capped at 480px wide so they
  don't stretch across a wide desktop window.
- **Search** — text search + category filter + a List/Map toggle (Map is a
  UI flag only, does nothing yet — known gap, see §6).
- **Business profile** — cover image, rating, address, Call/WhatsApp/Share
  actions, tabs for Services / Staff / Reviews / Info, **Book Now** button.
- **Booking flow**: Service → Staff (or "Any Available") → Date & Time (calendar
  grid + time slots) → **Payment**. Payment is **full price, paid in-app**
  (not a deposit-then-pay-in-person model, which is what it started as) via a
  **Stripe Checkout** hosted page opened in the browser; the app polls the
  booking status every few seconds until the webhook confirms payment, then
  shows the confirmation screen. On mock data, this completes instantly with
  no real money moving.
- **Bookings tab** — Upcoming / Past / Cancelled, cancel or rebook.
- **Saved tab** — favourited businesses.
- **Profile tab** — name/email, loyalty cards (not wired to real data yet),
  sign out.

### Business owner side
- **Setup Your Business** — name/description/category/address/phone +
  a required **invite code** (see §5, invite-only onboarding). Creates the
  listing as **Pending** (not visible to customers yet).
- **Dashboard** — today's stats (bookings/revenue/outstanding), and a
  **two-step "go live" gate**:
  1. **Subscribe** banner (£20/year) — until paid, the listing stays hidden
  2. **Connect to Stripe** banner — Stripe Express onboarding (bank details),
     until done the business can't actually receive booking payments
  Once both are true (`Business.IsReadyToGoLive`), a green "You're live"
  banner replaces them and the listing becomes visible to customers.
  - **📸 New Post** — pick a photo (device gallery via `MediaPicker`), write a
    caption, post it — appears in the customer feed once the business is live.
  - **Block Time** — pick a date + time range, choose "whole business" or one
    specific staff member, optional private note, save. That window then shows
    to customers as a normal unavailable time slot — identical treatment to an
    already-booked slot, no indication it's a manual block.
  - "+ Manual Booking" and legacy "Block Time" stub alerts were replaced;
    Manual Booking is still a "coming soon" stub.
- **Calendar** — week/month toggle, list of bookings in the period.

---

## 4. Current build state: what's real vs. mocked

**Everything currently runs on in-memory mock services** — zero backend setup
needed to run and click through the whole app. This is intentional and
switchable, not a limitation of the design.

`Reserve Your Spot/Services/MockData.cs` contains:
- `MockAuthService`, `MockBusinessService`, `MockBookingService`,
  `MockPaymentService`, `MockPostService`, `MockReferralService`
- A toggle `MockStore.IncludeDemoSeedData` (currently `true`) — seeds 5 example
  approved businesses (Fade Masters Barbershop, The Gilded Chair, Lux Nail
  Lounge, Iron & Oak PT Studio, Serenity Massage Rooms) with services/staff and
  10 feed posts (photos pulled from `loremflickr.com` keyworded by category, so
  they actually look relevant). Flip it to `false` for a clean, empty,
  launch-ready state.
- A **personal always-ready test business** that exists regardless of that
  toggle — see test credentials below.

**The real implementations already exist, written and ready, just not wired
up or deployed:**
- `Services/AuthService.cs`, `BusinessService.cs`, `BookingService.cs`,
  `PaymentService.cs`, `ReferralService.cs` — all Supabase-backed, call
  `SupabaseService.cs` (a thin REST wrapper over PostgREST + Supabase Auth).
- Four **Supabase Edge Functions** in `supabase/functions/` (Deno/TypeScript):
  `create-connect-account`, `create-subscription-checkout`,
  `create-booking-checkout`, `stripe-webhook`. These are the pieces that
  actually talk to the Stripe API with the secret key.
- SQL schema (tables, RLS policies) lives as a big comment block inside
  `Services/SupabaseService.cs` — copy-paste into the Supabase SQL editor.

**To go live**, per `STRIPE_SETUP.md` and `README.md`:
1. Create a Supabase project, run the SQL, paste URL+anon key into
   `Constants/AppConstants.cs`
2. Create a Stripe account, enable Connect, create the £20/year price, deploy
   the 4 functions (`supabase functions deploy ...`), set secrets, add the
   webhook
3. In `MauiProgram.cs` → `RegisterServices`, swap the 5 `Mock*` registrations
   for the real ones (one line each)

Nobody has done this yet — the app has never talked to a real backend.

---

## 5. The business model (decided, documented in `MONETISATION.md`)

- **£20/year** listing fee per business (constant:
  `AppConstants.SubscriptionYearlyPrice` — change the one number for a
  different price)
- **5%** of every booking (`AppConstants.BookingPlatformFeePercent`), taken
  automatically as a Stripe "application fee" on a destination charge — money
  goes **straight to the business's own bank**, the platform's cut is skimmed
  in the same transaction. The platform never holds customer funds (this is
  deliberate — it avoids UK e-money/payment-institution licensing).
- **Invite-only onboarding**: a business needs a valid, unused invite code to
  create a listing — enforced one-code-per-business
  (`IReferralService`/`ReferralCode` model). Demo codes: `FOUNDER-001`,
  `FOUNDER-002`, `FOUNDER-003`.
- Reasoning (from the conversation that produced this): with zero businesses
  on the app, the hardest problem is convincing the *first* ones to join, not
  maximising revenue per signup — a small yearly fee + usage-based commission
  is a much easier "yes" than a recurring subscription with no proof it'll
  bring bookings, and it aligns the platform's incentives with each business's
  actual success. This is close to how Fresha won share against
  subscription-only rivals like Booksy.

---

## 6. Known gaps / explicitly not built yet

- **Manage Services, Manage Staff, Analytics, Edit Business Profile** —
  ViewModels exist (`ViewModels/Business/*.cs`) but have **no registered Page
  or route** — completely unreachable in the UI right now. This is the
  single biggest functional gap: a business can be created with services
  entered at signup... actually check — **a new business is created with
  zero services and zero staff**, and there is currently no way to add any
  after the fact through the UI. Building the Manage Services / Manage Staff
  pages is the natural next step for anyone continuing this project.
- No way for a customer to write a review (reviews only display).
- No reschedule — only cancel or "rebook from scratch".
- Search's Map/List toggle — Map does nothing.
- No admin UI for minting invite codes — currently a raw
  `insert into referral_codes` SQL statement.
- `booklocal-mobile` and `booklocal-web` (the Expo and Next.js siblings) are
  unmaintained scaffolds — `npm install` was never even run on them.
- Play Store submission is prepped (signed AAB, app ID
  `com.emredmn62.reserveyourspot`, store listing copy in `STORE_LISTING.md`,
  privacy policy in `PRIVACY.md`) but **not submitted** — needs a Google Play
  Developer account ($25) + a mandatory 14-day/12-tester closed test period
  for new personal accounts.
- A demo **Android APK** is published as a GitHub Release:
  https://github.com/Emredmn62/Reserve-Your-Spot/releases/latest — runs on
  mock data, no backend needed, Android only.

---

## 7. Repo map (key files)

```
Reserve Your Spot/                          <- repo root
├── README.md                               overview + quick start
├── MONETISATION.md                         pricing model + end-to-end payment flow
├── STRIPE_SETUP.md                         step-by-step to deploy real Stripe/Supabase
├── PLAYSTORE.md / STORE_LISTING.md / PRIVACY.md   Play Store submission prep
├── payment-complete.html                   static page Stripe redirects back to
├── supabase/functions/                     4 Edge Functions (Stripe <-> Supabase), Deno/TS
│
├── Reserve Your Spot/                      <- the .NET MAUI app itself
│   ├── AppShell.xaml(.cs)                  navigation: customer TabBar, business TabBar, routes
│   ├── MauiProgram.cs                      DI registration - THE place to swap Mock -> real
│   ├── Constants/AppConstants.cs           route names, pricing constants, API keys (placeholders)
│   ├── Models/                             Business, Booking, Service, Staff, Post, BlockedTime, etc.
│   ├── Services/
│   │   ├── MockData.cs                     ALL mock services + in-memory seed data live here
│   │   ├── SupabaseService.cs              REST wrapper + the full SQL schema (as a comment)
│   │   ├── AuthService.cs / BusinessService.cs / BookingService.cs /
│   │   │   PaymentService.cs / ReferralService.cs   real (Supabase-backed) implementations
│   │   └── I*.cs                           the interfaces - this is the contract both mock and real honour
│   ├── ViewModels/                         one per screen, ViewModels/BusinessPortal/ for the owner side
│   ├── Views/
│   │   ├── Onboarding/, Auth/, Customer/, Business/ (namespace: BusinessPortal)
│   │   └── (NB: a namespace named exactly "Business" collided with Models.Business
│   │       and caused ~50 compile errors earlier in this project's history -
│   │       it's now named BusinessPortal everywhere. Don't reintroduce "Business".)
│   └── signing/                            release keystore (git-ignored, NOT in the repo)
│
├── booklocal-mobile/                       Expo/React Native - legacy, not actively developed
└── booklocal-web/                          Next.js admin panel - legacy, not actively developed
```

---

## 8. Test credentials (mock mode)

| Login | Email | What you get |
|---|---|---|
| Customer | any email/password | Browse, book, pay (mock) |
| Fresh business owner | email starting `biz` (e.g. `biz@test.com`), any password | New owner, **no business yet** — tests the invite-code + setup + subscribe + connect flow from scratch. Use invite code `FOUNDER-001`/`002`/`003`. |
| **Ready-made test account** | **`emre@business.com`**, any password | Logs in as "Emre", already owns a fully-live business ("Emre's Barbershop") — subscribed, Stripe connected, 2 services, 1 staff, 1 post, 1 upcoming booking already seeded. Use this to test Dashboard/Calendar/Block Time/New Post immediately without repeating setup. |

---

## 9. How to run it

```bash
# Windows desktop build
dotnet build "Reserve Your Spot/Reserve Your Spot.csproj" -f net10.0-windows10.0.19041.0 -c Debug
# then run: Reserve Your Spot/bin/Debug/net10.0-windows10.0.19041.0/win-x64/Reserve Your Spot.exe

# Android debug build + install to a connected device/emulator
dotnet build "Reserve Your Spot/Reserve Your Spot.csproj" -f net10.0-android -c Debug -t:Run
```
Requires .NET 10 SDK + MAUI workloads (`dotnet workload install maui`).

---

## 10. Suggested framing for whoever you hand this to

If another AI is being asked to *continue building* this project, the highest-leverage
next steps in rough priority order are:
1. **Manage Services / Manage Staff pages** — closes the biggest gap (a business
   can't sell anything until it has services)
2. Deploy the real backend (Stripe + Supabase) per `STRIPE_SETUP.md` so the app
   is genuinely multi-user instead of single-device mock state
3. Review-writing UI, reschedule, Map view — smaller polish items
4. Submit to Play Store once ready (checklist already written in `PLAYSTORE.md`)

If another AI is just being asked to *understand or discuss* the project, this
document plus the four markdown files it references (`README.md`,
`MONETISATION.md`, `STRIPE_SETUP.md`, `PLAYSTORE.md`) is the complete picture.
