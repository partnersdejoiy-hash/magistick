"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionUser } from "./auth";

/**
 * Roles & capabilities — metadata stays client-side; the actual role now
 * comes from the server session (useSession), enforced by middleware +
 * API routes. No more localStorage role stub.
 */

export type RoleId = "admin" | "collaborator" | "employee";

export type Capability =
  | "manage_posts" // create / edit / publish / delete updates
  | "manage_roles" // edit the roles × apps access matrix + users + apps
  | "manage_apps" // (same as manage_roles for now)
  | "view_reports"; // (future) workforce reports

export const ROLE_IDS = ["admin", "collaborator", "employee"] as const;

export const ROLES: Record<
  RoleId,
  { label: string; blurb: string; capabilities: Capability[] }
> = {
  admin: {
    label: "Admin",
    blurb: "Full control — content, apps, users, and roles & access.",
    capabilities: ["manage_posts", "manage_roles", "manage_apps"],
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

export function roleCan(role: RoleId, cap: Capability): boolean {
  return ROLES[role].capabilities.includes(cap);
}

/** Live session from the server (httpOnly cookie). Null = signed out. */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      setUser(res.ok ? ((await res.json()).user as SessionUser) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const can = useCallback(
    (cap: Capability) => (user ? roleCan(user.role, cap) : false),
    [user],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* cookie clear is best-effort */
    }
    window.location.href = "/login";
  }, []);

  return { user, loading, can, refresh, signOut };
}
