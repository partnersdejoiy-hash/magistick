"use client";

import { useCallback, useEffect, useState } from "react";

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

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    open: "bg-sky-100 text-sky-700",
    assigned: "bg-indigo-100 text-indigo-700",
    in_progress: "bg-amber-100 text-amber-700",
    waiting: "bg-violet-100 text-violet-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-200 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-slate-200 text-slate-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none";

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
    // department picker for the new-ticket form (best effort)
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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Help desk not connected yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          The ticket page is wired to OrbitDesk through a server-side proxy, but the service
          credentials aren’t configured. See <code className="text-violet-600">docs/orbitdesk-interlink.md</code> for
          the phase-2 wiring checklist — no OrbitDesk code changes needed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Ticket status filter">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={tab === s}
              onClick={() => {
                setTab(s);
                setSelected(null);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                tab === s
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-slate-300 bg-white text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500"
        >
          {showForm ? "Close form" : "+ New ticket"}
        </button>
      </div>

      {showForm && <NewTicketForm departments={departments} onCreated={() => { setShowForm(false); load(); }} />}

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading tickets…</p>
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
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No tickets here. Raise one with “+ New ticket”.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {tickets.map((t) => (
            <li key={t.id}>
              <button onClick={() => openTicket(t.id)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{t.subject}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.ticket_number} · {new Date(t.created_at).toLocaleDateString()} · {t.priority}
                  </p>
                </div>
                {statusBadge(t.status)}
              </button>
            </li>
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
    <form onSubmit={submit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Raise a ticket</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">Subject *</span>
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputCls}
            placeholder="e.g. Laptop charger stopped working"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Department</span>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputCls}>
            <option value="">General</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">Describe the issue *</span>
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
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:opacity-50"
      >
        {saving ? "Raising…" : "Submit ticket"}
      </button>
    </form>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <button onClick={onBack} className="text-xs font-medium text-violet-600 hover:text-violet-500">← All tickets</button>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-base font-semibold text-slate-900">{ticket.subject}</h2>
        {statusBadge(ticket.status)}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {ticket.ticket_number}
        {ticket.department?.name ? ` · ${ticket.department.name}` : ""} · {ticket.priority} priority
      </p>
      <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{ticket.description}</p>

      <h3 className="mt-6 text-sm font-semibold text-slate-900">Thread</h3>
      <ul className="mt-3 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">
              {c.author?.name ?? "Support"} · {new Date(c.created_at).toLocaleString()}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{c.body}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-slate-500">No replies yet.</li>}
      </ul>

      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Write a reply…"
          aria-label="Write a reply"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Reply"}
        </button>
      </div>
    </div>
  );
}
