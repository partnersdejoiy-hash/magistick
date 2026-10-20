# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Every employee of DEJOIY's BPO, across the whole hierarchy: trainees and associates on the production floor (often on shared desktops, between calls or at shift start), support functions (QA, trainers, SMEs, WFM, MIS), team leaders and managers running teams, department heads, HR/Payroll/IT/Admin staff answering tickets, and the Super Admin (the founder, who owns the portal). Most visits are short and task-shaped: open an app, check an update, raise or chase a ticket, find a person or their manager.

## Product Purpose

magistick (magistick.dejoiy.com) is DEJOIY's employee portal: one front door for company apps, company updates, help tickets, the people directory and onboarding. It replaces scattered bookmarks, chat groups and email threads. Success: an employee reaches the right app, update, person or ticket in seconds, and sees only what their role and department should see.

## Positioning

Modelled on TaskUs Glowstick (the reference intranet audited 2026-10-21: app launcher rail, announcement carousel, categorized updates feed, org-chart directory with reporting chain, ticket types per support function, new-hire guide, quick links) but built for a BPO's real hierarchy: every level from Trainee to Super Admin and every department has its own permission set, editable live by the Super Admin, and the portal itself shows each person a scoped world.

## Operating Context

- Shift-based BPO floor (India, Asia/Kolkata), shared and personal desktops, also phones.
- Hierarchy (confirmed): Super Admin > Admin > Department Head / VP > Senior Manager / AVP > Operations Manager > Assistant Manager > Team Leader > Support specialist (QA / Trainer / SME / WFM / MIS) > Senior Associate > Associate > Trainee.
- Departments (confirmed: all): Operations, Quality, Training, WFM, MIS, HR, Payroll & Finance, Recruitment, IT, Admin & Facilities, Leadership, Sales & BD.
- Tickets: general tickets run through OrbitDesk (orbitdesk.dejoiy.com) via server proxy; IT tickets go to a separate IT tool (not built yet).
- Launch apps: Chronix, OrbitDesk. More are added by admins.

## Capabilities and Constraints

- Next.js 14 App Router, Tailwind, Neon Postgres, JWT cookie sessions; deployed on Vercel from `main` (push = live).
- Email + password login; first admin bootstrapped from env vars.
- Permissions are enforced server-side; the UI only reflects them.
- Undecided: SSO, HR system sync for the directory, the IT ticket tool.

## Brand Commitments

- Name: magistick (lowercase in running text), app of DEJOIY.
- The previous Glowstick-matched look is explicitly being replaced (user chose a fresh redesign, 2026-10-21).

## Evidence on Hand

- Seed bulletin articles in `lib/data.ts` (real, written for launch).
- No real employee data in the repo; the directory fills from users admins create. Do not fabricate employees, metrics or testimonials in shipped UI.

## Product Principles

1. Scoped by default: each person sees the apps, updates and people their role and department allow; nothing more.
2. The hierarchy is the product: reporting lines, levels and departments are first-class data, not labels.
3. Seconds, not minutes: the most common jobs (open app, raise ticket, find manager) are one or two moves from any page.
4. The Super Admin can change any rule without a deploy.

## Accessibility & Inclusion

Keyboard reachable everywhere, visible focus, WCAG AA contrast; shared floor machines mean no reliance on hover-only affordances.
