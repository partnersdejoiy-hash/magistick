"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "./motion";
import { IconArrowLeft, IconChevronDown, IconInbox, IconPlus } from "./icons";

type Ticket = {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
};

type TicketDetail = Ticket & {
  description: string;
  department?: { name?: string } | null;
};

type Comment = {
  id: number;
  body: string;
  created_at: string;
  author?: { name?: string } | null;
};

const STATUS_TABS = ["all", "open", "in_progress", "waiting", "resolved", "closed"] as const;

const STATUS_DOT: Record<string, string> = {
  open: "bg-sky-500",
  assigned: "bg-indigo-500",
  in_progress: "bg-amber-500",
  waiting: "bg-stone-400",
  resolved: "bg-emerald-600",
  closed: "bg-stone-300",
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`/api/orbitdesk/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text.slice(0, 200) };
  }
  return { status: res.status, data: data as { error?: string; detail?: string; data?: Ticket[]; [k: string]: unknown } };
}

const inputCls =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone-400 shadow-card focus:border-ember/60 focus:outline-none transition-colors";

function SkeletonRows() {
  return (
    <div className="border-t border-line" aria-label="Loading tickets" role="status">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line px-2 py-4 sm:px-4">
          <div className="skeleton h-2.5 w-2.5 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-2/3 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading tickets…</span>
    </div>
  );
}

/**
 * My Tickets — raises + tracks OrbitDesk tickets inline (no new tab).
 * When the OrbitDesk service env isn't configured, shows the connect state.
 */
export default function TicketPanel() {
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("all");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs = tab === "all" ? "" : `?status=${tab}`;
    const { status, data } = await api(`tickets${qs}`);
    if (status === 503 && data?.error === "OrbitDesk not connected") {
      setNotConnected(true);
      setTickets([]);
    } else if (status >= 400) {
      setError(data?.error ?? `Failed to load tickets (${status})`);
    } else {
      setTickets((data?.data as Ticket[]) ?? []);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api("departments").then(({ status, data }) => {
      if (status === 200 && Array.isArray(data)) {
        setDepartments((data as { id: number; name: string }[]).map((d) => ({ id: d.id, name: d.name })));
      }
    });
  }, []);

  const openTicket = async (id: number) => {
    const { status, data } = await api(`tickets/${id}`);
    if (status === 200) {
      setSelected(data as unknown as TicketDetail);
      const c = await api(`tickets/${id}/comments`);
      if (c.status === 200 && Array.isArray(c.data)) setComments(c.data as unknown as Comment[]);
    }
  };

  if (notConnected) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-tint text-ember-ink">
          <IconInbox size={22} />
        </span>
        <p className="mt-4 font-display text-xl font-semibold text-ink">Help desk not connected yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
          The ticket page is wired to OrbitDesk through a server-side proxy, but the service
          credentials aren’t configured. See <code className="rounded bg-parchment px-1.5 py-0.5 text-[12px] text-ember-ink">docs/orbitdesk-interlink.md</code> for
          the phase-2 wiring checklist — no OrbitDesk code changes needed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-full border border-line bg-white p-1 shadow-card" role="tablist" aria-label="Ticket status filter">
          {STATUS_TABS.map((s) => {
            const active = tab === s;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(s);
                  setSelected(null);
                }}
                className={`relative rounded-full px-3.5 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                  active ? "text-paper" : "text-stone-500 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="ticket-tab-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{s.replace("_", " ")}</span>
              </button>
            );
          })}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_8px_20px_-8px_rgba(180,83,9,0.45)] transition-colors hover:bg-ember-deep"
        >
          <IconPlus size={15} />
          {showForm ? "Close form" : "New ticket"}
        </motion.button>
      </div>

      {showForm && <NewTicketForm departments={departments} onCreated={() => { setShowForm(false); load(); }} />}

      {error && (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <SkeletonRows />
      ) : selected ? (
        <TicketThread
          ticket={selected}
          comments={comments}
          onBack={() => setSelected(null)}
          onCommented={async () => {
            const c = await api(`tickets/${selected.id}/comments`);
            if (c.status === 200 && Array.isArray(c.data)) setComments(c.data as unknown as Comment[]);
          }}
        />
      ) : tickets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-parchment text-stone-400">
            <IconInbox size={22} />
          </span>
          <p className="mt-4 font-display text-xl font-semibold text-ink">All clear</p>
          <p className="mt-1 text-sm text-stone-500">No tickets here. Raise one with “New ticket”.</p>
        </div>
      ) : (
        <ul className="border-t border-line">
          {tickets.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE }}
            >
              <button
                onClick={() => openTicket(t.id)}
                className="group flex w-full items-center gap-3.5 border-b border-line px-2 py-4 text-left transition-colors hover:bg-parchment/50 sm:px-4"
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[t.status] ?? "bg-stone-300"}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold tracking-tight text-ink">{t.subject}</span>
                  <span className="mt-1 block text-xs tabular-nums text-stone-500">
                    {t.ticket_number} · {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · <span className="capitalize">{t.priority}</span> priority
                  </span>
                </span>
                <span className="shrink-0 text-[12px] font-medium capitalize text-stone-400">
                  {t.status.replace("_", " ")}
                </span>
                <IconChevronDown size={15} className="-rotate-90 text-stone-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-magenta" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewTicketForm({ departments, onCreated }: { departments: { id: number; name: string }[]; onCreated: () => void }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [departmentId, setDepartmentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { status, data } = await api("tickets", {
      method: "POST",
      body: JSON.stringify({
        subject: subject.trim(),
        description: description.trim(),
        priority,
        departmentId: departmentId ? Number(departmentId) : undefined,
      }),
    });
    setSaving(false);
    if (status === 201) {
      onCreated();
    } else {
      setError(data?.error ?? `Could not raise the ticket (${status})`);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      onSubmit={submit}
      className="mb-8 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8"
    >
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Raise a ticket</h2>
      <p className="mt-1 text-[13px] text-stone-500">Describe it well — good tickets get fixed faster.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Subject *</span>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputCls}
            placeholder="e.g. Laptop charger stopped working"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Department</span>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputCls}>
            <option value="">General</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Describe the issue *</span>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
            placeholder="What happened, when, and what you need…"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={saving}
        className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ember hover:text-ink disabled:opacity-50"
      >
        {saving ? "Raising…" : "Submit ticket"}
      </motion.button>
    </motion.form>
  );
}

function TicketThread({ ticket, comments, onBack, onCommented }: {
  ticket: TicketDetail;
  comments: Comment[];
  onBack: () => void;
  onCommented: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    const { status } = await api(`tickets/${ticket.id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: draft.trim() }),
    });
    setSending(false);
    if (status === 201) {
      setDraft("");
      onCommented();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-magenta"
      >
        <IconArrowLeft size={14} /> All tickets
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{ticket.subject}</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-parchment px-3 py-1 text-[12px] font-medium capitalize text-stone-600">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[ticket.status] ?? "bg-stone-300"}`} aria-hidden />
          {ticket.status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-2 text-xs tabular-nums text-stone-500">
        {ticket.ticket_number}
        {ticket.department?.name ? ` · ${ticket.department.name}` : ""} · <span className="capitalize">{ticket.priority}</span> priority
      </p>
      <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-parchment/70 p-5 text-[14.5px] leading-relaxed text-ink/90">
        {ticket.description}
      </p>

      <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
        Thread · {comments.length}
      </h3>
      <ul className="mt-4 space-y-4">
        {comments.map((c, i) => (
          <motion.li
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05, ease: EASE }}
            className="rounded-2xl border border-line bg-paper p-4"
          >
            <p className="text-xs text-stone-500">
              <span className="font-semibold text-ink">{c.author?.name ?? "Support"}</span>
              <span className="mx-1.5 text-stone-300">·</span>
              {new Date(c.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{c.body}</p>
          </motion.li>
        ))}
        {comments.length === 0 && (
          <li className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-stone-500">
            No replies yet — the support team will respond here.
          </li>
        )}
      </ul>

      <div className="mt-5 flex gap-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Write a reply…"
          aria-label="Write a reply"
          className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone-400 shadow-card focus:border-ember/60 focus:outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={send}
          disabled={sending || !draft.trim()}
          className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ember-deep disabled:opacity-40"
        >
          {sending ? "Sending…" : "Reply"}
        </motion.button>
      </div>
    </motion.div>
  );
}
