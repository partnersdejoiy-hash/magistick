"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Roles & permissions — STUBBED for now.
 *
 * TODO(phase-2 — real auth): replace this whole stub with the session.
 * - getRole() must read the authenticated user's role server-side.
 * - The app-access matrix must be enforced in API routes / middleware.
 * - Client-side gating below is UX convenience only, NOT security.
 */

export type RoleId = "admin" | "collaborator" | "employee";

export type Capability =
  | "manage_posts" // create / edit / publish / delete updates
  | "manage_roles" // edit the roles × apps access matrix
  | "manage_apps" // (future) manage the app catalog itself
  | "view_reports"; // (future) workforce reports

export const ROLE_IDS = ["admin", "collaborator", "employee"] as const;

export const ROLES: Record<
  RoleId,
  { label: string; blurb: string; capabilities: Capability[] }
> = {
  admin: {
    label: "Admin",
    blurb: "Full control — content, apps, and roles & access.",
    capabilities: ["manage_posts", "manage_roles", "manage_apps", "view_reports"],
  },
  collaborator: {
    label: "Collaborator",
    blurb: "Can create, edit and publish posts & updates. No admin settings.",
    capabilities: ["manage_posts"],
  },
  employee: {
    label: "Employee",
    blurb: "Uses apps, raises tickets, reads updates.",
    capabilities: [],
  },
};

export const CAPABILITY_LABELS: Record<Capability, string> = {
  manage_posts: "Manage posts",
  manage_roles: "Roles & access",
  manage_apps: "Manage apps",
  view_reports: "View reports",
};

/**
 * appId -> roles allowed to USE the app.
 * An absent entry means every role may use the app.
 */
export type AppAccessMatrix = Record<string, RoleId[]>;

export const DEFAULT_APP_ACCESS: AppAccessMatrix = {
  // Payroll details stay with admins; quality dashboards with leads.
  // Everything else is open to all roles until an admin changes it.
  payroll: ["admin"],
  quality: ["admin", "collaborator"],
};

const ROLE_KEY = "magistick:role";
const MATRIX_KEY = "magistick:app-access";

export function roleCan(role: RoleId, cap: Capability): boolean {
  return ROLES[role].capabilities.includes(cap);
}

export function appAllowedFor(
  appId: string,
  role: RoleId,
  matrix: AppAccessMatrix,
): boolean {
  const allowed = matrix[appId];
  if (!allowed) return true;
  return allowed.includes(role);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode — preferences just won't persist */
  }
}

/**
 * Stub session hook. Default role is "admin" so every surface is visible
 * while real login doesn't exist yet. Use the "View as" switcher in
 * /admin to preview the portal as collaborator or employee.
 */
export function useRole() {
  const [role, setRoleState] = useState<RoleId>("admin");
  const [matrix, setMatrixState] = useState<AppAccessMatrix>(DEFAULT_APP_ACCESS);

  useEffect(() => {
    setRoleState(read<RoleId>(ROLE_KEY, "admin"));
    setMatrixState(read<AppAccessMatrix>(MATRIX_KEY, DEFAULT_APP_ACCESS));
  }, []);

  const setRole = useCallback((r: RoleId) => {
    setRoleState(r);
    write(ROLE_KEY, r);
  }, []);

  const setMatrix = useCallback((m: AppAccessMatrix) => {
    setMatrixState(m);
    write(MATRIX_KEY, m);
  }, []);

  const can = useCallback((cap: Capability) => roleCan(role, cap), [role]);
  const canUseApp = useCallback(
    (appId: string) => appAllowedFor(appId, role, matrix),
    [role, matrix],
  );

  return { role, setRole, matrix, setMatrix, can, canUseApp };
}
