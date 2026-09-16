# Reserve Your Spot

Find and book local businesses — barbers, salons, nail techs, personal trainers,
massage therapists and more. Pick a service, choose a time, pay a small deposit,
done.

> Formerly "BookLocal". The `booklocal-*` folders keep the old name for now.

## Try it

**Android:** download and install the latest demo APK —
[**Releases**](../../releases/latest). Sign in with any email + password
(use an email starting `biz@` to open the business dashboard). Runs on
sample data, no account or internet needed.

iPhone can't install an APK — there's no free way around that.

## What's in this repo

| Folder | Stack | Status |
|--------|-------|--------|
| `Reserve Your Spot/` | **.NET MAUI (C#)** — the main app | Runs on Windows + Android. Release build is Play-Store-signed. |
| `booklocal-mobile/` | Expo / React Native | Scaffolded; needs `npm install` + `.env` |
| `booklocal-web/` | Next.js 15 + Tailwind — admin panel | Scaffolded; needs `npm install` + `.env.local` |

## Run the MAUI app

```bash
# Windows desktop
dotnet build "Reserve Your Spot/Reserve Your Spot.csproj" -f net10.0-windows10.0.19041.0 -c Debug
# then run bin/Debug/net10.0-windows10.0.19041.0/win-x64/Reserve Your Spot.exe

# Android (debug APK on a connected device / emulator)
dotnet build "Reserve Your Spot/Reserve Your Spot.csproj" -f net10.0-android -c Debug -t:Run
```

Requires the .NET 10 SDK and the `maui` workloads (`dotnet workload install maui`).

### Mock vs real backend

The app ships wired to **mock services** (`Reserve Your Spot/Services/MockData.cs`)
so it runs with zero setup — including fake-but-instant Stripe subscribe/connect/pay
flows. To go live, see **[STRIPE_SETUP.md](STRIPE_SETUP.md)** (payments) and
**[MONETISATION.md](MONETISATION.md)** (the pricing model and full flow). Short version:

1. Put your Supabase + Stripe keys in `Reserve Your Spot/Constants/AppConstants.cs`
2. Deploy the functions in `supabase/functions/` and set their secrets
3. In `Reserve Your Spot/MauiProgram.cs` → `RegisterServices`, swap the five
   `Mock*` registrations for `AuthService` / `BusinessService` / `BookingService` /
   `PaymentService` / `ReferralService`

## Publishing to Google Play

See [**PLAYSTORE.md**](PLAYSTORE.md) — full step-by-step. In short:

```bash
dotnet publish "Reserve Your Spot/Reserve Your Spot.csproj" -f net10.0-android -c Release
# -> bin/Release/net10.0-android/com.emredmn62.reserveyourspot-Signed.aab
```

The release build is signed with an upload key in `Reserve Your Spot/signing/`
(git-ignored — **back it up**). Store-listing copy is in
[STORE_LISTING.md](STORE_LISTING.md); privacy policy in [PRIVACY.md](PRIVACY.md).

| | |
|--|--|
| Application ID | `com.emredmn62.reserveyourspot` |
| Version | 1.0.0 (code 1) |
| Min Android | 5.0 / API 21 |

## The other two apps (BookLocal)

Original plan: Expo mobile app + Next.js admin, both on Supabase + Stripe.

- Full SQL schema (tables + RLS): comment block in `booklocal-mobile/services/supabase.ts`
- Mobile env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_STRIPE_KEY`, `EXPO_PUBLIC_MAPS_KEY`
- Web env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- App name for those two: `booklocal-mobile/constants/AppConstants.ts` and `booklocal-web/app/layout.tsx`

## Tech

.NET MAUI · CommunityToolkit.Mvvm · Supabase (Postgres + Auth + Storage) ·
Stripe (deposit model, 10% platform fee) · Expo · Next.js 15 · Tailwind
