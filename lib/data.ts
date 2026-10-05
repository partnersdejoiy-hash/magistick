import type { AppIconKey } from "@/components/icons";

export type AppEntry = {
  id: string;
  name: string;
  blurb: string;
  category: string;
  href: string;
  /** key into APP_ICONS in components/icons.tsx */
  icon: AppIconKey;
};

export const APP_CATEGORIES = [
  "All",
  "People & HR",
  "Pay & Time",
  "Learning",
  "IT & Tools",
  "Culture",
] as const;

/** BPO app catalog. Real SSO links replace hrefs in phase 2. */
export const APPS: AppEntry[] = [
  { id: "hrms", name: "PeopleHub", blurb: "Profiles, documents & the org chart", category: "People & HR", href: "#", icon: "people" },
  { id: "attendance", name: "TimeTrack", blurb: "Shifts, attendance & time-off requests", category: "Pay & Time", href: "#", icon: "clock" },
  { id: "payroll", name: "PaySlip", blurb: "Payslips, tax forms & reimbursements", category: "Pay & Time", href: "#", icon: "wallet" },
  { id: "learning", name: "SkillUp", blurb: "Onboarding paths & the training library", category: "Learning", href: "#", icon: "book" },
  { id: "it", name: "FixIt", blurb: "Report device, network & access issues", category: "IT & Tools", href: "#", icon: "wrench" },
  { id: "chat", name: "TeamChat", blurb: "Team messaging & channels", category: "IT & Tools", href: "#", icon: "chat" },
  { id: "meet", name: "MeetUp", blurb: "Video meetings & daily huddles", category: "IT & Tools", href: "#", icon: "video" },
  { id: "rewards", name: "Shine", blurb: "Recognize teammates & nominations", category: "Culture", href: "#", icon: "award" },
  { id: "ideas", name: "BrightIdeas", blurb: "Suggest process improvements", category: "Culture", href: "#", icon: "bulb" },
  { id: "travel", name: "GoFar", blurb: "Travel bookings & expense claims", category: "People & HR", href: "#", icon: "plane" },
  { id: "refer", name: "ReferWin", blurb: "Refer candidates, earn bonuses", category: "People & HR", href: "#", icon: "userplus" },
  { id: "quality", name: "QualityLens", blurb: "Audit scores & quality dashboards", category: "IT & Tools", href: "#", icon: "gauge" },
];

/** Restrained duotone chip per category — ink icon on a soft warm tint. */
export const CATEGORY_TINT: Record<string, string> = {
  "People & HR": "bg-rose-100 text-rose-900",
  "Pay & Time": "bg-emerald-100 text-emerald-900",
  Learning: "bg-amber-100 text-amber-900",
  "IT & Tools": "bg-sky-100 text-sky-900",
  Culture: "bg-orange-100 text-orange-900",
};

export function tintFor(category: string): string {
  return CATEGORY_TINT[category] ?? "bg-stone-200 text-stone-800";
}

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  body: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "welcome-to-magistick",
    title: "Welcome to magistick — your new home base",
    excerpt: "One portal for every app, update, and ticket. Here's how it works and the three things to try today.",
    category: "Announcements",
    author: "DEJOIY People Team",
    date: "2026-10-05",
    body: [
      "Until today, getting work done meant keeping a dozen bookmarks, asking in three different chat groups where the leave form lives, and losing tickets in email threads. magistick replaces all of that with one front door: your apps, your support tickets, and every company update live here, in one calm place.",
      "Three things worth doing on day one. First, open the app rail below and pin the tools you touch every day — pinned apps stay at the top on every visit. Second, visit Get Help and skim how ticketing works; the day something breaks, you'll already know where to go. Third, check the bulletin below whenever you want the pulse of the company — that's where announcements, IT notices, and workforce news will land from now on.",
      "A note on honesty: this portal is brand new, and the app tiles currently open placeholder links while we wire up single sign-on for each tool. Don't be alarmed — your real logins aren't going anywhere, and we'll announce each app as its SSO goes live.",
      "This is your portal as much as ours. If something's missing, confusing, or just plain ugly, raise a general ticket from Get Help — every suggestion lands directly with the team building magistick, and we read all of them.",
    ],
  },
  {
    slug: "how-get-help-works",
    title: "How Get Help works: two paths, zero confusion",
    excerpt: "General tickets stay inside magistick; IT issues go to the dedicated IT tool. Here's the map.",
    category: "Support",
    author: "Magistick Team",
    date: "2026-10-05",
    body: [
      "Get Help has two doors, and picking the right one is the difference between a same-day fix and a ticket ping-ponging between teams. Door one is General tickets — HR, payroll, workforce management, facilities, and anything about magistick itself. These are raised and tracked right here in the portal, powered by OrbitDesk: you get a ticket number, a live thread with every status change and agent reply, and nothing ever leaves this tab.",
      "Door two is the Submit IT Ticket button, which opens our dedicated IT help-desk tool in a new tab. Device, network, VPN, and access issues live there because they need the IT team's specialized queue — things like asset tracking and remote diagnostics that a general ticket simply can't do.",
      "After you raise a ticket, it appears under My tickets with a status filter — All, Open, In Progress, Waiting, Resolved, Closed. You'll get email notifications on replies and status changes, and you can reply right in the thread. If a resolved ticket's fix didn't actually stick, reply in the same thread within a few days rather than opening a duplicate.",
      "One rule of thumb: if it involves your laptop, the network, or a password, go IT. If it involves your pay, your shift, a policy question, or this portal, go General. When in doubt, raise General — we'll route it, and routing inside the system is always faster than guessing wrong in email.",
    ],
  },
  {
    slug: "write-a-ticket-that-gets-fixed",
    title: "Write a ticket that gets fixed: the 3-line formula",
    excerpt: "Most slow tickets aren't slow — they're vague. Here's how to write one an agent can act on immediately.",
    category: "Support",
    author: "DEJOIY Support",
    date: "2026-10-04",
    body: [
      "Here's the uncomfortable truth about support queues: the tickets that sit longest are rarely the hardest problems — they're the vaguest ones. 'Payroll issue' tells an agent nothing; 'September overtime missing from 28 Sep payslip — 6 hours, TimeTrack shows approved' tells them everything. Your subject line is the whole pitch: what, when, and the key detail, in one line.",
      "Every ticket needs three things. First, what you expected to happen. Second, what actually happened — the exact error message, the wrong number, the blank screen. Third, how to reproduce it: which app, which page, which buttons you clicked, in order. If there's a screenshot, attach it; a screenshot of an error is worth three paragraphs of description.",
      "Keep it to one issue per ticket. Bundling 'payslip wrong + laptop slow + leave balance off' into a single ticket guarantees it bounces between three teams and gets fixed by none of them. And if a ticket was already resolved, don't reopen it with a brand-new problem — raise a fresh one so it gets its own owner and timeline.",
      "Finally, priority is not a volume knob. Marking everything urgent trains everyone to ignore the label. Use the priority honestly — urgent is for 'I cannot work right now' — and the genuinely urgent things will actually get the fast lane.",
    ],
  },
  {
    slug: "october-roster-lock",
    title: "October roster notes: swaps, leave, and the festival lock",
    excerpt: "Shift swaps need 48 hours' notice, leave balances just refreshed, and festival rosters lock on the 20th.",
    category: "Workforce",
    author: "WFM Team",
    date: "2026-10-03",
    body: [
      "October is our busiest rostering month, so here's everything in one place. Shift swap requests need a full 48 hours' notice through TimeTrack — swaps requested inside that window will be declined automatically, no exceptions, because the floor plan is already printed.",
      "Leave balances refreshed on the 1st. If your balance looks wrong, check PaySlip first — most 'missing leave' reports turn out to be the new carry-forward cap. If it still looks off after that, raise a General ticket from Get Help with a screenshot and we'll reconcile it within two working days.",
      "The big one: festival-season rosters lock on the 20th of October. After lock, changes need your team lead's written approval plus WFM sign-off, and honest advice — get your requests in by the 18th. Talk to your team lead this week if you have travel planned.",
      "Overtime this month is pre-approved for the night batch only. If you're on day shift and staying late, log it in TimeTrack the same day; backdated overtime entries need manager approval and slow down your payout.",
    ],
  },
  {
    slug: "pin-your-daily-drivers",
    title: "Pin your daily drivers: make the app rail yours",
    excerpt: "Pin the tools you use daily, search the directory, and here's how to request a new app tile.",
    category: "Product",
    author: "Magistick Team",
    date: "2026-10-02",
    body: [
      "The app rail on the home page is yours to arrange. Hover any tile and hit the pin — pinned apps jump to the front of the rail and stay there on every visit, on every device. Unpin just as easily. Most people end up with four or five daily drivers pinned and the rest a scroll away, which is exactly the point: your morning starts with one glance, not a bookmark folder.",
      "Looking for something specific? The Apps page is the full directory — search by name or filter by category: People & HR, Pay & Time, Learning, IT & Tools, Culture. Every tile shows what the tool is actually for, so you're not guessing from cryptic names.",
      "Need an app that isn't there? Raise a General ticket from Get Help with three things: the app's name, its login URL, and who needs access. We'll verify the license, wire up single sign-on where the vendor supports it, and add the tile. Most requests take about a week end to end.",
      "One security note while we're here: never paste passwords into a ticket, a post, or chat. If IT needs credentials for a fix, they'll ask through the proper channel — anyone asking for your password in a ticket thread isn't IT.",
    ],
  },
  {
    slug: "shine-kudos-corner",
    title: "Shine: the kudos corner is open for October",
    excerpt: "Nominations are open — here's what makes recognition actually land.",
    category: "Culture",
    author: "DEJOIY People Team",
    date: "2026-10-01",
    body: [
      "Shine is our rewards and recognition wall, and October nominations are open now. Anyone can nominate anyone — peer to peer, no manager approval needed to say thank you. The monthly spotlight goes to the nominations with the most specific stories, not the most votes.",
      "What makes a nomination land? Specificity. 'Thanks for the help' is nice and forgotten by lunch. 'Priya stayed 40 minutes late on Thursday to walk me through the new QA rubric before my first audit' gets read aloud in the town hall and remembered. Name the moment, name the impact.",
      "You can also just browse the wall. It's the fastest way to learn who's doing great work outside your own team — and half the point of Shine is that recognition is public, so the whole floor sees what great looks like.",
      "Winners are announced in the first week of November right here in the bulletin. Get your nominations in by the 28th — and yes, nominating your whole team for pulling off the festival roster counts.",
    ],
  },
  {
    slug: "helpdesk-is-live",
    title: "The in-portal help desk is live",
    excerpt: "Raise and track support tickets without leaving magistick — threads, statuses, and replies, all inline.",
    category: "Announcements",
    author: "DEJOIY IT",
    date: "2026-10-05",
    body: [
      "The new Get Help page is live, and it's the biggest change to support since the portal launched. General tickets — HR, payroll, WFM, facilities — are raised directly into OrbitDesk and the entire thread lives here: status changes, agent replies, your follow-ups, all inline. No tab-hopping, no black hole.",
      "Your open tickets also surface on the home dashboard, so the things waiting on you are visible the moment you log in. Filter by status, search by keyword, and watch the thread instead of chasing email.",
      "IT issues keep their dedicated lane: the Submit IT Ticket button opens the IT help-desk tool, where device, network, and access problems get the specialized queue they need. Read 'How Get Help works' in the bulletin if you're unsure which door to pick.",
      "This is the foundation — next up is the dedicated IT tool itself, then ticket SLAs displayed right on the thread. As always, tell us what's broken via Get Help. We mean that literally.",
    ],
  },
];

export type Person = { name: string; role: string; team: string; site: string };

export const PEOPLE: Person[] = [
  { name: "Deepak Sharma", role: "Operations", team: "Leadership", site: "Gurugram" },
  { name: "Aarav Mehta", role: "Team Lead", team: "Customer Support", site: "Gurugram" },
  { name: "Sana Iqbal", role: "Quality Analyst", team: "Quality", site: "Remote" },
  { name: "Rohan Verma", role: "IT Support", team: "IT", site: "Gurugram" },
];

/**
 * External IT help-desk tool (ServiceNow-like). Built separately later —
 * magistick keeps Glowstick's pattern: a "Submit IT Ticket" button that opens
 * the external tool in a new tab. "#" until the tool exists.
 */
export const IT_HELPDESK_URL = "#";
