"use client";

import Link from "next/link";
import { useRole } from "@/lib/roles";
import { IconPlus } from "@/components/icons";

/** "Manage posts" entry — visible only to roles with the capability. */
export default function ManagePostsLink() {
  const { can } = useRole();
  if (!can("manage_posts")) return null;
  return (
    <Link
      href="/admin/posts"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-4 py-2 text-[13px] font-semibold text-stone-500 transition-all duration-200 hover:border-ember/50 hover:text-ember"
    >
      <IconPlus size={14} /> Manage posts
    </Link>
  );
}
