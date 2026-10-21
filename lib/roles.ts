"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { DeptId, LevelId, PermId } from "./rbac";

/** The signed-in user as /api/auth/me returns it (mirrors lib/auth Me). */
export type MeUser = {
  id: string;
  email: string;
  name: string;
  level: LevelId;
  department: DeptId;
  title: string;
  manager_id: string | null;
  location: string;
  photo_at: number;
  perms: PermId[];
};

type Session = {
  user: MeUser | null;
  loading: boolean;
  can: (p: PermId) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Session | null>(null);

/** One fetch of /api/auth/me for the whole app. The server stays the authority. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      setUser(res.ok ? ((await res.json()).user as MeUser) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const can = useCallback((p: PermId) => !!user?.perms.includes(p), [user]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* cookie clear is best-effort */
    }
    window.location.href = "/login";
  }, []);

  return createElement(Ctx.Provider, { value: { user, loading, can, refresh, signOut } }, children);
}

export function useSession(): Session {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession must be used inside <SessionProvider>");
  return s;
}
