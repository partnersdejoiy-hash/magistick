/**
 * DEJOIY Policy Center content. Original drafts written for DEJOIY (India,
 * BPO/ITES) on Indian law as of Oct 2026 — Labour Codes in force from
 * 21 Nov 2025 (incl. the Code on Social Security for maternity), POSH Act
 * 2013, DPDP Act 2023 and DPDP Rules 2025. Every policy is marked DRAFT until HR and legal sign off:
 * company-specific numbers (leave days, gift limits, timelines) are
 * proposals for HR to confirm.
 *
 * Each policy is a deck of slides; components/PolicyDeck.tsx renders them.
 */

import type { PhotoKey } from "./photos";

export type IconKey = "people" | "clock" | "wallet" | "book" | "wrench" | "chat" | "video" | "award" | "bulb" | "plane" | "userplus" | "gauge" | "ticket" | "globe";

export type Slide =
  | { kind: "cover" }
  | { kind: "statement"; text: string; note?: string; photo?: PhotoKey }
  | { kind: "grid"; title: string; items: { icon: IconKey; title: string; text: string }[] }
  | { kind: "dodont"; title: string; dos: string[]; donts: string[] }
  | { kind: "numbers"; title: string; items: { value: string; label: string }[]; photo?: PhotoKey }
  | { kind: "steps"; title: string; steps: { title: string; text: string }[] }
  | { kind: "contact"; title: string; text: string; lines: { label: string; value: string }[] };

export type Policy = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  group: "People" | "Workplace" | "Security";
  owner: string;
  version: string;
  effective: string;
  status: "Draft" | "Published";
  accent: string;
  photo: PhotoKey;
  slides: Slide[];
};

const HR_TICKET = "Get Help → General ticket → HR";

export const POLICIES: Policy[] = [
  {
    slug: "code-of-conduct",
    title: "Code of Conduct",
    kicker: "How we work together",
    summary: "Respect, honesty and fair play: the standard every DEJOIY person, from associate to director, signs up to.",
    group: "People",
    owner: "People Team",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#E91E63",
    photo: "conduct",
    slides: [
      { kind: "cover" },
      {
        kind: "statement",
        text: "We treat every colleague, client and customer the way we would want our own family treated on the other end of the line.",
        note: "This code applies on the floor, on calls, in chats, at offsites and online — wherever you represent DEJOIY.",
        photo: "teamwork",
      },
      {
        kind: "grid",
        title: "Our five commitments",
        items: [
          { icon: "people", title: "Respect", text: "No abuse, bullying, discrimination or humiliation — by anyone, toward anyone, for any reason." },
          { icon: "award", title: "Integrity", text: "Accurate records, honest metrics, no manipulated AHT, QA scores or attendance." },
          { icon: "globe", title: "Fairness", text: "Hiring, appraisal and promotion on merit. Caste, religion, gender, disability or region play no part." },
          { icon: "chat", title: "Professional voice", text: "Customers hear courtesy and patience, even when they don't offer it back." },
          { icon: "bulb", title: "Speak up", text: "If something feels wrong, raise it. Retaliating against someone who speaks up is itself misconduct." },
        ],
      },
      {
        kind: "dodont",
        title: "In practice",
        dos: [
          "Declare any relationship with a vendor, client or someone in your reporting line",
          "Keep personal social media free of client names, floor photos and customer stories",
          "Accept only token gifts; declare anything worth more than ₹2,000 to HR",
          "Dress business-casual on the floor and at client visits",
        ],
        donts: [
          "Offer or accept bribes, kickbacks or 'speed money' — in cash or kind",
          "Come to work under the influence of alcohol or drugs",
          "Run a side business that competes with DEJOIY or uses its time and tools",
          "Share salaries, appraisals or personal data of colleagues",
        ],
      },
      {
        kind: "steps",
        title: "If the code is broken",
        steps: [
          { title: "Report", text: "Tell your Team Leader, your HRBP, or raise a confidential HR ticket." },
          { title: "Review", text: "HR looks at the facts, hears both sides and keeps the matter confidential." },
          { title: "Outcome", text: "From coaching to warning to termination, in proportion to what happened." },
        ],
      },
      {
        kind: "contact",
        title: "Questions about the code",
        text: "Not sure whether something is allowed? Ask before you act — asking is never held against you.",
        lines: [
          { label: "Your first stop", value: "Your Team Leader or Manager" },
          { label: "Confidential", value: HR_TICKET },
        ],
      },
    ],
  },
  {
    slug: "attendance-and-shifts",
    title: "Attendance & Shift Adherence",
    kicker: "Being there for the queue",
    summary: "Shift timings, breaks, late marks, swaps, unplanned leave and night-shift safety — so every queue is staffed and every person is treated fairly.",
    group: "Workplace",
    owner: "Workforce Management",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#F59E0B",
    photo: "attendance",
    slides: [
      { kind: "cover" },
      {
        kind: "numbers",
        title: "A shift at a glance",
        items: [
          { value: "9 hrs", label: "Shift length, breaks included" },
          { value: "60 min", label: "Total breaks: 2 × 15 min + 30 min meal" },
          { value: "48 hrs", label: "Max weekly working hours (OSH Code)" },
          { value: "2×", label: "Overtime pay rate — and overtime is always voluntary" },
        ],
        photo: "support",
      },
      {
        kind: "grid",
        title: "Show up right",
        items: [
          { icon: "clock", title: "Log in on time", text: "Be on the floor and logged in to the dialler at shift start, not walking in." },
          { icon: "gauge", title: "Schedule adherence", text: "Breaks are taken when WFM schedules them, so the queue never goes dark." },
          { icon: "ticket", title: "Late marks", text: "Three late log-ins in a month start a conversation with your TL, not a penalty." },
          { icon: "people", title: "Roster", text: "Rosters publish every Friday for the following week. Weekly offs are fixed in advance." },
        ],
      },
      {
        kind: "steps",
        title: "Can't make it?",
        steps: [
          { title: "Planned", text: "Apply leave in advance; swaps need 48 hours' notice and both TLs' approval." },
          { title: "Unplanned", text: "Tell your TL and the WFM desk at least 2 hours before your shift starts." },
          { title: "No call, no show", text: "Three consecutive days without contact starts the absconding process — please call, even late." },
        ],
      },
      {
        kind: "statement",
        text: "Night shifts are safe shifts. Women work nights only with their written consent, with door-to-door cab drops, verified drivers and a guard on late routes.",
        note: "Transport and safety follow the state's night-shift conditions; WFM shares cab details before every rotation.",
        photo: "teamwork",
      },
      {
        kind: "contact",
        title: "Who to call",
        text: "Attendance questions, roster corrections and swap requests all go to WFM.",
        lines: [
          { label: "Roster & swaps", value: "Get Help → General ticket → WFM" },
          { label: "Cab & night transport", value: "Get Help → General ticket → Facilities" },
        ],
      },
    ],
  },
  {
    slug: "leave",
    title: "Leave Policy",
    kicker: "Rest is part of the job",
    summary: "Earned, casual, sick, parental and bereavement leave — how much you get, how it carries forward, and how to apply.",
    group: "People",
    owner: "People Team",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#14B8A6",
    photo: "leave",
    slides: [
      { kind: "cover" },
      {
        kind: "numbers",
        title: "Your yearly leave",
        items: [
          { value: "18", label: "Earned leave days (1.5 accrue each month)" },
          { value: "6 + 6", label: "Casual + sick leave days" },
          { value: "26 wks", label: "Maternity leave (Code on Social Security)" },
          { value: "5 days", label: "Paternity leave" },
        ],
        photo: "celebration",
      },
      {
        kind: "grid",
        title: "How it works",
        items: [
          { icon: "plane", title: "Earned leave", text: "Eligible once you've worked 180 days in the calendar year, as the Labour Codes now set." },
          { icon: "wallet", title: "Carry forward", text: "Up to 30 unused earned-leave days roll over; anything above 30 is paid out at year end." },
          { icon: "book", title: "Sick leave", text: "More than 2 days in a row needs a doctor's note, shared privately with HR." },
          { icon: "people", title: "Bereavement", text: "3 paid days for the loss of an immediate family member, no questions asked." },
        ],
      },
      {
        kind: "steps",
        title: "Applying",
        steps: [
          { title: "Plan", text: "Apply earned leave at least 7 days ahead so WFM can staff the queue." },
          { title: "Approve", text: "Your TL approves within 2 working days; festival-week requests follow the roster lock." },
          { title: "Track", text: "Your balance and history are always visible in the HR app." },
        ],
      },
      {
        kind: "statement",
        text: "Leave that's refused because of business need is never lost — it carries forward in full, beyond the 30-day cap.",
        photo: "wfh",
      },
      {
        kind: "contact",
        title: "Leave questions",
        text: "Balance looks wrong or a request is stuck? HR will sort it.",
        lines: [{ label: "Raise it", value: HR_TICKET }],
      },
    ],
  },
  {
    slug: "information-security",
    title: "Information Security & Client Confidentiality",
    kicker: "Our clients trust us with their customers",
    summary: "How we protect client data and customers' personal information on the floor, at home and in every tool — in line with the DPDP Act 2023.",
    group: "Security",
    owner: "Information Security",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#3B82F6",
    photo: "security",
    slides: [
      { kind: "cover" },
      {
        kind: "statement",
        text: "A single leaked card number or phone list can cost a client — and every one of us — the account. Security is everyone's KPI.",
        note: "Personal data is handled under the Digital Personal Data Protection Act, 2023 and each client's contract.",
        photo: "itUse",
      },
      {
        kind: "dodont",
        title: "On the production floor",
        dos: [
          "Lock your screen (Win + L) every time you step away",
          "Keep phones, bags and paper in your locker before entering the floor",
          "Verify a customer's identity exactly as the process says, every time",
          "Shred notes at shift end — clean desk, always",
        ],
        donts: [
          "Write down, photograph or screenshot card numbers, OTPs or customer details",
          "Share your login, or log in for someone else",
          "Paste client or customer data into public AI tools, chats or personal email",
          "Plug in USB drives or personal devices",
        ],
      },
      {
        kind: "grid",
        title: "Data you handle",
        items: [
          { icon: "globe", title: "Collect the minimum", text: "Ask only what the process needs. Never store extra copies." },
          { icon: "wrench", title: "Access by role", text: "You see only the systems your process needs; access ends when you move." },
          { icon: "gauge", title: "Monitored systems", text: "Production systems are logged and monitored to protect clients and you." },
        ],
      },
      {
        kind: "steps",
        title: "Spotted something?",
        steps: [
          { title: "Stop", text: "Don't try to fix or hide it. Don't forward the data anywhere." },
          { title: "Report within 1 hour", text: "Tell your TL and raise an IT ticket marked 'Security incident'." },
          { title: "Help us contain", text: "InfoSec investigates and handles client and legal notifications." },
        ],
      },
      {
        kind: "contact",
        title: "Security help",
        text: "Reporting a mistake quickly is always treated better than hiding it.",
        lines: [
          { label: "Security incident", value: "IT ticket → 'Security incident'" },
          { label: "Policy questions", value: "Information Security team via Get Help" },
        ],
      },
    ],
  },
  {
    slug: "posh",
    title: "Prevention of Sexual Harassment (POSH)",
    kicker: "Safe for everyone, always",
    summary: "Zero tolerance for sexual harassment. What counts, how to complain to the Internal Committee, and how complaints are handled under the POSH Act, 2013.",
    group: "People",
    owner: "Internal Committee",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#A855F7",
    photo: "posh",
    slides: [
      { kind: "cover" },
      {
        kind: "statement",
        text: "Sexual harassment has no place at DEJOIY — not on the floor, not in a cab, not on WhatsApp, not at an offsite.",
        note: "The POSH Act, 2013 protects women at the workplace. DEJOIY extends the same protection and process to people of every gender.",
        photo: "grievance",
      },
      {
        kind: "grid",
        title: "What counts",
        items: [
          { icon: "people", title: "Physical", text: "Unwelcome touching, contact or advances." },
          { icon: "chat", title: "Verbal & written", text: "Sexual remarks, jokes, requests for favours, messages or calls." },
          { icon: "video", title: "Visual", text: "Showing explicit images, videos or gestures." },
          { icon: "gauge", title: "Quid pro quo", text: "Promises of promotion, or threats to your job, linked to sexual favours." },
        ],
      },
      {
        kind: "steps",
        title: "How a complaint works",
        steps: [
          { title: "File within 3 months", text: "In writing to the Internal Committee (IC), from the last incident; the IC can extend by 3 more months." },
          { title: "Conciliation, if you ask", text: "Only at the complainant's request, and never with money as a settlement." },
          { title: "Inquiry in 90 days", text: "Both sides are heard; the respondent replies within 10 days." },
          { title: "Report & action", text: "The IC reports within 10 days of the inquiry; DEJOIY acts within 60 days." },
        ],
      },
      {
        kind: "dodont",
        title: "Your protections",
        dos: [
          "Everything you share stays confidential — by law",
          "You can ask for interim relief: a team or shift change, or leave, while the inquiry runs",
          "Witnesses and supporters are protected too",
        ],
        donts: [
          "No one may retaliate against a complainant or witness — that is misconduct in itself",
          "No one may pressure you to withdraw or 'settle' a complaint",
        ],
      },
      {
        kind: "contact",
        title: "The Internal Committee",
        text: "Led by a senior woman employee, with at least two employee members and one external member; at least half the IC are women. Names are posted on every floor.",
        lines: [
          { label: "Confidential complaint", value: "IC via " + HR_TICKET + " (marked 'POSH')" },
          { label: "Urgent safety concern", value: "Your floor security desk, any time" },
        ],
      },
    ],
  },
  {
    slug: "work-from-home",
    title: "Work From Home & Hybrid",
    kicker: "Same standards, different desk",
    summary: "Who can work from home, the set-up we need, and the security rules that come with it.",
    group: "Workplace",
    owner: "Operations",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#10B981",
    photo: "wfh",
    slides: [
      { kind: "cover" },
      {
        kind: "statement",
        text: "Remote work is a trust arrangement between you, your manager and our client. Many client contracts don't allow it — and that's their call.",
        photo: "support",
      },
      {
        kind: "grid",
        title: "Eligibility",
        items: [
          { icon: "award", title: "Client approval", text: "Your process must be cleared for remote work in the client contract." },
          { icon: "gauge", title: "Track record", text: "Usually after training and nesting, with steady quality and adherence." },
          { icon: "people", title: "Manager approval", text: "Approved for a defined period and reviewed every quarter." },
        ],
      },
      {
        kind: "dodont",
        title: "Your home set-up",
        dos: [
          "A private, quiet room where no one can see your screen or hear the call",
          "Company laptop and headset only, on a wired or secured home network",
          "Camera on for huddles and coaching sessions",
          "Same login times, breaks and adherence as the floor",
        ],
        donts: [
          "Work from cafés, public Wi-Fi or shared spaces",
          "Let family members use the company laptop",
          "Print or write down any customer information",
        ],
      },
      {
        kind: "contact",
        title: "Requesting WFH",
        text: "Talk to your manager first; they confirm the client's position.",
        lines: [
          { label: "Equipment & network", value: "IT ticket" },
          { label: "Approval questions", value: HR_TICKET },
        ],
      },
    ],
  },
  {
    slug: "it-acceptable-use",
    title: "IT Acceptable Use",
    kicker: "Company tools, used well",
    summary: "Rules for laptops, email, internet, software and AI tools at DEJOIY.",
    group: "Security",
    owner: "IT",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#0EA5E9",
    photo: "itUse",
    slides: [
      { kind: "cover" },
      {
        kind: "grid",
        title: "The basics",
        items: [
          { icon: "wrench", title: "Company devices", text: "Laptops, headsets and accounts belong to DEJOIY and are returned on exit." },
          { icon: "globe", title: "Monitoring", text: "Company systems, email and internet use are logged for security." },
          { icon: "book", title: "Software", text: "Install only what IT approves — ask through an IT ticket." },
          { icon: "bulb", title: "AI tools", text: "Use only DEJOIY-approved AI tools, and never with client or customer data." },
        ],
      },
      {
        kind: "dodont",
        title: "Everyday use",
        dos: [
          "Use a strong passphrase and turn on multi-factor sign-in",
          "Report lost or stolen devices to IT immediately",
          "Keep personal browsing light, and never on production systems",
        ],
        donts: [
          "Forward work email to personal accounts",
          "Disable antivirus, VPN or screen lock",
          "Visit illegal, adult or gambling sites on company devices",
        ],
      },
      {
        kind: "statement",
        text: "If an email feels urgent, asks for a password or a payment, and comes from 'the CEO' — it's almost certainly phishing. Report it, don't reply.",
        photo: "security",
      },
      {
        kind: "contact",
        title: "IT help",
        text: "Laptop, network, access and password problems go to the IT help desk.",
        lines: [{ label: "Raise it", value: "Get Help → IT ticket" }],
      },
    ],
  },
  {
    slug: "grievance-and-whistleblower",
    title: "Grievance & Whistleblower",
    kicker: "Every voice gets heard",
    summary: "How to raise a workplace concern, how fast we respond, and how to report wrongdoing safely — even anonymously.",
    group: "People",
    owner: "People Team",
    version: "0.9",
    effective: "On HR approval",
    status: "Draft",
    accent: "#F97316",
    photo: "grievance",
    slides: [
      { kind: "cover" },
      {
        kind: "steps",
        title: "Raising a grievance",
        steps: [
          { title: "Team Leader", text: "Most issues — rosters, targets, tools — are fixed fastest here." },
          { title: "Manager / HRBP", text: "If it isn't resolved, or involves your TL, go one level up or to your HRBP." },
          { title: "Grievance Redressal Committee", text: "Equal employer and employee representation, as the Industrial Relations Code requires; decides within 30 days." },
        ],
      },
      {
        kind: "numbers",
        title: "Our promise",
        items: [
          { value: "2 days", label: "To acknowledge your grievance" },
          { value: "15 days", label: "Target to resolve at HRBP level" },
          { value: "30 days", label: "For a committee decision" },
          { value: "0", label: "Tolerance for retaliation" },
        ],
        photo: "teamwork",
      },
      {
        kind: "statement",
        text: "Seen fraud, data misuse, bribery or a safety risk? Report it — named or anonymous. Good-faith whistleblowers are protected, even if the concern turns out unfounded.",
        note: "Whistleblower reports go to a senior leader outside your reporting line.",
        photo: "conduct",
      },
      {
        kind: "contact",
        title: "Where to go",
        text: "Choose the channel you're comfortable with.",
        lines: [
          { label: "Grievance", value: HR_TICKET },
          { label: "Whistleblower", value: "Get Help → General ticket → 'Whistleblower' (name optional)" },
        ],
      },
    ],
  },
];

export const POLICY_BY_SLUG = Object.fromEntries(POLICIES.map((p) => [p.slug, p])) as Record<string, Policy>;
