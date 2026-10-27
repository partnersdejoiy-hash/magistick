import { sql } from "./db";
import type { Me } from "./auth";
import { POLICIES } from "./policies";
import { POLICY_DOCS } from "./policyDocs";

/**
 * Mitra — magistick's assistant. Answers from company knowledge (policies,
 * updates, apps, portal pages) with sources, and helps with everyday work
 * (drafting, explaining, translating) on an open-source model behind an
 * OpenAI-compatible endpoint.
 */

export type Source = { n: number; title: string; href: string };
type Chunk = { title: string; href: string; text: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>;

const PAGES: Chunk[] = [
  { title: "Get Help — raise a ticket", href: "/help", text: "raise ticket help desk issue problem HR IT payroll admin complaint request support get help" },
  { title: "People directory", href: "/directory", text: "people directory find colleague employee manager reporting chain phone email org chart" },
  { title: "Policy Center", href: "/policies", text: "policies policy center rules handbook leave attendance posh security wfh conduct" },
  { title: "New hire guide", href: "/new-hire", text: "new hire joining onboarding first day induction documents trainee" },
  { title: "Company updates", href: "/updates", text: "updates news announcements company posts" },
  { title: "My team", href: "/team", text: "my team members reports team leader" },
  { title: "Apps", href: "/apps", text: "apps tools launcher chronix orbitdesk dmail shine it" },
];

// Policy decks and full documents are static: build their chunks once.
const flat = (v: unknown): string =>
  typeof v === "string" ? v : Array.isArray(v) ? v.map(flat).join(" ") : v && typeof v === "object" ? Object.values(v).map(flat).join(" ") : "";

const POLICY_CHUNKS: Chunk[] = [
  ...POLICIES.map((p) => ({
    title: `${p.title} (policy, ${p.status})`,
    href: `/policies/${p.slug}`,
    text: `${p.title}. ${p.summary} ${flat(p.slides)}`,
  })),
  ...Object.entries(POLICY_DOCS).flatMap(([slug, sections]) => {
    const title = POLICIES.find((p) => p.slug === slug)?.title ?? slug;
    return sections.map((s) => ({
      title: `${title} — ${s.heading}`,
      href: `/policies/${slug}`,
      text: `${title}. ${s.heading}. ${flat(s.paras)} ${flat(s.clauses)} ${s.table ? flat(s.table.head) + " " + flat(s.table.rows) : ""}`,
    }));
  }),
];

// Post bodies are stored as JSON (paragraph arrays); fall back to raw text.
const bodyText = (body: unknown) => {
  try {
    return flat(JSON.parse(String(body)));
  } catch {
    return String(body ?? "");
  }
};

const STOP = new Set("the and for are you your with this that from have what how can when where who will about into our not but was were has had does did any all please kya hai hain kaise kab kaha kahan mera meri mere mujhe karna krna kro karo".split(" "));
const words = (s: string) => (s.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []).filter((w) => !STOP.has(w));

/** Top chunks for a question: term-frequency × inverse document frequency. */
export function rank(question: string, chunks: Chunk[], limit = 5): Chunk[] {
  const q = Array.from(new Set(words(question)));
  if (!q.length) return [];
  const docs = chunks.map((c) => words(`${c.title} ${c.title} ${c.text}`));
  const idf = new Map(q.map((t) => [t, Math.log(1 + chunks.length / (1 + docs.filter((d) => d.includes(t)).length))]));
  return chunks
    .map((c, i) => {
      const counts = new Map<string, number>();
      for (const w of docs[i]) if (idf.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
      let score = 0;
      counts.forEach((n, t) => (score += (1 + Math.log(n)) * idf.get(t)!));
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

/** Company knowledge this employee may see, plus their apps. */
async function knowledge(me: Me) {
  const db = sql();
  const [posts, apps] = (await Promise.all([
    db`SELECT slug, title, excerpt, body FROM posts
       WHERE (audience = 'all' OR audience = ${me.department})
         AND (region = 'global' OR lower(region) = lower(${me.location}))
       ORDER BY date DESC LIMIT 200`,
    db`SELECT a.name, a.blurb, a.href FROM apps a
       LEFT JOIN app_permissions p ON p.app_id = a.id AND p.role = ${me.level}
       WHERE COALESCE(p.allowed, TRUE) = TRUE
         AND (NOT EXISTS (SELECT 1 FROM app_departments d WHERE d.app_id = a.id)
              OR EXISTS (SELECT 1 FROM app_departments d WHERE d.app_id = a.id AND d.department = ${me.department}))
       ORDER BY a.sort_order, a.name`,
  ])) as Rec[][];
  const postChunks: Chunk[] = posts.map((p) => ({
    title: String(p.title),
    href: `/updates/${p.slug}`,
    text: `${p.title}. ${p.excerpt} ${bodyText(p.body).slice(0, 2500)}`,
  }));
  const appList = apps.map((a) => `- ${a.name}: ${a.blurb} (${a.href})`).join("\n");
  return { chunks: [...PAGES, ...POLICY_CHUNKS, ...postChunks], appList };
}

function systemPrompt(me: Me, appList: string, context: string) {
  return `You are Mitra, the friendly assistant inside magistick, the employee portal of DEJOIY (an Indian BPO). Today is ${new Date().toDateString()}.

You are talking to ${me.name} (${me.title || me.level}, ${me.department} department, ${me.location || "location not set"}).

How to help:
- Help with anything work-related: company policies and updates, finding the right app or page, drafting emails, chat messages and ticket descriptions, explaining things, summarising, translating, calculations, Excel formulas, customer-reply drafts and coding questions. Do the task fully instead of refusing.
- Reply in the user's language and tone. If they write Hinglish, reply in natural Hinglish.
- For DEJOIY-specific facts (policies, rules, numbers, dates, contacts) use ONLY the context below and cite it like [1]. If the context does not cover it, say you don't know and suggest raising a ticket at /help. Never invent a policy, number or person.
- Policies marked Draft are proposals awaiting HR and legal sign-off; say so when quoting them.
- Link portal pages as markdown links, e.g. [Get Help](/help).
- Never reveal another employee's private details (salary, personal phone, address, health, documents). Refuse anything illegal, harmful, or that would harm customers, colleagues or DEJOIY.
- Keep answers short and scannable: a direct answer first, then steps or bullets only when they help.

Apps ${me.name.split(" ")[0]} can open:
${appList || "- none listed"}

Context:
${context || "(no matching company documents for this question)"}`;
}

export async function prepare(me: Me, question: string) {
  const { chunks, appList } = await knowledge(me);
  const top = rank(question, chunks);
  const sources: Source[] = top.map((c, i) => ({ n: i + 1, title: c.title, href: c.href }));
  const context = top.map((c, i) => `[${i + 1}] ${c.title} (${c.href})\n${c.text.slice(0, 1800)}`).join("\n\n");
  return { system: systemPrompt(me, appList, context), sources };
}

/** OpenAI-compatible endpoint: Mitra's own, else the DEJOIY AI Gateway. */
export function modelConfig() {
  const gateway = (process.env.AI_GATEWAY_URL || "").replace(/\/$/, "");
  const base = (process.env.MITRA_AI_BASE_URL || (gateway ? `${gateway}/v1` : "")).replace(/\/$/, "");
  const key = process.env.MITRA_AI_KEY || process.env.AI_GATEWAY_KEY || "";
  const model = process.env.MITRA_AI_MODEL || "kaali-smart";
  return base ? { url: `${base}/chat/completions`, key, model } : null;
}

/**
 * Streams the model's answer as plain text deltas. Hides <think>…</think>
 * blocks that open-source reasoning models (Qwen, DeepSeek) emit.
 */
export async function streamAnswer(messages: { role: string; content: string }[], onText: (text: string) => void, signal?: AbortSignal) {
  const cfg = modelConfig();
  if (!cfg) throw new Error("Mitra is not connected to a model yet. Set MITRA_AI_BASE_URL or AI_GATEWAY_URL in Vercel.");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cfg.key ? { Authorization: `Bearer ${cfg.key}` } : {}) },
    body: JSON.stringify({ model: cfg.model, messages, stream: true, temperature: 0.4 }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`The AI service answered ${res.status}. Try again in a moment.`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let full = "";
  let sent = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.replace(/^data:\s*/, "").trim();
      if (!data || data === "[DONE]" || !line.startsWith("data:")) continue;
      try {
        full += JSON.parse(data).choices?.[0]?.delta?.content ?? "";
      } catch {
        continue;
      }
      const visible = full.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").replace(/^\s+/, "");
      if (visible.length > sent) {
        onText(visible.slice(sent));
        sent = visible.length;
      }
    }
  }
}
