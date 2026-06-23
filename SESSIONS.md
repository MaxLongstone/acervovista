# AcervoVista — Session Log

A running log of what was built, fixed, or decided in each working session.
Update this at the end of every session before pushing.

---

## Session: Heir Dashboard Composition
**Blocks built:** 1–10 (all committed to main)
- Block 1–3: case_items spine, top band, standing hero
- Block 4–5: dashboard body, glance/peek/dwell interaction
- Block 6: flagged item dwell page
- Block 7: estimated inheritance value card + itemized popup
- Block 8: WhatYouKnow declared-entry engine
- Block 9: ActionsCard — things you can do now
- Block 10: AskLauncher + TakeABreath inline band
- i18n wired to GapMap (removed hardcoded English strings)
- All committed, pushed to GitHub (main)

---

## Session: Landing Page Copy Edits
- Fixed three text violations on English landing page (founder story, quiz hint, footer disclaimer)
- Built `/terms` — ToS v2 draft with "under attorney review" banner
- Built `/privacy` — Privacy Policy v2 with same banner
- Built `/es` — full standalone Spanish landing page (hardcoded, NOT a translation toggle)
  - Spanish quiz with 10 questions and scoring logic
  - Spanish footer with "In English" → `/` toggle
  - Referral compensation disclosure in Spanish
- Added "En Español" link in English footer → `/es`
- All under `acervovista-landing/`

---

## Session: Authentication and Checkout
- Built AuthContext, ProtectedRoute, LoginPage, SignupPage, CheckoutPage
- JWT-based auth wired to Express backend
- Stripe checkout session creation wired (test mode)
- All under `client/src/`

---

## Session: Resend Email Integration
- Added `RESEND_API_KEY` to `.env` (real key, not placeholder)
- Fixed `server/routes/webhook.js`:
  - Added empty-key guard (skips send gracefully if key missing)
  - Added success log: `Confirmation email sent: to=<email> case=<caseId>`
  - Added SDK error check (Resend returns errors in-band, not by throwing)
  - Changed `from` to `onboarding@resend.dev` (temporary — acervovista.com not yet verified in Resend)
- `CLIENT_URL` in email link still needs updating when domain is finalized

---

## Session: Sandbox Deployment (Render + Netlify)
**Date:** June 23, 2026

### What was deployed
| | URL |
|--|--|
| Landing page (unchanged) | https://acervovista.netlify.app |
| React app | https://acervovista-app.netlify.app |
| Backend API | https://acervovista-sandbox-api.onrender.com |
| Database | Render — `acervovista-sandbox-db` |

### Database
- Created on Render free tier — **expires July 23, 2026**
- All migrations run: `schema.sql`, `002_case_items.sql`, `003_users.sql`
- `users` table confirmed with all columns including `stripe_subscription_id`
- Internal connection string stored as `DATABASE_URL` on Render (not printed here)

### Backend (Render Web Service)
- Root directory: `server/`
- Build: `npm install` · Start: `node index.js`
- Env vars set on Render: `DATABASE_URL`, `JWT_SECRET` (new, not reused from local),
  `RESEND_API_KEY`, `NODE_ENV=production`, `CLIENT_URL`, `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` left blank — Stripe wired last

### Frontend (Netlify — second site, separate from landing page)
- Built from `client/` with `VITE_API_URL=https://acervovista-sandbox-api.onrender.com`
- `netlify.toml` added to `client/` with SPA redirect rule
- `VITE_API_URL` set as env var in Netlify dashboard for future deploys

### Code fixes made during deploy
- `client/src/api.js` — changed hardcoded `localhost:3001` to `import.meta.env.VITE_API_URL || ...`
- `client/src/App.jsx` — same fix for `DashboardShell` API constant
- `client/src/pages/SignupPage.jsx` — same fix
- `client/src/pages/LoginPage.jsx` — same fix
- `client/src/pages/CheckoutPage.jsx` — same fix
- `server/routes/handoff.js` — stubbed out Puppeteer (returns 503 in sandbox; Chromium can't run on Render free tier)
- `server/routes/webhook.js` — `from` address changed to `onboarding@resend.dev`

### Still to do (not done in this session)
- [ ] Stripe test webhook: create endpoint in Stripe dashboard pointing at Render `/api/webhook`, copy signing secret to Render `STRIPE_WEBHOOK_SECRET`
- [ ] Verify `acervovista.com` in Resend dashboard (DNS records) — then change `from` back to `noreply@acervovista.com`
- [ ] Update landing page CTAs to point at `https://acervovista-app.netlify.app`
- [ ] Restore Puppeteer handoff PDF once on a paid Render tier (or switch to a headless PDF service)
- [ ] Renew/migrate Render free DB before July 23, 2026

---

## Pending / Not Yet Done
- Production database migration (needs `PRODUCTION_DATABASE_URL` — blocked)
- Stripe live-mode cutover (deliberately last — do not touch until all sandbox tests pass)
- `acervovista.com` domain setup and DNS for Resend
- Custom domain on Netlify app site
