/**
 * Get Help request taxonomy (client-safe). Each category maps to an OrbitDesk
 * department by name (first case-insensitive match wins; no match lets
 * OrbitDesk's own classifier route it). IT is not here: IT tickets go to the
 * separate IT tool. POSH complaints are never raised here; they go to the
 * Internal Committee directly (see the POSH policy).
 */

export type Subcategory = { name: string; hint: string; priority?: "low" | "medium" | "high" | "urgent" };
export type Category = {
  id: string;
  name: string;
  blurb: string;
  icon: "people" | "wallet" | "clock" | "plane" | "gauge" | "award" | "userplus" | "chat" | "globe" | "book";
  color: string;
  orbitDepartments: string[];
  subcategories: Subcategory[];
};

export const CATEGORIES: Category[] = [
  {
    id: "hr",
    name: "HR",
    blurb: "Letters, records, policies, joining and exit",
    icon: "people",
    color: "#E91E63",
    orbitDepartments: ["HR", "Human Resources", "People"],
    subcategories: [
      { name: "Employment or experience letter", hint: "Which letter, addressed to whom, and by when you need it." },
      { name: "Update my personal details", hint: "What changed (address, phone, emergency contact, name) and the new details." },
      { name: "Policy question", hint: "Which policy and what you'd like to know." },
      { name: "Joining documents", hint: "Which document is pending or needs correcting." },
      { name: "Resignation, exit or F&F", hint: "Your last working day and what you need help with." },
      { name: "Other HR query", hint: "Tell us what you need." },
    ],
  },
  {
    id: "payroll",
    name: "Payroll & Reimbursements",
    blurb: "Salary, payslips, tax, PF and claims",
    icon: "wallet",
    color: "#14B8A6",
    orbitDepartments: ["Payroll", "Payroll & Finance", "Finance", "Accounts"],
    subcategories: [
      { name: "Salary not credited or short paid", hint: "Month, amount expected and amount received.", priority: "high" },
      { name: "Payslip query", hint: "Month and the line you have a question about." },
      { name: "Tax, TDS or Form 16", hint: "Financial year and what you need (proofs, Form 16, regime change)." },
      { name: "PF or ESIC", hint: "UAN/ESIC number (if you have it) and the issue." },
      { name: "Reimbursement claim", hint: "Expense type, date and amount. Keep the bills ready." },
      { name: "Bank account change", hint: "Bank name and the last 4 digits only. Never share full account numbers here." },
    ],
  },
  {
    id: "wfm",
    name: "Attendance & WFM",
    blurb: "Punches, rosters, shifts and overtime",
    icon: "clock",
    color: "#F59E0B",
    orbitDepartments: ["WFM", "Workforce Management", "Operations"],
    subcategories: [
      { name: "Attendance correction or missed punch", hint: "Date, shift timing and the actual log-in/log-out time." },
      { name: "Roster or shift change", hint: "Which week, current shift and the shift you need, with the reason." },
      { name: "Shift swap", hint: "Date, and the colleague you're swapping with (both TLs must approve)." },
      { name: "Week-off change", hint: "Current week-off and the day you'd like instead." },
      { name: "Overtime", hint: "Date and hours worked, and who approved the overtime." },
    ],
  },
  {
    id: "leave",
    name: "Leave",
    blurb: "Balances, approvals and parental leave",
    icon: "plane",
    color: "#3B82F6",
    orbitDepartments: ["HR", "Human Resources", "WFM"],
    subcategories: [
      { name: "Leave balance looks wrong", hint: "Leave type, the balance you see and the balance you expect." },
      { name: "Leave request stuck", hint: "Dates applied for and when you applied." },
      { name: "Maternity or paternity leave", hint: "Expected date and the leave dates you plan." },
      { name: "Comp-off", hint: "The date you worked and the comp-off date you want." },
    ],
  },
  {
    id: "transport",
    name: "Transport",
    blurb: "Cabs, pick-up and drop, night safety",
    icon: "gauge",
    color: "#EF4444",
    orbitDepartments: ["Transport", "Admin & Facilities", "Facilities", "Admin"],
    subcategories: [
      { name: "Cab late or did not come", hint: "Date, shift, route or cab number, and what happened.", priority: "high" },
      { name: "Change pick-up or drop address", hint: "New address with a landmark, and from which date." },
      { name: "Night-shift safety concern", hint: "Date, route and what happened. In an emergency, call the security desk first.", priority: "urgent" },
      { name: "New cab request", hint: "Shift timing, address and start date." },
    ],
  },
  {
    id: "facilities",
    name: "Facilities & Admin",
    blurb: "Desk, ID card, cafeteria, upkeep",
    icon: "globe",
    color: "#84CC16",
    orbitDepartments: ["Admin & Facilities", "Facilities", "Admin"],
    subcategories: [
      { name: "ID or access card", hint: "Lost, damaged or not working? Tell us which." },
      { name: "Seat or desk", hint: "Floor and desk number, and what's needed." },
      { name: "Cafeteria", hint: "Date, time and what happened." },
      { name: "Housekeeping or washroom", hint: "Floor and location." },
      { name: "AC, power or furniture", hint: "Floor, location and the problem." },
      { name: "Locker", hint: "Locker number and the issue." },
    ],
  },
  {
    id: "training",
    name: "Training & Quality",
    blurb: "Training, certification and QA scores",
    icon: "book",
    color: "#A855F7",
    orbitDepartments: ["Training", "Quality", "L&D"],
    subcategories: [
      { name: "Training schedule", hint: "Which training and the question." },
      { name: "Certification or assessment", hint: "Assessment name, date and your query." },
      { name: "QA score dispute", hint: "Interaction ID, date, the parameter and why you disagree." },
      { name: "Coaching request", hint: "What you'd like to improve." },
    ],
  },
  {
    id: "recruitment",
    name: "Recruitment & Referrals",
    blurb: "Refer friends, internal jobs",
    icon: "userplus",
    color: "#0EA5E9",
    orbitDepartments: ["Recruitment", "Talent Acquisition", "HR"],
    subcategories: [
      { name: "Refer a candidate", hint: "Candidate name, phone and the role. Attach the CV after the ticket is created if needed." },
      { name: "Referral bonus status", hint: "Who you referred and their joining date." },
      { name: "Internal job posting", hint: "Which role and your question." },
    ],
  },
  {
    id: "grievance",
    name: "Grievance",
    blurb: "A concern about how you're treated at work",
    icon: "chat",
    color: "#F97316",
    orbitDepartments: ["HR", "Human Resources", "Grievance"],
    subcategories: [
      { name: "Workplace concern", hint: "What happened, when, and who was involved. This goes to HR, not your team." },
      { name: "Manager or team issue", hint: "What happened and what outcome you'd like." },
      { name: "Unfair pay or policy decision", hint: "The decision and why you think it's unfair." },
    ],
  },
  {
    id: "portal",
    name: "magistick portal",
    blurb: "Access, bugs and ideas for this portal",
    icon: "award",
    color: "#EC407A",
    orbitDepartments: ["magistick", "Portal", "IT"],
    subcategories: [
      { name: "Can't open an app", hint: "Which app, and what you see." },
      { name: "Something is broken", hint: "Which page, what you did and what happened." },
      { name: "Idea or suggestion", hint: "What would make magistick better for you?", priority: "low" },
    ],
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, Category>;

export const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In progress",
  waiting: "Waiting on you",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_COLOR: Record<string, string> = {
  open: "#3B82F6",
  assigned: "#6366F1",
  in_progress: "#F59E0B",
  waiting: "#E91E63",
  resolved: "#16A34A",
  closed: "#71717A",
};

/** Marks replies an employee posts from magistick (they're sent by the integration account). */
export const REPLY_PREFIX = "Reply from ";
