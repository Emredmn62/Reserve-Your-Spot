# BookLocal — Local Business Booking Platform

A full-stack booking platform for local businesses: barbers, salons, nail shops, PTs, tutors, mechanics and more.

## Renaming the App

The app name is stored in **one place only**:
- **Mobile:** `booklocal-mobile/constants/AppConstants.ts` → `APP_NAME`
- **Web admin:** `booklocal-web/app/layout.tsx` → `APP_NAME`

Change these two constants and the name updates everywhere.

---

## Structure

```
Reserve Your Spot/
├── booklocal-mobile/     ← Expo React Native app (iOS + Android)
├── booklocal-web/        ← Next.js admin panel (Vercel)
└── README.md
```

---

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run the entire SQL schema from `booklocal-mobile/services/supabase.ts` (inside the comment block)
3. Create Storage buckets: `business-logos`, `business-covers`, `business-gallery`, `staff-photos`, `user-avatars` — all set to **public**
4. Copy your **Project URL** and **anon key**

### 2. Set up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your **publishable key** and **secret key**
3. Deploy the Edge Function at `supabase/functions/create-payment-intent/index.ts`:
   ```bash
   supabase functions deploy create-payment-intent
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```

### 3. Mobile App Setup

```bash
cd booklocal-mobile
npm install

# Create .env file:
echo "EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env
echo "EXPO_PUBLIC_STRIPE_KEY=pk_live_your_key" >> .env
echo "EXPO_PUBLIC_MAPS_KEY=your-google-maps-key" >> .env

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

### 4. Web Admin Setup

```bash
cd booklocal-web
npm install

# Create .env.local file:
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

# Run dev server
npm run dev
# Open http://localhost:3000/admin
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo + React Native + Expo Router |
| State | Zustand |
| Web admin | Next.js 15 + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments | Stripe (deposit model) |
| Maps | Google Maps |
| Hosting (web) | Vercel |
| Push notifications | Expo Notifications |

---

## Key Features

### Customer
- Discover local businesses by location & category
- Full business profiles with gallery, staff, reviews
- 8-step booking flow: Business → Service → Staff → Date → Time → Details → Deposit → Confirmation
- Deposit payments via Stripe (rest paid in person)
- Saved businesses (favourites)
- Booking history (upcoming / past / cancelled)
- Loyalty cards per business
- Smart rebook reminders

### Business
- Self-service profile creation
- Services management (add / edit / delete / toggle active)
- Staff management with working hours
- Live booking calendar
- Manual booking creation
- Analytics dashboard (revenue, no-shows, ratings)
- Last-minute slot flagging
- QR code sharing (`booklocal.app/{slug}`)
- Custom branding (logo, cover, brand colour)

### Admin Panel
- Approve / suspend businesses
- View all bookings and payments
- Platform revenue tracking (10% deposit fee)
- Analytics overview

### Monetisation
- **Freemium:** Free plan (20 bookings/month), Pro (£19.99/mo), Premium (£49.99/mo)
- **Deposit fee:** App keeps 10% of every deposit
- **Featured listings:** Businesses pay to appear higher in search
- **Business Boost:** Temporary promotion upgrades

---

## Environment Variables

### Mobile (`booklocal-mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_STRIPE_KEY=
EXPO_PUBLIC_MAPS_KEY=
```

### Web (`booklocal-web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   ← for admin operations
```

---

## Deployment

### Mobile — Expo EAS
```bash
cd booklocal-mobile
npx eas build --platform all
npx eas submit
```

### Web Admin — Vercel
```bash
cd booklocal-web
npx vercel --prod
```

---

## Database Schema

All tables with RLS policies are defined in `booklocal-mobile/services/supabase.ts`.

Tables: `users`, `businesses`, `categories`, `services`, `staff`, `bookings`, `payments`, `reviews`, `favourites`, `loyalty_cards`, `notifications`, `admin_users`

---

## Folder Map (Mobile)

```
booklocal-mobile/
├── app/
│   ├── _layout.tsx           Root layout, auth gate
│   ├── index.tsx             Redirect based on auth state
│   ├── onboarding.tsx        3-slide onboarding
│   ├── (auth)/               Login, Register, Business Setup
│   ├── (customer)/           Home, Search, Bookings, Favourites, Profile
│   ├── (business)/           Dashboard, Calendar, Services, Staff, Analytics
│   ├── business/[slug].tsx   Public business profile
│   └── booking/              Service → Staff → DateTime → Payment → Confirmation
├── constants/AppConstants.ts  ← All config + colours + APP_NAME
├── types/index.ts             All TypeScript models
├── services/                  Supabase, Auth, Business, Booking, Payment
├── store/                     Zustand: auth + booking flow
└── components/ui/             BusinessCard, ServiceCard, BookingCard, GoldButton, StarRating
```
