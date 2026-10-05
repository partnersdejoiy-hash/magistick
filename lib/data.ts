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
    excerpt: "One login, every app, every update. Here's how the new portal works and what to try first.",
    category: "Announcements",
    author: "DEJOIY People Team",
    date: "2026-10-05",
    body: [
      "magistick is the new front door to everything at DEJOIY BPO. Instead of bookmarking a dozen tools, you open one portal: your apps, your tickets, and every company update live here.",
      "Start with the app rail on this page — pin the apps you use daily and they'll stay at the top. Hit Get Help any time you need support; your tickets are raised and tracked right inside magistick, powered by OrbitDesk.",
      "This is day one. Tell us what's missing via Get Help — every suggestion lands directly with the team building this portal.",
    ],
  },
  {
    slug: "helpdesk-is-live",
    title: "The in-portal help desk is live",
    excerpt: "Raise and track support tickets without leaving magistick — no more tab-hopping.",
    category: "IT & Tools",
    author: "DEJOIY IT",
    date: "2026-10-05",
    body: [
      "The new Get Help page raises tickets directly into OrbitDesk and shows the full thread — status changes, agent replies, everything — right here in magistick.",
      "Your open tickets also appear on the home dashboard, so nothing slips through the cracks.",
    ],
  },
  {
    slug: "october-shift-notes",
    title: "October shift & leave notes",
    excerpt: "What to know about shift swaps and leave requests this month.",
    category: "Workforce",
    author: "WFM Team",
    date: "2026-10-04",
    body: [
      "Shift swap requests need 48 hours' notice through TimeTrack. Leave balances refresh on the 1st — check PaySlip if anything looks off and raise a ticket from Get Help.",
      "Festival-season rosters lock on the 20th. Talk to your team lead before then if you need changes.",
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
