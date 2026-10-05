# magistick

DEJOIY BPO's employee portal — one home for every app, company update, and support ticket.
Inspired by TaskUs Glowstick, built to beat it.

## What's inside

- **Home** — personalized greeting, pinnable app launcher, latest updates
- **Apps** — searchable, categorized app directory with pin-to-top (localStorage)
- **Updates** — article feed + article pages (author + date shown)
- **Get Help** — My Tickets: raise + track OrbitDesk tickets **inline** via a
  server-side proxy (`/api/orbitdesk/*`) — no new tab, no OrbitDesk code changes
- **Directory** — people search placeholder

## Run locally

```bash
npm install
npm run dev
```

## OrbitDesk wiring (phase 2)

The ticket page works without any OrbitDesk changes. To go live, set these env vars
(Vercel project → Environment Variables, Production, sensitive):

- `ORBITDESK_BASE_URL` — e.g. `https://orbitdesk.dejoiy.com`
- `ORBITDESK_SERVICE_EMAIL` — service user created inside OrbitDesk
- `ORBITDESK_SERVICE_PASSWORD`

Design doc: `docs/orbitdesk-interlink.md`

## Deploy

Vercel project linked to this repo (team: dejoiy). Every push to `main` deploys.
