/**
 * Temporary UI preview: sign-in off, read-only. Vercel preview deployments only;
 * VERCEL_ENV is "production" on the live site, so this can never turn on there.
 * shortcut: remove this file and its three call sites once the UI review is done.
 */
export const UI_PREVIEW = process.env.VERCEL_ENV === "preview" && process.env.UI_PREVIEW === "1";

/** Sample content so the preview shows a filled-in UI without a database. Preview only. */
export const PREVIEW_APPS = [
  ["chronix", "Chronix", "Your Chronix workspace", "Work", "clock", "#2563EB"],
  ["orbitdesk", "OrbitDesk", "Support tickets & help desk", "Support", "ticket", "#7C3AED"],
  ["payroll", "Payroll", "Payslips & tax (sample)", "HR", "wallet", "#16A34A"],
  ["attendance", "Attendance", "Shifts & punches (sample)", "WFM", "gauge", "#EA580C"],
  ["leave", "Leave", "Apply & track leave (sample)", "HR", "plane", "#0891B2"],
  ["learning", "Learning", "Courses & certifications (sample)", "Growth", "book", "#DB2777"],
  ["rewards", "Rewards", "Shout-outs & awards (sample)", "Culture", "award", "#CA8A04"],
  ["ideas", "Ideas", "Suggest an improvement (sample)", "Culture", "bulb", "#9333EA"],
  ["referrals", "Referrals", "Refer a friend (sample)", "HR", "userplus", "#0D9488"],
  ["townhall", "Town Hall", "Live sessions (sample)", "Comms", "video", "#E11D48"],
].map(([id, name, blurb, category, icon, color], i) => ({ id, name, blurb, category, href: "#", icon, color, sort_order: i + 1 }));

/**
 * Sample org for the preview's team chart: DEJOIY's people as listed on
 * dejoiy-site (names, titles, photos). Reporting lines are a sample, not
 * HR data. Preview only.
 */
export const PREVIEW_TEAM = [
  ["emp1", "Jyoti Sharma", "Founder, Director", "super_admin", "leadership", null],
  ["emp2", "Anil Sharma", "Managing Director, Co-founder", "admin", "leadership", "emp1"],
  ["emp5", "Dharmendra Sharma", "Strategic Advisor", "dept_head", "leadership", "emp1"],
  ["emp3", "Deepak Sharma", "Chief Technology & Operations Lead", "dept_head", "it", "emp2"],
  ["emp7", "Syed Adnan Alir", "Business Manager", "sr_manager", "sales", "emp2"],
  ["emp4", "Komal Sharma", "Brand & Communications Coordinator", "specialist", "hr", "emp2"],
  ["emp6", "Deepanshu Chander Yaduvanshi", "Web Developer & Digital Infrastructure Engineer", "specialist", "it", "emp3"],
  ["emp8", "Khushi Sharma", "Operations Support", "sr_associate", "operations", "emp3"],
  ["emp9", "Harjoi Bajaj", "Brand Ambassador", "associate", "sales", "emp4"],
].map(([id, name, title, level, department, manager_id]) => ({ id, name, title, level, department, manager_id, location: "Delhi" }));

/** Sample Get Help tickets so the preview shows the full flow. Preview only. */
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
export const PREVIEW_TICKETS = [
  {
    id: 101, ticketNumber: "DJ-7F3A91C2E04B5D18", category: "Payroll & Reimbursements", subcategory: "Payslip query",
    subject: "October payslip shows lower night allowance", status: "waiting", priority: "medium",
    assignee: "Riya (Payroll)", department: "Payroll", slaDeadline: hoursAgo(-20), createdAt: hoursAgo(30), updatedAt: hoursAgo(2),
    description: "My October payslip shows night allowance for 14 nights, but I worked 18 night shifts as per my roster.",
    slaBreached: false,
    messages: [
      { id: 1, from: "support", author: "Riya (Payroll)", body: "Thanks for flagging this. Could you confirm the four dates that are missing? We'll match them with the attendance log.", at: hoursAgo(5) },
    ],
    timeline: [
      { label: "Ticket raised", at: hoursAgo(30) },
      { label: "Assigned to an agent", at: hoursAgo(29) },
      { label: "Status: in progress", at: hoursAgo(20) },
      { label: "Status: waiting", at: hoursAgo(5) },
    ],
  },
  {
    id: 102, ticketNumber: "DJ-2B8C44D19A6E07F3", category: "Transport", subcategory: "Change pick-up or drop address",
    subject: "New drop address from 1 November", status: "in_progress", priority: "medium",
    assignee: "Admin desk", department: "Admin & Facilities", slaDeadline: hoursAgo(-40), createdAt: hoursAgo(8), updatedAt: hoursAgo(3),
    description: "I'm moving to Sector 62, Noida (near Fortis). Please update my drop address from 1 November.",
    slaBreached: false,
    messages: [{ id: 2, from: "support", author: "Admin desk", body: "Noted. We'll add you to the Sector 62 route from 1 Nov and share the cab details on 31 Oct.", at: hoursAgo(3) }],
    timeline: [
      { label: "Ticket raised", at: hoursAgo(8) },
      { label: "Status: in progress", at: hoursAgo(3) },
    ],
  },
  {
    id: 103, ticketNumber: "DJ-91E0A7B3C5D2F468", category: "HR", subcategory: "Employment or experience letter",
    subject: "Employment letter for bank loan", status: "resolved", priority: "low",
    assignee: "Komal (HR)", department: "HR", slaDeadline: null, createdAt: hoursAgo(96), updatedAt: hoursAgo(60),
    description: "I need an employment letter addressed to HDFC Bank for a home loan application.",
    slaBreached: false,
    messages: [
      { id: 3, from: "support", author: "Komal (HR)", body: "Your letter is ready and has been emailed to you. Marking this resolved.", at: hoursAgo(60) },
      { id: 4, from: "you", author: "Preview Admin", body: "Received, thank you!", at: hoursAgo(59) },
    ],
    timeline: [
      { label: "Ticket raised", at: hoursAgo(96) },
      { label: "Status: resolved", at: hoursAgo(60) },
    ],
  },
];
