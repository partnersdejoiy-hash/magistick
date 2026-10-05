export type AppEntry = {
  id: string;
  name: string;
  blurb: string;
  category: string;
  href: string;
  /** tailwind gradient classes for the tile icon */
  tile: string;
};

export const APP_CATEGORIES = [
  "All",
  "People & HR",
  "Pay & Time",
  "Learning",
  "IT & Tools",
  "Culture",
] as const;

/** Placeholder BPO app catalog. Real SSO links replace hrefs in phase 2. */
export const APPS: AppEntry[] = [
  { id: "hrms", name: "PeopleHub", blurb: "Profile, documents, org chart", category: "People & HR", href: "#", tile: "from-violet-500 to-fuchsia-600" },
  { id: "attendance", name: "TimeTrack", blurb: "Attendance, shifts, time-off", category: "Pay & Time", href: "#", tile: "from-sky-500 to-blue-600" },
  { id: "payroll", name: "PaySlip", blurb: "Payslips & tax forms", category: "Pay & Time", href: "#", tile: "from-emerald-500 to-teal-600" },
  { id: "learning", name: "SkillUp", blurb: "Onboarding & training tracks", category: "Learning", href: "#", tile: "from-amber-500 to-orange-600" },
  { id: "it", name: "FixIt", blurb: "IT incidents & requests", category: "IT & Tools", href: "#", tile: "from-rose-500 to-red-600" },
  { id: "chat", name: "TeamChat", blurb: "Team messaging", category: "IT & Tools", href: "#", tile: "from-indigo-500 to-violet-600" },
  { id: "meet", name: "MeetUp", blurb: "Video meetings", category: "IT & Tools", href: "#", tile: "from-cyan-500 to-sky-600" },
  { id: "rewards", name: "Shine", blurb: "Rewards & recognition", category: "Culture", href: "#", tile: "from-yellow-400 to-amber-600" },
  { id: "ideas", name: "BrightIdeas", blurb: "Suggest improvements", category: "Culture", href: "#", tile: "from-lime-500 to-green-600" },
  { id: "travel", name: "GoFar", blurb: "Travel & expenses", category: "People & HR", href: "#", tile: "from-purple-500 to-indigo-600" },
  { id: "refer", name: "ReferWin", blurb: "Refer candidates, earn rewards", category: "People & HR", href: "#", tile: "from-pink-500 to-rose-600" },
  { id: "quality", name: "QualityLens", blurb: "Audits & quality scores", category: "IT & Tools", href: "#", tile: "from-teal-500 to-emerald-600" },
];

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
      "Start with the app launcher on this page — pin the apps you use daily and they'll stay at the top. Hit Get Help any time you need support; your tickets are raised and tracked right inside magistick, powered by OrbitDesk.",
      "This is day one. Tell us what's missing via Get Help → Suggest an improvement.",
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
      "Your open tickets also appear on the home dashboard, so nothing slips.",
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
