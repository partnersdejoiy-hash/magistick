import { sql } from "./db";
import { canManage, isDept, isLevel, type Actor, type DeptId, type LevelId } from "./rbac";
import type { Me } from "./auth";

/** One row of the people table, as admin screens and the directory see it (never the hash). */
export type Person = {
  id: string;
  email: string;
  name: string;
  level: LevelId;
  department: DeptId;
  title: string;
  manager_id: string | null;
  location: string;
  status: "active" | "suspended";
  created_at: string;
};

export async function loadPeople(): Promise<Person[]> {
  const rows = (await sql()`
    SELECT id, email, name, role, department, title, manager_id, location, status, created_at
    FROM users ORDER BY name ASC`) as Record<string, string | null>[];
  return rows.map((r) => ({
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    level: isLevel(r.role) ? r.role : "associate",
    department: isDept(r.department) ? r.department : "operations",
    title: String(r.title ?? ""),
    manager_id: r.manager_id,
    location: String(r.location ?? ""),
    status: r.status === "suspended" ? "suspended" : "active",
    created_at: String(r.created_at),
  }));
}

/** Manager chain from `startManagerId` upward (nearest first). Stops on cycles. */
export function chainFrom(startManagerId: string | null, byId: Map<string, Person>): Person[] {
  const out: Person[] = [];
  const seen = new Set<string>();
  let cur = startManagerId;
  while (cur && !seen.has(cur) && byId.has(cur)) {
    seen.add(cur);
    const p = byId.get(cur)!;
    out.push(p);
    cur = p.manager_id;
  }
  return out;
}

export function actorOf(me: Me): Actor {
  return { id: me.id, level: me.level, department: me.department, perms: me.perms };
}

/** Can `me` manage a person with this level/department/manager? */
export function mayManage(
  me: Me,
  t: { id: string; level: LevelId; department: DeptId; manager_id: string | null },
  byId: Map<string, Person>,
) {
  return canManage(actorOf(me), {
    ...t,
    inChainOf: (mid) => chainFrom(t.manager_id, byId).some((p) => p.id === mid),
  });
}
