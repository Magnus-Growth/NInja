# Trading Competition Operator — Remote Recruitment Landing Page

A responsive Bangla recruitment landing page for an **independent** team recruiting remote competition-day trade execution support. This is **not** an official NinjaTrader job or endorsement.

## What's included
- `index.html` — complete static site, responsive design, demo chart, qualification criteria, reward tiers and application form
- `.github/workflows/pages.yml` — GitHub Actions deployment for GitHub Pages (main branch)
- `server/telegram_application_worker.js` — optional Cloudflare Worker for secure direct-to-bot application delivery

## Live site
Once GitHub Pages is enabled and the deployment succeeds, the expected project URL is:
https://Magnus-Growth.github.io/NInja/

GitHub repo: https://github.com/Magnus-Growth/NInja

## Telegram application handling
The default form does **not** auto-send applicant information. A submission opens a prefilled chat draft addressed to [@lotmanager](https://t.me/lotmanager), and the applicant must press **Send**. A copy fallback is also available.

For automated submissions, provision a Telegram bot and a Cloudflare Worker securely:
1. Create a Telegram bot via @BotFather. Never commit its token.
2. Start a private chat with the bot (or add it to a private chat/group) and determine the destination chat ID.
3. Deploy `server/telegram_application_worker.js` to a Cloudflare Worker.
4. Set Worker **Secrets** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
5. Set Worker **variable** `ALLOWED_ORIGIN` to the exact deployed site origin (typically `https://Magnus-Growth.github.io`, without a path).
6. Set `APPLICATION_ENDPOINT` in `index.html` to the Worker URL ending in `/apply`.
7. Test the Worker with a consenting test applicant and enable appropriate rate limiting / anti-spam.

**Do not** expose the bot token in HTML, GitHub source or client-side JavaScript. Hosting this static page alone cannot provide automated delivery.

## Deployment
The Actions workflow on pushes to `main` publishes only `index.html`. Other repo files stay out of the Pages artifact. Ensure **Settings → Pages → Build and deployment → Source: GitHub Actions** is configured and the account plan supports Pages for the current repository visibility.

## Candidate privacy and rules
- Collect only information required for recruitment; applicants must consent before sending it.
- No IDs, payment card details, trading-account passwords or deposits are requested.
- Any competition assistance or handling of accounts must comply with NinjaTrader event rules. No promise of winnings or guaranteed salary is made.
- The job ad uses an independent team identity and disclaims affiliation with NinjaTrader.


## Two participation paths (2026-11-01)
- A fixed bottom navigation lets visitors choose **Job / Operator Role** (application form) or **Compete using own account** (information and enquiry flow).
- The participant section outlines a proposed **50% participant / 50% team** reward-sharing arrangement, conditional on a prize actually being awarded and received, competition rules, and an advance written agreement.
- Group access is **not automatic**; `@lotmanager` opens a Telegram prefilled enquiry message. Supply an actual verified private group invite URL before enabling direct joining.
- Arena terms restrict one entry per person. Signal following or coordinated trading must not be represented as permitted unless the applicable official competition rules confirm it. Users keep full control of their accounts, and no credentials are collected.
- The user-visible site is not affiliated with NinjaTrader.

## Analytics & visitor behavior (November 2026)

The static Ninja landing page now has consent-gated analytics and behaviour reports.

- **GA4 Measurement ID:** `G-00J1364DR1`
- **Microsoft Clarity Project ID:** `z6gz4nvssg`
- **Client script:** `assets/analytics.js`, referenced by `index.html`
- **Consent:** New visitors see a small opt-in dialog. Before opt-in, neither Google nor Clarity analytics scripts are loaded. Visitors can decline without losing any site functionality. They can change this choice using **Analytics ও Privacy Settings** in the footer. Advertising consent always remains denied.
- **Privacy:** Both forms use `data-clarity-mask="true"`. Never emit name, phone, Telegram handles, location, applicant notes, form content, or Telegram message draft into analytics events.
- **GA4 standard auto page views:** Count after consent. Clarity supplies heatmaps, scroll activity, and session recordings subject to consent.
- **Custom events:** `job_form_start`, `competition_form_start`, `job_form_invalid`, `competition_form_invalid`, `job_telegram_draft_click`, `competition_telegram_draft_click`, `job_copy_click`, `competition_copy_click`, `job_nav_click`, `competition_nav_click`, `competition_form_cta_click`, `job_cta_click`, `competition_cta_click`, `proof_gallery_cta_click`, `proof_image_open`, `scroll_25`, `scroll_50`, `scroll_75`, `scroll_90`.
- **Important:** `*_telegram_draft_click` measures an attempted open of the Telegram draft. It does *not* confirm that the candidate pressed Send in Telegram. A secure server and bot with verified delivery would be required for confirmed applications.
- No historical clicks, scrolls or visitor totals are available from before tracking was installed.
- Reports: [Google Analytics](https://analytics.google.com/analytics/web/) and [Clarity](https://clarity.microsoft.com/). In GA4 go to **Reports → Realtime** to verify; events normally become reportable after collection and processing. In Clarity inspect **Recordings**, **Heatmaps**, and **Events**.
- Custom event parameters like `proof_number` and `percent_scrolled` may require registering event-scoped custom dimensions in GA4 if you want those values in standard reports.
- Browser tracking can be limited by consent refusals, network filters, ad blockers, and privacy extensions.
