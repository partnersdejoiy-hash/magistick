"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/roles";
import type { PermId } from "@/lib/rbac";
import { DEPT_BY_ID, LEVEL_BY_ID } from "@/lib/rbac";
import NotAllowed from "../NotAllowed";
import { Stamp } from "../Stamp";
import AppAccess from "./AppAccess";
import Apps from "./Apps";
import Audit from "./Audit";
import Overview from "./Overview";
import People from "./People";
import Roles from "./Roles";

const MANAGE: PermId[] = ["manage_users_team", "manage_users_dept", "manage_users_all"];

const TABS: { id: string; label: string; anyOf: PermId[] }[] = [
  { id: "overview", label: "Organisation", anyOf: MANAGE },
  { id: "people", label: "People", anyOf: MANAGE },
  { id: "roles", label: "Roles & permissions", anyOf: ["manage_roles", ...MANAGE] },
  { id: "access", label: "App access", anyOf: ["manage_app_access"] },
  { id: "apps", label: "Apps", anyOf: ["manage_apps"] },
  { id: "audit", label: "Audit log", anyOf: ["view_audit"] },
];

/** The admin console: each person sees only the tabs their level's permissions open. */
export default function AdminConsole() {
  const { user, loading } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  if (loading) return <div className="skeleton h-64" />;
  if (!user) return null;
  const tabs = TABS.filter((t) => t.anyOf.some((p) => user.perms.includes(p)));
  const canPublish = user.perms.includes("publish_posts_dept") || user.perms.includes("publish_posts_all");
  if (tabs.length === 0 && !canPublish) return <NotAllowed what="the admin console" />;
  const current = tabs.find((t) => t.id === params.get("tab")) ?? tabs[0];
  const open = (id: string) => router.push(`/admin?tab=${id}`, { scroll: false });

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl bg-nil p-3 text-white">
          <div className="flex items-center gap-2 px-2 pb-3 pt-1">
            <Stamp dept={user.department} size={14} color="#FFC400" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold">Admin</p>
              <p className="truncate text-[12px] text-white/65">
                {LEVEL_BY_ID[user.level].label.split(" (")[0]} · {DEPT_BY_ID[user.department].label}
              </p>
            </div>
          </div>
          <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => open(t.id)}
                aria-current={current?.id === t.id ? "page" : undefined}
                className={`on-nil shrink-0 rounded-md px-3 py-2 text-left text-[13.5px] font-medium transition-colors ${
                  current?.id === t.id ? "bg-white text-nil" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
            {canPublish && (
              <Link
                href="/admin/posts"
                className="on-nil shrink-0 rounded-md px-3 py-2 text-[13.5px] font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                Updates
              </Link>
            )}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        {!current ? (
          <p className="text-[14px] text-stone-600">
            Your level can publish updates. Open <Link href="/admin/posts" className="text-ember underline">Updates</Link>.
          </p>
        ) : current.id === "overview" ? (
          <Overview onOpen={open} />
        ) : current.id === "people" ? (
          <People />
        ) : current.id === "roles" ? (
          <Roles />
        ) : current.id === "access" ? (
          <AppAccess />
        ) : current.id === "apps" ? (
          <Apps />
        ) : (
          <Audit />
        )}
      </div>
    </div>
  );
}
