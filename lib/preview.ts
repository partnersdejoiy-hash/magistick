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
