"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_BY_ID, STATUS_COLOR, STATUS_LABEL, type Category } from "@/lib/helpdesk";
import { formatDate } from "@/lib/format";
import { APP_ICONS, IconArrowRight, IconCheck } from "./icons";

type Ticket = {
  id: number;
  ticketNumber: string;
  category: string;
  subcategory: string;
  subject: string;
  status: string;
  priority: string;
  assignee: string;
  department: string;
  slaDeadline: string | null;
  createdAt: string;
  updatedAt: string;
};
type Message = { id: number; from: "you" | "support"; author: string; body: string; at: string };
type Detail = Ticket & { description: string; slaBreached: boolean; messages: Message[]; timeline: { label: string; at: string }[] };

const EASE = [0.16, 1, 0.3, 1] as const;
const TABS = [
  { id: "all", label: "All", match: (_s: string) => true },
  { id: "active", label: "Open", match: (s: string) => ["open", "assigned", "in_progress"].includes(s) },
  { id: "waiting", label: "Waiting on you", match: (s: string) => s === "waiting" },
  { id: "done", label: "Resolved", match: (s: string) => ["resolved", "closed"].includes(s) },
] as const;

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || `Request failed (${r.status})`), { status: r.status });
  return d as T;
}

const when = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return formatDate(iso.slice(0, 10));
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? "#71717A";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ backgroundColor: `${c}18`, color: c }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

/* ---------------- raise a ticket ---------------- */

function NewTicket({ onCreated, disabled }: { onCreated: (t: Ticket) => void; disabled: boolean }) {
  const [cat, setCat] = useState<Category | null>(null);
  const [sub, setSub] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Ticket | null>(null);

  const subDef = cat?.subcategories.find((s) => s.name === sub);
  const reset = () => {
    setCat(null);
    setSub("");
    setSubject("");
    setDescription("");
    setPriority("medium");
    setError("");
  };

  const pickSub = (name: string) => {
    setSub(name);
    setSubject(name);
    setPriority(cat?.subcategories.find((s) => s.name === name)?.priority ?? "medium");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cat || !sub) return;
    setBusy(true);
    setError("");
    try {
      const { ticket } = await call<{ ticket: Ticket }>("/api/helpdesk/tickets", {
        method: "POST",
        body: JSON.stringify({ categoryId: cat.id, subcategory: sub, subject, description, priority }),
      });
      setDone(ticket);
      onCreated(ticket);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't raise the ticket.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-ok-tint p-6 text-center ring-1 ring-ok/20 sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ok text-white">
          <IconCheck size={24} />
        </span>
        <p className="mt-3 font-display text-[24px] font-semibold text-ink">Ticket raised</p>
        <p className="mt-1 text-[14px] text-stone-600">
          <span className="font-mono font-semibold text-ink">{done.ticketNumber}</span> is with the {done.department || "support"} team. You&apos;ll see every update below.
        </p>
        <button type="button" onClick={() => setDone(null)} className="mt-5 rounded-full bg-nil px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-ink">
          Raise another ticket
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl bg-panel p-5 ring-1 ring-line sm:p-7">
      <ol className="flex items-center gap-2 text-[12.5px] font-semibold text-stone-500" aria-label="Steps">
        {["Category", "Topic", "Details"].map((s, n) => {
          const step = !cat ? 0 : !sub ? 1 : 2;
          return (
            <li key={s} className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] ${n <= step ? "bg-nil text-gold" : "bg-parchment text-stone-500"}`}>{n + 1}</span>
              <span className={n === step ? "text-ink" : ""}>{s}</span>
              {n < 2 && <span aria-hidden className="mx-1 h-px w-6 bg-line" />}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        {!cat ? (
          <motion.ul
            key="cats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            data-noreveal
          >
            {CATEGORIES.map((c) => {
              const Icon = APP_ICONS[c.icon];
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setCat(c)}
                    className="glow-card group flex h-full w-full items-start gap-3 rounded-2xl border border-line bg-panel p-4 text-left disabled:opacity-50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:-rotate-6 group-hover:scale-110" style={{ backgroundColor: c.color }}>
                      <Icon size={22} />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">{c.name}</span>
                      <span className="block text-[12.5px] leading-snug text-stone-500">{c.blurb}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-5"
            data-noreveal
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: cat.color }}>
                {(() => {
                  const Icon = APP_ICONS[cat.icon];
                  return <Icon size={20} />;
                })()}
              </span>
              <p className="flex-1 text-[16px] font-semibold text-ink">{cat.name}</p>
              <button type="button" onClick={reset} className="text-[13px] font-medium text-ember hover:underline">
                Change category
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-[13px] font-semibold text-stone-700">What is it about?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {cat.subcategories.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    aria-pressed={sub === s.name}
                    onClick={() => pickSub(s.name)}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ring-1 transition-colors ${
                      sub === s.name ? "text-white ring-transparent" : "bg-panel text-ink ring-line hover:ring-gold"
                    }`}
                    style={sub === s.name ? { backgroundColor: cat.color } : undefined}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </fieldset>

            {sub && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]">
                  <label className="block">
                    <span className="text-[13px] font-semibold text-stone-700">Subject</span>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      minLength={4}
                      maxLength={200}
                      className="mt-1.5 h-11 w-full rounded-xl border border-line bg-panel px-3.5 text-[14px] text-ink focus:border-gold focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[13px] font-semibold text-stone-700">Priority</span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-line bg-panel px-3 text-[14px] text-ink focus:border-gold focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="text-[13px] font-semibold text-stone-700">Details</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    minLength={10}
                    maxLength={8000}
                    rows={5}
                    placeholder={subDef?.hint}
                    className="mt-1.5 w-full rounded-xl border border-line bg-panel px-3.5 py-3 text-[14px] leading-relaxed text-ink placeholder:text-stone-400 focus:border-gold focus:outline-none"
                  />
                  <span className="mt-1 block text-[12px] text-stone-500">Tip: {subDef?.hint} Never share passwords, OTPs or full card or account numbers.</span>
                </label>
                {error && (
                  <p role="alert" className="mt-4 rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">
                    {error}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-magic inline-flex items-center gap-2 rounded-full bg-nil px-6 py-3 text-[14px] font-bold text-white ring-1 ring-gold/60 disabled:cursor-wait disabled:opacity-60"
                  >
                    {busy ? "Raising…" : "Raise ticket"} <IconArrowRight size={16} />
                  </button>
                  <span className="text-[12.5px] text-stone-500">Goes straight to OrbitDesk; you&apos;ll follow it here.</span>
                </div>
              </motion.div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- one ticket ---------------- */

function TicketThread({ id, onBack, onChanged }: { id: number; onBack: () => void; onChanged: () => void }) {
  const [t, setT] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { ticket } = await call<{ ticket: Detail }>(`/api/helpdesk/tickets/${id}`);
      setT(ticket);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the ticket.");
    }
  }, [id]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    try {
      await call(`/api/helpdesk/tickets/${id}/reply`, { method: "POST", body: JSON.stringify({ text: reply }) });
      setReply("");
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your reply.");
    } finally {
      setBusy(false);
    }
  };

  const cat = useMemo(() => CATEGORIES.find((c) => c.name === t?.category), [t]);

  return (
    <div className="rounded-3xl bg-panel ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
        <button type="button" onClick={onBack} className="text-[13px] font-medium text-ember hover:underline">
          ← All my tickets
        </button>
        <button type="button" onClick={load} className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink hover:border-gold">
          Refresh
        </button>
      </div>

      {!t ? (
        error ? (
          <p className="m-6 rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>
        ) : (
          <div className="space-y-3 p-7" aria-busy>
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-7 w-2/3" />
            <div className="skeleton h-24" />
          </div>
        )
      ) : (
        <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 p-5 sm:p-7">
            <p className="flex flex-wrap items-center gap-2 text-[12.5px] text-stone-500">
              <span className="font-mono font-semibold text-ink">{t.ticketNumber}</span>
              <StatusPill status={t.status} />
              {t.slaBreached && <span className="rounded-full bg-bad-tint px-2 py-0.5 text-[11.5px] font-bold text-bad">Past due</span>}
            </p>
            <h3 className="mt-2 text-[22px] font-semibold leading-snug text-ink">{t.subject}</h3>
            <p className="mt-1 text-[13px] font-medium" style={{ color: cat?.color }}>
              {t.category} › {t.subcategory}
            </p>

            {t.status === "waiting" && (
              <p className="mt-4 rounded-xl bg-magenta-tint px-4 py-3 text-[13.5px] text-magenta-deep">
                The support team is waiting for your reply. Answer below so they can continue.
              </p>
            )}

            <ol className="mt-6 space-y-4" aria-label="Conversation">
              <li className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-nil px-4 py-3 text-white">
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{t.description}</p>
                  <p className="mt-1.5 text-right text-[11.5px] text-white/60">You · {when(t.createdAt)}</p>
                </div>
              </li>
              {t.messages.map((m) => (
                <li key={m.id} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      m.from === "you" ? "rounded-tr-md bg-nil text-white" : "rounded-tl-md bg-gold-tint text-ink ring-1 ring-gold/40"
                    }`}
                  >
                    {m.from === "support" && <p className="mb-1 text-[12px] font-bold text-gold-ink">{m.author}</p>}
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{m.body}</p>
                    <p className={`mt-1.5 text-[11.5px] ${m.from === "you" ? "text-right text-white/60" : "text-stone-500"}`}>
                      {m.from === "you" ? "You" : "Support"} · {when(m.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            {t.messages.length === 0 && <p className="mt-4 text-[13px] text-stone-500">No replies yet. The team&apos;s answer will appear here.</p>}

            {t.status === "closed" ? (
              <p className="mt-6 rounded-xl bg-parchment px-4 py-3 text-[13.5px] text-stone-600">This ticket is closed. Raise a new one if you still need help.</p>
            ) : (
              <form onSubmit={send} className="mt-6">
                <label className="block">
                  <span className="sr-only">Your reply</span>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    maxLength={6000}
                    placeholder="Write a reply to the support team…"
                    className="w-full rounded-2xl border border-line bg-panel px-4 py-3 text-[14px] text-ink placeholder:text-stone-400 focus:border-gold focus:outline-none"
                  />
                </label>
                {error && <p className="mt-2 text-[13px] text-bad">{error}</p>}
                <button
                  type="submit"
                  disabled={busy || !reply.trim()}
                  className="mt-2 rounded-full bg-nil px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-ink disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send reply"}
                </button>
              </form>
            )}
          </div>

          <aside className="border-t border-line bg-ground/60 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <dl className="space-y-3 text-[13px]">
              {[
                ["Team", t.department || "Being routed"],
                ["Handled by", t.assignee || "Not assigned yet"],
                ["Priority", t.priority.charAt(0).toUpperCase() + t.priority.slice(1)],
                ["Raised", formatDate(t.createdAt.slice(0, 10))],
                ["Due by", t.slaDeadline ? new Date(t.slaDeadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11.5px] font-bold uppercase tracking-wider text-stone-500">{k}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {t.timeline.length > 0 && (
              <>
                <p className="mt-6 text-[11.5px] font-bold uppercase tracking-wider text-stone-500">Timeline</p>
                <ol className="mt-2 space-y-2 border-l-2 border-line pl-4">
                  {t.timeline.map((h, n) => (
                    <li key={n} className="relative text-[12.5px]">
                      <span aria-hidden className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-ground" />
                      <span className="block font-medium capitalize text-ink">{h.label}</span>
                      <span className="text-stone-500">{when(h.at)}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

/* ---------------- the desk ---------------- */

export default function HelpDesk() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await call<{ connected: boolean; tickets: Ticket[] }>("/api/helpdesk/tickets");
      setConnected(d.connected);
      setTickets(d.tickets);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your tickets.");
      setTickets([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, (tickets ?? []).filter((x) => t.match(x.status)).length])), [tickets]);
  const shown = (tickets ?? []).filter((x) => TABS.find((t) => t.id === tab)!.match(x.status));

  return (
    <div className="space-y-10">
      {!connected && (
        <p className="rounded-2xl border border-gold/60 bg-gold-tint px-4 py-3 text-[13.5px] text-gold-ink">
          The ticket desk isn&apos;t connected to OrbitDesk yet, so new tickets can&apos;t be raised from here. Please try again later.
        </p>
      )}

      <section aria-labelledby="raise-h">
        <h2 id="raise-h" className="mb-3 text-[17px] font-semibold text-ink">
          Raise a ticket
        </h2>
        <NewTicket
          disabled={!connected}
          onCreated={(t) => {
            setTickets((prev) => [t, ...(prev ?? [])]);
            setTab("all");
          }}
        />
      </section>

      <section aria-labelledby="mine-h">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="mine-h" className="text-[17px] font-semibold text-ink">
            My tickets
          </h2>
          {!open && (
            <div role="tablist" aria-label="Filter tickets" className="inline-flex rounded-xl border border-line bg-panel p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${tab === t.id ? "bg-nil text-white" : "text-stone-600 hover:text-ink"}`}
                >
                  {t.label}
                  <span className={`tabular rounded-full px-1.5 text-[11px] ${tab === t.id ? "bg-white/20" : "bg-parchment"}`}>{counts[t.id] ?? 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {open ? (
          <TicketThread id={open} onBack={() => setOpen(null)} onChanged={load} />
        ) : error ? (
          <p className="rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>
        ) : tickets === null ? (
          <div className="space-y-2" aria-busy>
            {[0, 1, 2].map((n) => (
              <div key={n} className="skeleton h-16" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-panel px-6 py-10 text-center text-[14px] text-stone-500">
            {tickets.length === 0 ? "You haven't raised any tickets yet." : "No tickets in this view."}
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
            {shown.map((t) => {
              const cat = CATEGORY_BY_ID[CATEGORIES.find((c) => c.name === t.category)?.id ?? ""];
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => setOpen(t.id)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-ground sm:px-5">
                    <span aria-hidden className="h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: cat?.color ?? "#D4D4D8" }} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-stone-500">
                        <span className="font-mono font-semibold text-stone-700">{t.ticketNumber}</span>
                        <span>
                          {t.category} › {t.subcategory}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[15px] font-semibold text-ink">{t.subject}</span>
                      <span className="block text-[12px] text-stone-500">
                        {t.assignee ? `With ${t.assignee}` : t.department ? `With ${t.department}` : "Being routed"} · updated {when(t.updatedAt)}
                      </span>
                    </span>
                    <StatusPill status={t.status} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
