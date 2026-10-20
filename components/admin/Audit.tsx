"use client";

import { useEffect, useState } from "react";
import { api, Notice, SectionHead } from "./ui";

type Entry = { id: string; actor_name: string; action: string; target: string; detail: string; at: string };

const VERB: Record<string, string> = {
  "user.create": "added",
  "user.update": "changed",
  "user.delete": "deleted",
  "role.grant": "granted a permission to",
  "role.revoke": "revoked a permission from",
  "role.reset": "reset permissions for",
  "app.create": "added app",
  "app.edit": "edited app",
  "app.delete": "removed app",
  "app.access": "changed access for",
  "post.publish": "published",
  "post.edit": "edited",
  "post.delete": "deleted update",
};

export default function Audit() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ entries: Entry[] }>("/api/admin/audit")
      .then((d) => setEntries(d.entries))
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load the audit log."));
  }, []);

  return (
    <section>
      <SectionHead title="Audit log">Every change to people, permissions, apps and updates, newest first.</SectionHead>
      {error && <Notice kind="error">{error}</Notice>}
      {!error && (
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          {entries === null ? (
            <div className="p-4">
              <div className="skeleton h-24" />
            </div>
          ) : entries.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13.5px] text-stone-500">Nothing logged yet. Changes appear here as admins make them.</p>
          ) : (
            <ol className="divide-y divide-line">
              {entries.map((e) => (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-[13.5px]">
                  <time dateTime={e.at} className="tabular w-36 shrink-0 text-[12.5px] text-stone-500">
                    {new Date(e.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </time>
                  <span className="min-w-0 flex-1 text-ink">
                    <span className="font-medium">{e.actor_name || "Someone"}</span> {VERB[e.action] ?? e.action}{" "}
                    <span className="font-medium">{e.target}</span>
                    {e.detail && <span className="text-stone-600"> · {e.detail}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
