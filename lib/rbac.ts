/**
 * magistick RBAC — the BPO hierarchy, departments and permissions.
 * Pure data + helpers, safe on server, edge and client.
 *
 * Rules:
 * - Every user has one LEVEL (rank) and one DEPARTMENT.
 * - What a level may do comes from the permission matrix: DEFAULT_MATRIX,
 *   overridden live by the Super Admin (role_permissions table).
 * - "_team" permissions act on people in your reporting line, "_dept" on your
 *   department, "_all" on everyone. Nobody can act on someone at or above
 *   their own rank, except the Super Admin.
 */

export const LEVELS = [
  { id: "super_admin", label: "Super Admin", rank: 100, blurb: "Owns the portal. Every permission, always." },
  { id: "admin", label: "Admin", rank: 90, blurb: "Runs the portal day to day across all departments." },
  { id: "dept_head", label: "Department Head / VP", rank: 80, blurb: "Leads a whole department." },
  { id: "sr_manager", label: "Senior Manager / AVP", rank: 70, blurb: "Runs several programs or LOBs." },
  { id: "ops_manager", label: "Operations Manager", rank: 60, blurb: "Owns a program and its team leaders." },
  { id: "asst_manager", label: "Assistant Manager", rank: 50, blurb: "Supports the manager across teams." },
  { id: "team_leader", label: "Team Leader", rank: 40, blurb: "Leads a team of associates on the floor." },
  { id: "specialist", label: "Specialist (QA / Trainer / SME / WFM / MIS)", rank: 35, blurb: "Support function expert." },
  { id: "sr_associate", label: "Senior Associate", rank: 20, blurb: "Experienced floor associate." },
  { id: "associate", label: "Associate", rank: 10, blurb: "Production floor associate." },
  { id: "trainee", label: "Trainee", rank: 5, blurb: "New hire in training or nesting." },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];
export const LEVEL_IDS = LEVELS.map((l) => l.id) as LevelId[];
export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l])) as Record<
  LevelId,
  (typeof LEVELS)[number]
>;
export const isLevel = (v: unknown): v is LevelId => typeof v === "string" && v in LEVEL_BY_ID;
export const rankOf = (l: LevelId) => LEVEL_BY_ID[l].rank;

/** Departments, each with its dye and block-print stamp (see components/Stamp). */
export const DEPARTMENTS = [
  { id: "operations", label: "Operations", dye: "#2B3A8C", stamp: "chevron" },
  { id: "quality", label: "Quality", dye: "#B3261E", stamp: "flower" },
  { id: "training", label: "Training", dye: "#B7791F", stamp: "sun" },
  { id: "wfm", label: "WFM", dye: "#2F6B3B", stamp: "leaf" },
  { id: "mis", label: "MIS", dye: "#6B4A2E", stamp: "grid" },
  { id: "hr", label: "HR", dye: "#B0386A", stamp: "lotus" },
  { id: "payroll", label: "Payroll & Finance", dye: "#1F6F78", stamp: "diamond" },
  { id: "recruitment", label: "Recruitment", dye: "#C2561A", stamp: "dots" },
  { id: "it", label: "IT", dye: "#3D5A80", stamp: "lattice" },
  { id: "admin_facilities", label: "Admin & Facilities", dye: "#5E6B2A", stamp: "wave" },
  { id: "leadership", label: "Leadership", dye: "#6D1F33", stamp: "star" },
  { id: "sales", label: "Sales & BD", dye: "#0E7C6B", stamp: "paisley" },
] as const;

export type DeptId = (typeof DEPARTMENTS)[number]["id"];
export const DEPT_IDS = DEPARTMENTS.map((d) => d.id) as DeptId[];
export const DEPT_BY_ID = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, d])) as Record<
  DeptId,
  (typeof DEPARTMENTS)[number]
>;
export const isDept = (v: unknown): v is DeptId => typeof v === "string" && v in DEPT_BY_ID;

export const PERMISSIONS = [
  { id: "view_directory", group: "People", label: "View people directory" },
  { id: "view_team", group: "People", label: "See own team's details" },
  { id: "manage_users_team", group: "People", label: "Manage users in own reporting line" },
  { id: "manage_users_dept", group: "People", label: "Manage users in own department" },
  { id: "manage_users_all", group: "People", label: "Manage users in all departments" },
  { id: "publish_posts_dept", group: "Updates", label: "Publish updates to own department" },
  { id: "publish_posts_all", group: "Updates", label: "Publish company-wide updates" },
  { id: "raise_tickets", group: "Help", label: "Raise help tickets" },
  { id: "raise_wfm_tickets", group: "Help", label: "Raise WFM tickets (leave, schedule)" },
  { id: "manage_apps", group: "Apps", label: "Add, edit and remove apps" },
  { id: "manage_app_access", group: "Apps", label: "Set which levels and departments see each app" },
  { id: "view_audit", group: "Admin", label: "View audit log" },
  { id: "manage_roles", group: "Admin", label: "Edit this permission matrix" },
] as const;

export type PermId = (typeof PERMISSIONS)[number]["id"];
export const PERM_IDS = PERMISSIONS.map((p) => p.id) as PermId[];
export const isPerm = (v: unknown): v is PermId =>
  typeof v === "string" && (PERM_IDS as string[]).includes(v);

const EVERYONE: PermId[] = ["view_directory", "raise_tickets", "raise_wfm_tickets"];
const LEAD: PermId[] = [...EVERYONE, "view_team", "manage_users_team"];

export const DEFAULT_MATRIX: Record<LevelId, PermId[]> = {
  super_admin: [...PERM_IDS],
  admin: PERM_IDS.filter((p) => p !== "manage_roles"),
  dept_head: [...LEAD, "manage_users_dept", "publish_posts_dept", "publish_posts_all", "view_audit"],
  sr_manager: [...LEAD, "manage_users_dept", "publish_posts_dept"],
  ops_manager: [...LEAD, "publish_posts_dept"],
  asst_manager: [...LEAD, "publish_posts_dept"],
  team_leader: [...LEAD],
  specialist: [...EVERYONE, "view_team"],
  sr_associate: [...EVERYONE],
  associate: [...EVERYONE],
  trainee: ["view_directory", "raise_tickets"],
};

export type Matrix = Record<LevelId, PermId[]>;

/** Merge DB overrides onto the defaults. Super Admin always keeps everything. */
export function buildMatrix(overrides: { role: string; permission: string; allowed: boolean }[]): Matrix {
  const m = Object.fromEntries(LEVEL_IDS.map((l) => [l, new Set(DEFAULT_MATRIX[l])])) as Record<
    LevelId,
    Set<PermId>
  >;
  for (const o of overrides) {
    if (!isLevel(o.role) || !isPerm(o.permission) || o.role === "super_admin") continue;
    if (o.allowed) m[o.role].add(o.permission);
    else m[o.role].delete(o.permission);
  }
  return Object.fromEntries(LEVEL_IDS.map((l) => [l, PERM_IDS.filter((p) => m[l].has(p))])) as Matrix;
}

export type Actor = { id: string; level: LevelId; department: DeptId; perms: PermId[] };
export type Target = { id: string; level: LevelId; department: DeptId; inChainOf: (managerId: string) => boolean };

/**
 * Can `actor` create/edit/remove `target`, or give someone `target`'s level+dept?
 * Rank must be strictly higher (Super Admin excepted), then scope by permission.
 */
export function canManage(actor: Actor, target: Target): boolean {
  if (actor.level === "super_admin") return true;
  if (rankOf(target.level) >= rankOf(actor.level)) return false;
  if (actor.perms.includes("manage_users_all")) return true;
  if (actor.perms.includes("manage_users_dept") && target.department === actor.department) return true;
  if (actor.perms.includes("manage_users_team") && target.inChainOf(actor.id)) return true;
  return false;
}

export const canManageAnyone = (perms: PermId[]) =>
  perms.some((p) => p === "manage_users_team" || p === "manage_users_dept" || p === "manage_users_all");
