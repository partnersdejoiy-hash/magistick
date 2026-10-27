"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSession } from "@/lib/roles";
import { IconCheck } from "./icons";

/**
 * Mitra — magistick's assistant. A docked panel (not a modal: the page stays
 * usable behind it) with private chat history, cited sources and feedback.
 */

type Source = { n: number; title: string; href: string };
type Msg = { id?: string; role: "user" | "assistant"; content: string; sources?: Source[]; rating?: number | null; error?: boolean };
type Chat = { id: string; title: string; updated_at: string };

const SUGGESTIONS = [
  "Leave policy mein kitni chhuttiyan milti hain?",
  "Work from home ke rules kya hain?",
  "TL ko half-day ke liye ek polite email likh do",
  "Laptop kharab hai, ticket kaise raise karun?",
];

/* ---------- authored icons (24 grid, 1.7 stroke, like components/icons.tsx) ---------- */
type IP = { size?: number; className?: string };
const I = ({ size = 18, className, children }: IP & { children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    {children}
  </svg>
);
/** Mitra's mark: a speech bubble with a small spark. */
export const MitraMark = (p: IP) => (
  <I {...p}>
    <path d="M5 5.5h11a3 3 0 0 1 3 3V14a3 3 0 0 1-3 3h-5.5L7 20v-3H5a3 3 0 0 1-3-3V8.5a3 3 0 0 1 3-3Z" />
    <path d="M10.5 8.5v4M8.5 10.5h4" />
    <path d="M20.5 2.5v2.4M19.3 3.7h2.4" strokeWidth={1.5} />
  </I>
);
const IconClose = (p: IP) => (<I {...p}><path d="M6 6l12 12M18 6 6 18" /></I>);
const IconMenu = (p: IP) => (<I {...p}><path d="M4 7h16M4 12h16M4 17h10" /></I>);
const IconNew = (p: IP) => (<I {...p}><path d="M12 5v14M5 12h14" /></I>);
const IconSend = (p: IP) => (<I {...p}><path d="M5 12h12M12 6l6 6-6 6" /></I>);
const IconStop = (p: IP) => (<I {...p}><rect x="7" y="7" width="10" height="10" rx="1.5" /></I>);
const IconCopy = (p: IP) => (<I {...p}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></I>);
const IconUp = (p: IP) => (<I {...p}><path d="M7 11v8H4.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1H7Zm0 0 4-7a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 17 19H7" /></I>);
const IconDown = (p: IP) => (<I {...p}><path d="M17 13V5h2.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H17Zm0 0-4 7a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2.3l1-6A2 2 0 0 1 7 5h10" /></I>);
const IconTrash = (p: IP) => (<I {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></I>);
const IconPen = (p: IP) => (<I {...p}><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" /></I>);
const IconBack = (p: IP) => (<I {...p}><path d="M15 6l-6 6 6 6" /></I>);

/* ---------- tiny safe markdown: paragraphs, lists, **bold**, `code`, [links](…), [n] citations ---------- */
function inline(text: string, sources: Source[], key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)|\[(\d{1,2})\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${m.index}`;
    if (m[1]) out.push(<strong key={k} className="font-semibold text-ink">{m[1]}</strong>);
    else if (m[2]) out.push(<code key={k} className="rounded bg-parchment px-1 py-0.5 text-[12.5px]">{m[2]}</code>);
    else if (m[3]) {
      const href = m[4];
      out.push(
        href.startsWith("/") ? (
          <Link key={k} href={href} className="font-medium text-ember underline decoration-ember/30 underline-offset-2 hover:decoration-ember">{m[3]}</Link>
        ) : (
          <a key={k} href={href} target="_blank" rel="noreferrer" className="font-medium text-ember underline decoration-ember/30 underline-offset-2 hover:decoration-ember">{m[3]}</a>
        ),
      );
    } else {
      const s = sources.find((x) => x.n === Number(m![5]));
      out.push(
        s ? (
          <Link key={k} href={s.href} title={s.title} className="mx-0.5 inline-flex h-[17px] min-w-[17px] -translate-y-px items-center justify-center rounded-full bg-ember-tint px-1 align-middle text-[10.5px] font-semibold text-ember-ink tabular hover:bg-ember hover:text-white">{s.n}</Link>
        ) : (
          m[0]
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Markdown({ text, sources }: { text: string; sources: Source[] }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    const bullet = /^\s*[-*•]\s+/;
    const num = /^\s*\d+[.)]\s+/;
    if (bullet.test(l) || num.test(l)) {
      const ordered = num.test(l);
      const items: string[] = [];
      while (i < lines.length && (ordered ? num : bullet).test(lines[i])) items.push(lines[i++].replace(ordered ? num : bullet, ""));
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={i} className={`space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"} marker:text-stone-400`}>
          {items.map((it, j) => <li key={j}>{inline(it, sources, `${i}-${j}`)}</li>)}
        </Tag>,
      );
      continue;
    }
    const heading = /^#{1,4}\s+/.test(l);
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !bullet.test(lines[i]) && !num.test(lines[i])) {
      para.push(lines[i++].replace(/^#{1,4}\s+/, ""));
      if (heading) break;
    }
    blocks.push(
      <p key={i} className={heading ? "font-semibold text-ink" : undefined}>
        {para.map((p, j) => <Fragment key={j}>{j > 0 && <br />}{inline(p, sources, `${i}-${j}`)}</Fragment>)}
      </p>,
    );
  }
  return <div className="space-y-2.5">{blocks}</div>;
}

/** Same rule as the server: keep the sources the answer cites, or all if it cites none. */
const cited = (m: Msg) => {
  const used = (m.sources ?? []).filter((s) => m.content.includes(`[${s.n}]`));
  return used.length ? used : m.sources;
};

/* ---------- the panel ---------- */
const iconBtn = "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

export default function Mitra() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [chatId, setChatId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [q, setQ] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const loadChats = useCallback(async (query = "") => {
    const r = await fetch(`/api/mitra/chats?q=${encodeURIComponent(query)}`, { cache: "no-store" });
    if (r.ok) setChats((await r.json()).chats);
  }, []);

  useEffect(() => {
    if (view === "history") {
      const t = setTimeout(() => loadChats(q), 200);
      return () => clearTimeout(t);
    }
  }, [view, q, loadChats]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [msgs]);

  useEffect(() => {
    if (!open) return;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!user) return null;
  const first = user.name.split(" ")[0];

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    const patchLast = (fn: (m: Msg) => Msg) => setMsgs((all) => [...all.slice(0, -1), fn(all[all.length - 1])]);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch("/api/mitra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || "Mitra is not reachable right now.");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const l of lines) {
          if (!l) continue;
          const ev = JSON.parse(l);
          if (ev.type === "meta") { setChatId(ev.chatId); patchLast((m) => ({ ...m, sources: ev.sources })); }
          if (ev.type === "delta") patchLast((m) => ({ ...m, content: m.content + ev.text }));
          if (ev.type === "done") patchLast((m) => ({ ...m, id: ev.messageId, sources: cited(m) }));
          if (ev.type === "error") throw new Error(ev.error);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        patchLast((m) => ({ ...m, error: true, content: m.content || (err instanceof Error ? err.message : "Something went wrong.") }));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  async function openChat(id: string) {
    const r = await fetch(`/api/mitra/chats/${id}`, { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    setChatId(id);
    setMsgs(d.messages);
    setView("chat");
  }

  function newChat() {
    abort.current?.abort();
    setChatId(null);
    setMsgs([]);
    setView("chat");
    setTimeout(() => box.current?.focus(), 0);
  }

  async function rename(id: string, title: string) {
    setRenaming(null);
    if (!title.trim()) return;
    await fetch(`/api/mitra/chats/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
    loadChats(q);
  }

  async function remove(id: string) {
    await fetch(`/api/mitra/chats/${id}`, { method: "DELETE" });
    if (id === chatId) newChat();
    loadChats(q);
  }

  async function clearAll() {
    await fetch("/api/mitra/chats", { method: "DELETE" });
    newChat();
    setChats([]);
  }

  async function rate(i: number, rating: number) {
    const m = msgs[i];
    if (!m.id) return;
    const next = m.rating === rating ? 0 : rating;
    setMsgs((all) => all.map((x, j) => (j === i ? { ...x, rating: next || null } : x)));
    await fetch(`/api/mitra/messages/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: next }) });
  }

  async function copy(i: number) {
    await navigator.clipboard.writeText(msgs[i].content).catch(() => {});
    setCopied(i);
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask Mitra, your magistick assistant"
          className="group fixed bottom-[5.5rem] right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-ember pl-3 pr-3 text-white shadow-lift ring-2 ring-white transition-[padding,box-shadow] duration-300 hover:pr-5 hover:shadow-[0_14px_32px_-10px_rgba(194,24,91,0.65)] focus-visible:outline-none focus-visible:ring-gold active:scale-95"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <MitraMark size={20} />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13.5px] font-semibold transition-all duration-300 group-hover:max-w-[8rem] group-focus-visible:max-w-[8rem]">
            Ask Mitra
          </span>
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Mitra assistant"
          className="mitra-panel fixed inset-0 z-50 flex flex-col overflow-hidden bg-panel sm:inset-auto sm:bottom-4 sm:right-4 sm:top-4 sm:w-[min(440px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-line sm:shadow-[0_24px_64px_-16px_rgba(38,38,38,0.35)]"
        >
          {/* Header */}
          <header className="flex items-center gap-2 bg-nil px-3 py-2.5 text-white">
            {view === "history" ? (
              <button type="button" onClick={() => setView("chat")} className={`${iconBtn} hover:bg-white/10`} aria-label="Back to chat">
                <IconBack />
              </button>
            ) : (
              <button type="button" onClick={() => setView("history")} className={`${iconBtn} hover:bg-white/10`} aria-label="Your chats">
                <IconMenu />
              </button>
            )}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember">
              <MitraMark size={18} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[15px] font-semibold">Mitra</p>
              <p className="truncate text-[11.5px] text-white/65">{view === "history" ? "Your chats" : "Your magistick assistant"}</p>
            </div>
            <button type="button" onClick={newChat} className={`${iconBtn} hover:bg-white/10`} aria-label="New chat" title="New chat">
              <IconNew />
            </button>
            <button type="button" onClick={() => setOpen(false)} className={`${iconBtn} hover:bg-white/10`} aria-label="Close Mitra">
              <IconClose />
            </button>
          </header>

          {view === "history" ? (
            /* History */
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-line p-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search your chats"
                  className="h-9 w-full rounded-lg border border-line bg-ground px-3 text-[13.5px] outline-none placeholder:text-stone-400 focus:border-ember focus:bg-panel"
                />
              </div>
              <ul className="mitra-scroll min-h-0 flex-1 divide-y divide-line overflow-y-auto">
                {chats.length === 0 && (
                  <li className="px-4 py-10 text-center text-[13px] text-stone-500">{q ? "No chat matches that." : "No chats yet. Ask Mitra anything to start one."}</li>
                )}
                {chats.map((c) => (
                  <li key={c.id} className={`group flex items-center gap-1 px-2 ${c.id === chatId ? "bg-ember-tint/60" : "hover:bg-ground"}`}>
                    {renaming === c.id ? (
                      <input
                        autoFocus
                        defaultValue={c.title}
                        maxLength={70}
                        onBlur={(e) => rename(c.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") rename(c.id, e.currentTarget.value);
                          if (e.key === "Escape") setRenaming(null);
                        }}
                        className="my-1.5 h-8 flex-1 rounded-md border border-ember px-2 text-[13.5px] outline-none"
                      />
                    ) : (
                      <button type="button" onClick={() => openChat(c.id)} className="min-w-0 flex-1 py-3 pl-2 text-left">
                        <span className="block truncate text-[13.5px] text-ink">{c.title}</span>
                        <span className="text-[11.5px] text-stone-500 tabular">
                          {new Date(c.updated_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                        </span>
                      </button>
                    )}
                    <button type="button" onClick={() => setRenaming(c.id)} className={`${iconBtn} h-8 w-8 text-stone-500 hover:bg-parchment hover:text-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`} aria-label={`Rename ${c.title}`}>
                      <IconPen size={16} />
                    </button>
                    <button type="button" onClick={() => remove(c.id)} className={`${iconBtn} h-8 w-8 text-stone-500 hover:bg-bad-tint hover:text-bad sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`} aria-label={`Delete ${c.title}`}>
                      <IconTrash size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              {chats.length > 0 && !q && (
                <div className="border-t border-line p-3">
                  <button type="button" onClick={clearAll} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium text-bad hover:bg-bad-tint">
                    <IconTrash size={16} /> Clear all chats
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Chat */
            <>
              <div ref={scroller} className="mitra-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
                {msgs.length === 0 ? (
                  <div className="flex h-full flex-col justify-end gap-5 pb-2">
                    <div>
                      <h2 className="font-display text-[26px] font-semibold leading-tight text-ink">Namaste {first}, main Mitra hoon.</h2>
                      <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-stone-600">
                        Policies, updates, apps, ya koi email ya message likhna ho: poochho, Hindi, Hinglish ya English mein.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="rounded-xl border border-line bg-panel px-3.5 py-2.5 text-left text-[13.5px] text-inksoft transition-colors hover:border-ember/40 hover:bg-ember-tint/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ol className="space-y-5">
                    {msgs.map((m, i) =>
                      m.role === "user" ? (
                        <li key={i} className="flex justify-end">
                          <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-nil px-3.5 py-2.5 text-[14px] leading-relaxed text-white">{m.content}</p>
                        </li>
                      ) : (
                        <li key={i} className="flex gap-2.5">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember text-white">
                            <MitraMark size={15} />
                          </span>
                          <div className="min-w-0 flex-1 text-[14px] leading-relaxed text-inksoft">
                            {m.error ? (
                              <p className="rounded-lg bg-bad-tint px-3 py-2 text-bad">{m.content}</p>
                            ) : m.content ? (
                              <Markdown text={m.content} sources={m.sources ?? []} />
                            ) : (
                              <span className="mitra-typing inline-flex gap-1 py-2" aria-label="Mitra is typing">
                                <i /><i /><i />
                              </span>
                            )}
                            {!!m.sources?.length && m.content && !m.error && (
                              <details className="mt-3 rounded-lg border border-line bg-ground text-[12.5px]">
                                <summary className="cursor-pointer select-none px-3 py-2 font-medium text-stone-600 hover:text-ink">
                                  Sources · {m.sources.length}
                                </summary>
                                <ul className="space-y-1 px-3 pb-2.5">
                                  {m.sources.map((s) => (
                                    <li key={s.n} className="flex gap-2">
                                      <span className="text-stone-400 tabular">{s.n}.</span>
                                      <Link href={s.href} className="text-ember hover:underline">{s.title}</Link>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            )}
                            {m.id && (
                              <div className="mt-2 flex gap-0.5 text-stone-400">
                                <button type="button" onClick={() => copy(i)} className={`${iconBtn} h-7 w-7 hover:bg-parchment hover:text-ink`} aria-label="Copy answer" title={copied === i ? "Copied" : "Copy"}>
                                  {copied === i ? <IconCheck size={15} className="text-ok" /> : <IconCopy size={15} />}
                                </button>
                                <button type="button" onClick={() => rate(i, 1)} aria-pressed={m.rating === 1} className={`${iconBtn} h-7 w-7 hover:bg-parchment hover:text-ink ${m.rating === 1 ? "text-ok" : ""}`} aria-label="Helpful">
                                  <IconUp size={15} />
                                </button>
                                <button type="button" onClick={() => rate(i, -1)} aria-pressed={m.rating === -1} className={`${iconBtn} h-7 w-7 hover:bg-parchment hover:text-ink ${m.rating === -1 ? "text-bad" : ""}`} aria-label="Not helpful">
                                  <IconDown size={15} />
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ),
                    )}
                  </ol>
                )}
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="border-t border-line bg-panel p-3"
              >
                <div className="flex items-end gap-2 rounded-xl border border-line bg-ground p-1.5 pl-3 focus-within:border-ember focus-within:bg-panel">
                  <textarea
                    ref={box}
                    value={input}
                    rows={1}
                    maxLength={6000}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Mitra se poochho…"
                    aria-label="Message Mitra"
                    className="mitra-scroll max-h-[140px] min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[14px] leading-snug text-ink outline-none placeholder:text-stone-400"
                  />
                  {busy ? (
                    <button type="button" onClick={() => abort.current?.abort()} className={`${iconBtn} bg-nil text-white hover:bg-nil-3`} aria-label="Stop answering">
                      <IconStop size={16} />
                    </button>
                  ) : (
                    <button type="submit" disabled={!input.trim()} className={`${iconBtn} bg-ember text-white hover:bg-ember-deep disabled:bg-parchment disabled:text-stone-400`} aria-label="Send">
                      <IconSend size={17} />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-center text-[11px] text-stone-500">
                  Mitra galti kar sakta hai. Policy ki baat ho toh <Link href="/policies" className="underline underline-offset-2 hover:text-ember">Policy Center</Link> mein confirm karein.
                </p>
              </form>
            </>
          )}
        </section>
      )}
    </>
  );
}
