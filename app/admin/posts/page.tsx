"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRole } from "@/lib/roles";
import { usePosts, type PostInput } from "@/lib/posts-store";
import { ARTICLES } from "@/lib/data";
import { Reveal } from "@/components/motion";
import NotAllowed from "@/components/NotAllowed";
import { IconArrowLeft, IconArrowRight, IconPlus } from "@/components/icons";

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const emptyInput = (): PostInput => ({
  title: "",
  excerpt: "",
  category: "Announcements",
  author: "Magistick Team",
  date: new Date().toISOString().slice(0, 10),
  body: [""],
});

function PostEditor({
  initial,
  editingSlug,
  onSave,
  onCancel,
}: {
  initial: PostInput;
  editingSlug: string | null;
  onSave: (input: PostInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<PostInput>(initial);
  const set = (k: keyof PostInput, v: string | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const valid =
    form.title.trim().length > 2 &&
    form.excerpt.trim().length > 0 &&
    form.body.some((p) => p.trim().length > 0);

  return (
    <div className="rounded-2xl border border-ember/40 bg-white/80 p-6 shadow-lift sm:p-8">
      <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">
        {editingSlug ? "Edit post" : "New post"}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Title</span>
          <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Give it a headline people will actually read" />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Category</span>
          <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} list="post-categories" />
          <datalist id="post-categories">
            {Array.from(new Set(ARTICLES.map((a) => a.category))).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Author</span>
          <input className={inputCls} value={form.author} onChange={(e) => set("author", e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Excerpt</span>
          <input className={inputCls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="One line for the index — make it count" />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Date</span>
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            Body — blank line between paragraphs
          </span>
          <textarea
            className={`${inputCls} min-h-[220px] leading-relaxed`}
            value={form.body.join("\n\n")}
            onChange={(e) => set("body", e.target.value.split(/\n\s*\n/))}
            placeholder={"First paragraph hooks the reader.\n\nSecond paragraph earns the scroll."}
          />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!valid}
          onClick={() => valid && onSave(form)}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-all duration-200 hover:bg-ember active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {editingSlug ? "Save changes" : "Publish post"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-stone-500 transition-colors hover:border-stone-300 hover:text-ink"
        >
          Cancel
        </button>
      </div>
      {!valid && (
        <p className="mt-3 text-xs text-stone-400">Title, excerpt and at least one paragraph are required.</p>
      )}
    </div>
  );
}

export default function ManagePostsPage() {
  const { can } = useRole();
  const { posts, createPost, updatePost, deletePost } = usePosts();
  const [editing, setEditing] = useState<{ slug: string | null; input: PostInput } | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const seedSlugs = useMemo(() => new Set(ARTICLES.map((a) => a.slug)), []);

  if (!can("manage_posts")) return <NotAllowed what="Manage posts" />;

  return (
    <div className="space-y-8">
      <Reveal>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-ember">
          <IconArrowLeft size={14} /> Roles &amp; access
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Admin</p>
            <h1 className="mt-1 font-display text-[34px] font-semibold tracking-tight text-ink">Manage posts</h1>
            <p className="mt-2 max-w-xl text-[14.5px] text-stone-600">
              Collaborators and admins can publish straight to the bulletin. Seed posts ship with the
              portal; your edits are stubbed in this browser until phase 2.
            </p>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => { setEditing({ slug: null, input: emptyInput() }); setSavedSlug(null); }}
              className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-2.5 text-sm font-semibold text-paper transition-all duration-200 hover:bg-ember-deep active:scale-95"
            >
              <IconPlus size={15} /> New post
            </button>
          )}
        </div>
      </Reveal>

      {savedSlug && !editing && (
        <div className="flex items-center justify-between rounded-2xl border border-ember/30 bg-ember-tint/60 px-5 py-3.5">
          <p className="text-sm font-medium text-ember-ink">Published. It's live in the bulletin now.</p>
          <Link href={`/updates/${savedSlug}`} className="group inline-flex items-center gap-1 text-sm font-semibold text-ember-ink">
            View <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      {editing && (
        <PostEditor
          initial={editing.input}
          editingSlug={editing.slug}
          onCancel={() => setEditing(null)}
          onSave={(input) => {
            if (editing.slug) {
              updatePost(editing.slug, input);
              setSavedSlug(editing.slug);
            } else {
              const created = createPost(input);
              setSavedSlug(created.slug);
            }
            setEditing(null);
          }}
        />
      )}

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70">
        {posts.map((p) => (
          <li key={p.slug} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[16px] font-semibold text-ink">{p.title}</p>
              <p className="mt-0.5 text-xs text-stone-400">
                {p.category} · {formatDate(p.date)} · {p.author}
                {!seedSlugs.has(p.slug) && <span className="ml-2 rounded-full bg-ember-tint px-2 py-0.5 font-semibold text-ember-ink">new</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditing({
                  slug: p.slug,
                  input: { title: p.title, excerpt: p.excerpt, category: p.category, author: p.author, date: p.date, body: p.body },
                });
                setSavedSlug(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-full border border-line px-4 py-1.5 text-[13px] font-semibold text-stone-500 transition-colors hover:border-ember/50 hover:text-ember"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${p.title}"? This can't be undone.`)) deletePost(p.slug);
              }}
              className="rounded-full border border-line px-4 py-1.5 text-[13px] font-semibold text-stone-500 transition-colors hover:border-red-300 hover:text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
