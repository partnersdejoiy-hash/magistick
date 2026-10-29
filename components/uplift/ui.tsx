import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/Stamp";
import type { Person } from "@/lib/people";
import { STATUS_LABEL, TYPE_BY_ID, type MeetingType, type Status } from "@/lib/upliftCore";
import { formatDate } from "@/lib/format";

/** Shared Uplift pieces. Server-safe: no hooks. */

export const input =
  "h-9 w-full rounded-lg border border-line bg-panel px-3 text-[13.5px] text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none disabled:bg-ground";
export const area =
  "w-full rounded-lg border border-line bg-panel px-3 py-2 text-[13.5px] leading-relaxed text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none";
export const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-ember px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-ember-deep disabled:opacity-50",
  quiet:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-panel px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-stone-300 hover:bg-ground disabled:opacity-50",
  small:
    "inline-flex h-7 items-center rounded-md border border-line bg-panel px-2.5 text-[12.5px] font-medium text-stone-700 transition-colors hover:border-stone-300 hover:text-ink disabled:opacity-50",
  danger:
    "inline-flex h-7 items-center rounded-md px-2 text-[12.5px] font-medium text-bad transition-colors hover:bg-bad-tint disabled:opacity-50",
};

export function PageHead({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold leading-tight text-ink">{title}</h1>
        {children && <p className="mt-1.5 max-w-[68ch] text-[13.5px] leading-relaxed text-stone-600">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, aside, children, className = "" }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-line bg-panel shadow-card ${className}`}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          <h2 className="font-sans text-[15px] font-semibold tracking-normal text-ink">{title}</h2>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[12.5px] font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] leading-snug text-stone-500">{hint}</span>}
    </label>
  );
}

/** Underlined tab links; the active one carries the magenta bar. */
export function Tabs({ items, active }: { items: { id: string; label: string; href: string; count?: number }[]; active: string }) {
  return (
    <nav aria-label="Views" className="no-scrollbar -mb-px flex gap-1 overflow-x-auto border-b border-line">
      {items.map((t) => {
        const on = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`relative shrink-0 whitespace-nowrap px-3 pb-2.5 pt-1 text-[13.5px] transition-colors ${
              on ? "font-semibold text-ink" : "text-stone-600 hover:text-ink"
            }`}
          >
            {t.label}
            {!!t.count && (
              <span className="tabular ml-1.5 rounded-full bg-ember-tint px-1.5 py-px text-[11px] font-semibold text-ember-ink">{t.count}</span>
            )}
            {on && <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-ember" />}
          </Link>
        );
      })}
    </nav>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-parchment text-stone-700",
  for_ack: "bg-warn-tint text-warn",
  acknowledged: "bg-ok-tint text-ok",
  logged: "bg-sky-50 text-sky-800",
};

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium ${STATUS_STYLE[status]}`}>
      {status === "acknowledged" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

const TYPE_DOT: Record<MeetingType, string> = {
  regular: "#C2185B",
  delegated: "#404040",
  mentor: "#1F6F78",
  powerup: "#B7791F",
  pip: "#B3261E",
};

export function TypeTag({ type }: { type: MeetingType }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-stone-700">
      <span className="h-2 w-2 rounded-full" style={{ background: TYPE_DOT[type] }} aria-hidden />
      {TYPE_BY_ID[type]?.label ?? type}
    </span>
  );
}

export function PersonCell({ p, sub, href }: { p: Person | undefined; sub?: ReactNode; href?: string }) {
  if (!p) return <span className="text-[13px] text-stone-500">Former employee</span>;
  const body = (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={p.name} dept={p.department} size={30} id={p.id} />
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-medium text-ink">{p.name}</span>
        <span className="block truncate text-[12px] text-stone-500">{sub ?? (p.title || p.email)}</span>
      </span>
    </span>
  );
  return href ? (
    <Link href={href} className="block rounded-md hover:[&_span.font-medium]:text-ember">
      {body}
    </Link>
  ) : (
    body
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[14.5px] font-semibold text-ink">{title}</p>
      {children && <div className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-stone-600">{children}</div>}
    </div>
  );
}

export const th = "bg-parchment/70 px-4 py-2.5 text-left text-[12px] font-semibold text-stone-600 whitespace-nowrap";
export const td = "px-4 py-3 align-middle text-[13.5px] text-ink";

export const day = (iso: string | null | undefined) => (iso ? formatDate(iso.slice(0, 10)) : "—");

/** People picker as a native select, grouped by nothing — sorted by name. */
export function PersonSelect({ name, people, value, placeholder = "Choose a person", required = true }: {
  name: string;
  people: Person[];
  value?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <select name={name} defaultValue={value ?? ""} required={required} className={input}>
      <option value="">{placeholder}</option>
      {[...people]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.title ? ` · ${p.title}` : ""}
          </option>
        ))}
    </select>
  );
}

/** Uplift's mark: two rising strokes, the second one lifted by the first. */
export function UpliftMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" rx="11" fill="#E91E63" />
      <path d="M9 27.5 17 19l5 5 9-10.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24.5 13.5H31V20" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chev({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
