# OrbitDesk interlink design — magistick ticket page

Investigated 2026-10-05 (read-only) against repo `partnersdejoiy-hash/Enterprise-Ticketing`,
branch `codex/bpo-intake-and-team-access`. **No OrbitDesk code, config, or data was modified.**

**Scope (per Deepak, 2026-10-05):** the OrbitDesk INLINE interlink covers GENERAL
tickets only (HR, payroll, WFM, facilities…). IT tickets keep Glowstick's exact
pattern — a "Submit IT Ticket" button that opens the dedicated IT tool
(ServiceNow-like, built separately later) in a new tab. The /help page therefore
has TWO paths: (1) OrbitDesk-inline general tickets, (2) external IT-tool button.

## What OrbitDesk exposes (public, documented API)

- Base URL: `https://orbitdesk.dejoiy.com` — Vercel serverless function (`api/index.ts`)
  wraps an Express app. All routes mount under **`/api`**.
- Full OpenAPI contract: `lib/api-spec/openapi.yaml` in the repo.

| Need | Method + path |
|---|---|
| Login | `POST /api/auth/login` `{email, password}` → 200 `{token, user}` + session cookie |
| Who am I | `GET /api/auth/me` |
| List tickets | `GET /api/tickets?status=&priority=&departmentId=&search=&page=&limit=` |
| Create ticket | `POST /api/tickets` `{subject*, description*, priority?, departmentId?, assigneeId?, tags?}` → 201 |
| Ticket detail | `GET /api/tickets/{id}` |
| Update ticket | `PATCH /api/tickets/{id}` |
| List comments | `GET /api/tickets/{id}/comments` |
| Add comment | `POST /api/tickets/{id}/comments` `{body}` → 201 |
| Departments (picker) | `GET /api/departments` |

Ticket statuses: `open, assigned, in_progress, waiting, resolved, closed`.
Priorities: `low, medium, high, urgent`.

## Auth mechanics (important)

- Login creates a DB-backed session (`orbit_sessions`, 8-hour expiry) and sets a
  host-only HttpOnly cookie (`__Host-orbit_session` in production).
- The session token is ALSO accepted as **`Authorization: Bearer <token>`**
  (`server/middlewares/auth.ts` → `sessionToken()`). This is the clean
  server-to-server path — no cookie jar needed.
- `POST /api/tickets` body: `subject` + `description` required.

## The gotcha: OrbitDesk's origin check

`server/app.ts` rejects non-GET API calls whose `Origin` header doesn't match
`APP_ORIGIN` (or the same host) → `403 "Invalid request origin"`; a request
carrying a cookie with no `Origin` → `403 "Origin required"`.
Server-side `fetch` sends no `Origin` by default, so the magistick proxy must
set `Origin: https://orbitdesk.dejoiy.com` (same host — passes the check) on
mutating requests. **No OrbitDesk change needed.**

## Recommendation: Option A — magistick server-side API proxy ✅

`magistick` (Next.js) exposes `/api/orbitdesk/[...path]` route handlers that:

1. On first use, `POST /api/auth/login` to OrbitDesk with a **service account**
   (`ORBITDESK_SERVICE_EMAIL` / `ORBITDESK_SERVICE_PASSWORD`, Vercel env vars only,
   never in code), extract the session token from `Set-Cookie`.
2. Cache the token in server memory (re-login on 401; sessions live 8h).
3. Forward employee requests as `Authorization: Bearer <token>`, with
   `Origin: https://orbitdesk.dejoiy.com` on POST/PATCH.
4. Return OrbitDesk's JSON straight through; map errors honestly
   (503 "OrbitDesk not connected" when env is missing).

Why A:
- **Zero changes** to OrbitDesk code, config, env, or DB. It is just another API
  client using the documented contract.
- All server-side logic stays intact: `ticket_number` generation, SLA deadlines,
  email notifications, ticket history/audit, and the **AI workers that auto-fire
  on new tickets** — all of which a direct-DB write would silently bypass.
- No CORS/third-party-cookie problems: the browser only ever talks to magistick.

Trade-offs (honest):
- One extra network hop (~50–150 ms) per ticket action.
- magistick ticket features depend on OrbitDesk being up (inherent — the data
  lives there).
- Phase 2 should provision **one OrbitDesk user per magistick employee**
  (role: `can_create_ticket=true`, `can_view_all_tickets=false`) so people only
  see their own tickets, instead of sharing one service account. The proxy
  already supports per-user tokens; only provisioning + login UX is left.

## Option B — direct Neon Postgres access ❌ (rejected for writes)

- Reads would work, but writes bypass ticket numbering, SLA, notifications,
  history, and AI-worker triggers → **breaks OrbitDesk behavior without
  touching its code** (exactly what Deepak forbade).
- Couples magistick to OrbitDesk's internal schema across migrations 007–014
  and requires sharing the production DB credential.

## Phase-2 wiring checklist (not done in scaffold)

1. Create service user in OrbitDesk (Settings → Users), role with ticket-create.
2. Set Vercel env on the magistick project: `ORBITDESK_BASE_URL`,
   `ORBITDESK_SERVICE_EMAIL`, `ORBITDESK_SERVICE_PASSWORD` (sensitive).
3. Flip the `/help` page from "not connected" to live; verify create → appears
   in OrbitDesk; verify comment round-trips.

## Phase 3 (2026-10-22): Get Help ↔ OrbitDesk, scoped per employee

The open catch-all proxy (`/api/orbitdesk/[...path]`) is **removed**: it let any
signed-in employee call any OrbitDesk endpoint as the shared account (and list
every ticket that account could see). It is replaced by four scoped routes:

| Route | Does |
|---|---|
| `GET /api/helpdesk/tickets` | The caller's own tickets from `helpdesk_tickets` (ownership table); open ones re-synced from OrbitDesk every 2 min, max 10 per call |
| `POST /api/helpdesk/tickets` | Validates category/subcategory (`lib/helpdesk.ts`), creates in OrbitDesk with `category`, `subcategory`, `raisedForUserId` (employee's OrbitDesk account, matched by email), `raisedForName/Email`, department by name, tag `magistick`; stores ownership |
| `GET /api/helpdesk/tickets/:id` | Only if the caller owns it; returns status, team, assignee, SLA, timeline, and **public replies only** (`isInternal === false`) |
| `POST /api/helpdesk/tickets/:id/reply` | Only if the caller owns it and it isn't closed; posts a public comment prefixed `Reply from <name>:` |

OrbitDesk side (repo Enterprise-Ticketing, branch `magistick-ticket-categories`):
`tickets.category` / `tickets.subcategory` columns (migration 015 + idempotent
startup patch), accepted on create/patch, list filter + `/api/tickets/categories`,
shown in the agent list and ticket sidebar.

Agents work tickets in OrbitDesk as before; magistick reflects status and public
replies (polling; OrbitDesk has no outbound webhooks yet).

Recommended integration account: an OrbitDesk `employee`-role user with
`canCreateTicket` and no direct reports, password changed after first login.
