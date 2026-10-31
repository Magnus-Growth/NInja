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

