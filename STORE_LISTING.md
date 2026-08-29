# Google Play store listing — draft copy

Paste these into Play Console → **Grow → Store presence → Main store listing**.
Edit anything in _italics_ or `CAPS` before submitting.

---

### App name (30 char max)
```
Reserve Your Spot
```

### Short description (80 char max)
```
Discover local barbers, salons, PTs and more — and book your spot in seconds.
```

### Full description (4000 char max)
```
Reserve Your Spot is the easiest way to find and book local businesses near you —
barbers, hair salons, nail techs, personal trainers, massage therapists and more.

FIND
• Browse businesses nearby, or search by name or category
• See ratings, reviews, photos, services and staff before you book
• Save your favourites for next time

BOOK IN SECONDS
• Pick a service, choose a team member (or "any available"), tap a time slot
• Pay a small deposit to lock it in — settle the rest in person
• Get it all in one place: no phone calls, no back-and-forth

MANAGE
• Upcoming, past and cancelled bookings in one tab
• Reschedule or cancel from your phone
• Loyalty cards and booking history

FOR BUSINESSES
• List your business, services and team
• See today's schedule and takings at a glance
• A live calendar of every booking

Reserve Your Spot — know where you're going before you get there.
```

### App category
`Lifestyle` (or `Business`)

### Tags
booking, appointments, barber, salon, local services, scheduling

### Contact details
- Email: `CONTACT_EMAIL_HERE`  (required, shown publicly)
- Website: `https://github.com/Emredmn62/Reserve-Your-Spot` _(optional)_
- Phone: _optional_

### Privacy policy URL (required)
`https://EMREDMN62.github.io/Reserve-Your-Spot/PRIVACY`
_(enable GitHub Pages for this repo first: Settings → Pages → Deploy from branch → main → /root)_

---

## Graphics you still need to make

| Asset | Spec | Notes |
|-------|------|-------|
| App icon | 512 × 512 PNG, 32-bit | Play generates from this. The in-app icon (gold pin on black) can be exported at this size. |
| Feature graphic | 1024 × 500 PNG/JPG | Shown at the top of the listing. Simple: black background, gold pin, "Reserve Your Spot". |
| Phone screenshots | 2–8 images, 16:9 or 9:16, min 1080px | Onboarding, Home, a business profile, the time-slot picker, booking confirmed. Capture from an emulator or a real phone. |

## Data safety form answers (Play Console → App content → Data safety)

Based on the live app (Supabase + Stripe):

- **Does your app collect or share user data?** Yes
- Collected: Name, Email address, Phone number, Purchase history (booking history), App activity (bookings/favourites)
- Payment info: handled by Stripe — "Payment info" is **processed but not stored** by the app beyond a reference
- Data encrypted in transit? Yes
- Users can request deletion? Yes (via the contact email)
- Data shared with third parties? Only with the business the user books, and payment processor (Stripe)

> The **current demo build collects nothing**. If you upload the demo build as-is,
> answer "No" to data collection — but update it the moment the live backend is wired in.

## Content rating
Complete the questionnaire (App content → Content rating). This app has no
violence/sexual/gambling content → expect **Everyone / PEGI 3**.
