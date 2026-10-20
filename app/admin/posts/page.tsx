"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/roles";
import { DEPARTMENTS, DEPT_BY_ID, isDept } from "@/lib/rbac";
import type { PostInput } from "@/lib/db";
import NotAllowed from "@/components/NotAllowed";
import { DeptTag } from "@/components/Stamp";
import { formatDate } from "@/lib/format";
import { IconArrowLeft, IconPlus } from "@/components/icons";
import { api, btn, Field, inputCls, Notice } from "@/components/admin/ui";

type Post = PostInput & { id: string; slug: string };

function PostEditor({
  initial,
  editing,
  onSave,
  onCancel,
}: {
  initial: PostInput;
  editing: boolean;
  onSave: (input: PostInput) => Promise<void>;
  onCancel: () => void;
}) {
  const { user, can } = useSession();
  const [form, setForm] = useState<PostInput>(initial);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof PostInput>(k: K, v: PostInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.title.trim().length > 2 && form.excerpt.trim().length > 0 && form.body.some((p) => p.trim());
  const companyWide = can("publish_posts_all");

  return (
    <form
      className="space-y-4 rounded-xl border border-ember/30 bg-panel p-5 shadow-card"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        setBusy(true);
        await onSave(form);
        setBusy(false);
      }}
    >
      <h2 className="text-[17px] font-semibold text-ink">{editing ? "Edit update" : "New update"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Headline">
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
        </div>
        <Field label="Who sees it" hint={companyWide ? undefined : "Your level can post to your own department only."}>
          <select className={inputCls} value={form.audience} disabled={!companyWide} onChange={(e) => set("audience", e.target.value)}>
            {companyWide && <option value="all">Everyone (company-wide)</option>}
            {DEPARTMENTS.filter((d) => companyWide || d.id === user?.department).map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} only
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Announcements" />
        </Field>
        <Field label="Author shown">
          <input className={inputCls} value={form.author} onChange={(e) => set("author", e.target.value)} />
        </Field>
        <Field label="Date">
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Summary" hint="One line shown in the feed.">
            <input className={inputCls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Body" hint="Leave a blank line between paragraphs.">
            <textarea
              className={`${inputCls} h-auto min-h-[200px] py-2 leading-relaxed`}
              value={form.body.join("\n\n")}
              onChange={(e) => set("body", e.target.value.split(/\n\s*\n/))}
            />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={!valid || busy} className={btn.primary}>
          {busy ? "Saving…" : editing ? "Save changes" : "Publish"}
        </button>
        <button type="button" onClick={onCancel} className={btn.quiet}>
          Cancel
        </button>
        {!valid && <span className="text-[12.5px] text-stone-500">Headline, summary and at least one paragraph are needed.</span>}
      </div>
    </form>
  );
}

export default function ManagePostsPage() {
  const { user, loading, can } = useSession();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; input: PostInput } | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setPosts((await api<{ posts: Post[] }>("/api/admin/posts")).posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load updates.");
      setPosts([]);
    }
  }, []);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (loading || !user) return <div className="skeleton h-40" />;
  if (!can("publish_posts_dept") && !can("publish_posts_all")) return <NotAllowed what="publishing updates" />;

  const blank = (): PostInput => ({
    title: "",
    excerpt: "",
    category: "Announcements",
    author: user.name,
    date: new Date().toISOString().slice(0, 10),
    body: [""],
    audience: can("publish_posts_all") ? "all" : user.department,
  });

  const save = async (input: PostInput) => {
    setError("");
    try {
      const id = editing?.id;
      const d = await api<{ post: Post }>(id ? `/api/admin/posts/${id}` : "/api/admin/posts", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(input),
      });
      setSaved(d.post.slug);
      setEditing(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the update.");
    }
  };

  const remove = async (p: Post) => {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try {
      await api(`/api/admin/posts/${p.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 hover:text-ember">
        <IconArrowLeft size={14} /> Admin
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Updates</h1>
          <p className="mt-1 text-[14px] text-stone-600">
            {can("publish_posts_all")
              ? "Publish to everyone or to a single department."
              : `You publish to ${DEPT_BY_ID[user.department].label}.`}
          </p>
        </div>
        {!editing && (
          <button type="button" className={btn.primary} onClick={() => { setEditing({ id: null, input: blank() }); setSaved(null); }}>
            <IconPlus size={15} /> New update
          </button>
        )}
      </div>

      {error && <Notice kind="error">{error}</Notice>}
      {saved && !editing && (
        <Notice kind="ok">
          Published.{" "}
          <Link href={`/updates/${saved}`} className="font-semibold underline">
            View it
          </Link>
        </Notice>
      )}
      {editing && <PostEditor key={editing.id ?? "new"} initial={editing.input} editing={!!editing.id} onCancel={() => setEditing(null)} onSave={save} />}

      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
        {posts === null ? (
          <li className="p-4">
            <div className="skeleton h-12" />
          </li>
        ) : posts.length === 0 ? (
          <li className="px-4 py-8 text-center text-[13.5px] text-stone-500">No updates yet. Write the first one.</li>
        ) : (
          posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold text-ink">{p.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-stone-500">
                  {p.category} · {formatDate(p.date)} · {p.author}
                  {isDept(p.audience) ? <DeptTag dept={p.audience} /> : <span className="rounded-md bg-parchment px-2 py-0.5 text-stone-700">Everyone</span>}
                </p>
              </div>
              <button
                type="button"
                className="text-[13px] font-medium text-ember hover:underline"
                onClick={() => {
                  setEditing({ id: p.id, input: { title: p.title, excerpt: p.excerpt, category: p.category, author: p.author, date: p.date, body: p.body, audience: p.audience } });
                  setSaved(null);
                  window.scrollTo({ top: 0 });
                }}
              >
                Edit
              </button>
              <button type="button" className="text-[13px] font-medium text-bad hover:underline" onClick={() => remove(p)}>
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
