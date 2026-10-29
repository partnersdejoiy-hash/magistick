"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";

/**
 * A plain server-rendered <form> that posts its fields to /api/uplift as JSON.
 * Repeated names (checkbox groups) become arrays. On success it follows the
 * server's redirect or refreshes the page's server data in place.
 */
export default function ActionForm({
  action,
  children,
  className = "",
  reset = false,
  confirm,
}: {
  action: string;
  children: ReactNode;
  className?: string;
  /** Clear the fields after a successful save (add-another forms). */
  reset?: boolean;
  /** Ask before sending (deletes). */
  confirm?: string;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirm && !window.confirm(confirm)) return;
    const body: Record<string, unknown> = { action };
    const fd = new FormData(e.currentTarget);
    for (const key of Array.from(new Set(Array.from(fd.keys())))) {
      const all = fd.getAll(key).map(String);
      body[key] = all.length > 1 || key === "participants" ? all : all[0];
    }
    // FormData skips the clicked button; rating rows send their value through it.
    const sub = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (sub?.name) body[sub.name] = sub.value;
    setMsg(null);
    setBusy(true);
    const res = await fetch("/api/uplift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(
      () => null,
    );
    setBusy(false);
    if (!res) return setMsg({ kind: "error", text: "No connection. Check your network and try again." });
    const data = (await res.json().catch(() => ({}))) as { error?: string; redirect?: string; message?: string };
    if (!res.ok) return setMsg({ kind: "error", text: data.error || `Couldn't save (${res.status}).` });
    if (reset) ref.current?.reset();
    if (data.message) setMsg({ kind: "ok", text: data.message });
    start(() => (data.redirect ? router.push(data.redirect) : router.refresh()));
  }

  return (
    <form ref={ref} onSubmit={submit} className={className} aria-busy={pending || busy}>
      <fieldset disabled={pending || busy} className="contents">
        {children}
      </fieldset>
      {msg && (
        <p
          role={msg.kind === "error" ? "alert" : "status"}
          className={`basis-full rounded-lg px-3 py-2 text-[13px] ${msg.kind === "error" ? "bg-bad-tint text-bad" : "bg-ok-tint text-ok"}`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
