# Getting Reserve Your Spot onto the Google Play Store

What's already done in this repo:

- App renamed **BookLocal → Reserve Your Spot** (title, `AppConstants.AppName`, icon, splash)
- Real application ID: **`com.emredmn62.reserveyourspot`** (permanent once published — change it in
  `Reserve Your Spot/Reserve Your Spot.csproj` now if you want a different one)
- Version **1.0.0** / versionCode **1** (`ApplicationDisplayVersion` / `ApplicationVersion`)
- Release **upload keystore** generated at `Reserve Your Spot/signing/` (git-ignored — **back it up**, see that folder's README.txt)
- `csproj` builds a **signed .aab** (and .apk) in Release
- `PRIVACY.md` and `STORE_LISTING.md` drafts

---

## 1. Build the signed app bundle

```bash
dotnet publish "Reserve Your Spot/Reserve Your Spot.csproj" -f net10.0-android -c Release
```

Output:
```
Reserve Your Spot/bin/Release/net10.0-android/com.emredmn62.reserveyourspot-Signed.aab   ← upload this
Reserve Your Spot/bin/Release/net10.0-android/com.emredmn62.reserveyourspot-Signed.apk   ← for sideload testing
```

Verify it's signed with the upload key (optional):
```bash
"/c/Program Files/Android/openjdk/jdk-21.0.8/bin/keytool.exe" -printcert -jarfile "Reserve Your Spot/bin/Release/net10.0-android/com.emredmn62.reserveyourspot-Signed.aab"
```
The SHA-256 should match the one in `Reserve Your Spot/signing/README.txt`.

For every later update: bump `<ApplicationVersion>` (versionCode) in the csproj, optionally
`<ApplicationDisplayVersion>`, then re-run the publish command.

---

## 2. Create a Google Play Developer account  *(you, ~$25, one-time)*

1. Go to <https://play.google.com/console/signup>
2. Choose a **Personal** account (unless you have a company).
3. Pay the **$25** one-time fee.
4. Complete **identity verification** (Google now requires a photo ID; can take 1–2 days).

> New personal accounts also have to run a **closed test with at least 12 testers
> for 14 days** before they're allowed to publish to production. Plan for that — it's
> not optional. You can invite testers by email or with a shareable opt-in link.

---

## 3. Create the app in Play Console

1. **Create app** → name `Reserve Your Spot`, language English, "App", "Free".
2. Accept the declarations.
3. Left menu → **Setup → App integrity** → make sure **Play App Signing** is enabled
   (it is by default). Google will hold the real signing key; you upload with the
   key in `signing/`.

---

## 4. Fill in the required content  *(App content section)*

Work through every item Play Console lists. The must-dos:

- **Privacy policy** – host `PRIVACY.md` somewhere public and paste the URL.
  Easiest: repo **Settings → Pages → Deploy from branch → `main` / root**, then use
  `https://emredmn62.github.io/Reserve-Your-Spot/PRIVACY`. Put a real contact email in the file first.
- **Data safety** – answers are drafted in `STORE_LISTING.md`.
- **Content rating** – short questionnaire → expect "Everyone".
- **Target audience** – 18+ (or 13+), not directed at children.
- **Ads** – "No ads" (the app has none).
- **Government apps / financial features** – No.

---

## 5. Store listing

**Grow → Store presence → Main store listing.** Copy from `STORE_LISTING.md`.
You still have to create three graphics yourself (icon 512², feature graphic
1024×500, and 2–8 phone screenshots) — specs are in that file.

---

## 6. First release

1. **Testing → Closed testing → Create track** (e.g. "alpha").
2. Add testers (email list or opt-in link) — you need 12+ for 14 days.
3. **Create release** → upload
   `com.emredmn62.reserveyourspot-Signed.aab`.
4. Add release notes, review, **roll out**.
5. Share the opt-in link with testers; they install from the Play Store.

After the 14-day closed test, use **Promote release → Production** and submit for
review (review is usually 1–7 days for a new app).

---

## Quick reference

| Thing | Value |
|-------|-------|
| App name | Reserve Your Spot |
| Package / application ID | `com.emredmn62.reserveyourspot` |
| Version name / code | 1.0.0 / 1 |
| Min Android | 5.0 (API 21) |
| Upload keystore | `Reserve Your Spot/signing/reserveyourspot-upload.keystore` (git-ignored) |
| Keystore + key password | `RysUpload!2026` (also in `signing/README.txt`) |
| Bundle to upload | `bin/Release/net10.0-android/com.emredmn62.reserveyourspot-Signed.aab` |
