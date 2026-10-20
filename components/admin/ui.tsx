import type { ReactNode } from "react";

export const inputCls =
  "h-9 w-full rounded-lg border border-line bg-panel px-3 text-[13.5px] text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none disabled:bg-ground disabled:text-stone-500";

export const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-ember px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-nil disabled:cursor-not-allowed disabled:opacity-50",
  quiet:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-panel px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-ember/40 disabled:opacity-50",
  danger:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-bad/30 bg-panel px-3.5 text-[13px] font-medium text-bad transition-colors hover:bg-bad-tint disabled:opacity-50",
};

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-stone-500">{hint}</span>}
    </label>
  );
}

export function Notice({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3.5 py-2.5 text-[13.5px] ${
        kind === "error" ? "border-bad/30 bg-bad-tint text-bad" : "border-ok/30 bg-ok-tint text-ok"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionHead({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink">{title}</h2>
        {children && <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-stone-600">{children}</p>}
      </div>
      {actions}
    </div>
  );
}

/** JSON fetch that throws the server's own error message. */
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status}).`);
  return data as T;
}
