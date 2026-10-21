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
