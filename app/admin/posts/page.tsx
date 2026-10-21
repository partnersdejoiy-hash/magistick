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
import { photoUrl, type PhotoKey } from "@/lib/photos";
import { LIBRARY, defaultPhotoFor } from "@/lib/postImages";

/** Cover-crop to 1600×900 and save as JPEG (~150–300 KB) before upload. */
async function toBanner(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const W = 1600;
  const H = 900;
  const scale = Math.max(W / bmp.width, H / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  c.getContext("2d")!.drawImage(bmp, (W - w) / 2, (H - h) / 2, w, h);
  bmp.close();
  return c.toDataURL("image/jpeg", 0.8);
}

/** Banner choice: category default, a library photo, or an uploaded image. */
function BannerPicker({ value, category, existingUrl, onChange }: { value: string; category: string; existingUrl?: string; onChange: (v: string) => void }) {
  const [msg, setMsg] = useState("");
  const preview = value.startsWith("data:")
    ? value
    : value.startsWith("lib:")
      ? photoUrl(value.slice(4) as PhotoKey, 900)
      : value === "data"
        ? existingUrl
        : photoUrl(defaultPhotoFor(category), 900);
  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/7] overflow-hidden rounded-xl bg-parchment ring-1 ring-line">
        {/* eslint-disable-next-line @next/next/no-img-element -- banner preview */}
        {preview && <img src={preview} alt="Banner preview" className="absolute inset-0 h-full w-full object-cover" />}
        <span className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11.5px] font-semibold text-white">
          {value === "" ? "Category default" : value.startsWith("lib:") ? "Library photo" : "Your upload"}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {LIBRARY.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(`lib:${k}`)}
            aria-label={`Use library photo ${k}`}
            aria-pressed={value === `lib:${k}`}
            className={`aspect-[4/3] overflow-hidden rounded-md ring-2 ${value === `lib:${k}` ? "ring-gold" : "ring-transparent hover:ring-line"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
            <img src={photoUrl(k, 200)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <label className={`${btn.quiet} cursor-pointer`}>
          Upload a photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                setMsg("");
                onChange(await toBanner(f));
              } catch {
                setMsg("That image couldn't be read. Try a JPEG or PNG.");
              }
            }}
          />
        </label>
        {value !== "" && (
          <button type="button" className="font-medium text-ember hover:underline" onClick={() => onChange("")}>
            Use the category default
          </button>
        )}
        {msg && <span className="text-bad">{msg}</span>}
      </div>
    </div>
  );
}

type Post = PostInput & { id: string; slug: string; imageUrl?: string; region?: string; image?: string };

function PostEditor({
  initial,
  editing,
  existingUrl,
  onSave,
  onCancel,
}: {
  initial: PostInput;
  editing: boolean;
  existingUrl?: string;
  onSave: (input: PostInput) => Promise<void>;
  onCancel: () => void;
}) {
  const { user, can } = useSession();
  const [form, setForm] = useState<PostInput>(initial);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof PostInput>(k: K, v: PostInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.title.trim().length > 2 && form.excerpt.trim().length > 0 && form.body.some((p) => p.trim());
  const companyWide = can("publish_posts_all");
  const [places, setPlaces] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/directory?all=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { people: [] }))
      .then((d: { people?: { location?: string }[] }) =>
        setPlaces(Array.from(new Set((d.people ?? []).map((p) => (p.location ?? "").trim()).filter(Boolean))).sort()),
      )
      .catch(() => setPlaces([]));
  }, []);

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
        <Field label="Where" hint="Global, or one location (people there see it under their location).">
          <input
            className={inputCls}
            list="post-places"
            value={form.region === "global" || !form.region ? "Global" : form.region}
            onChange={(e) => set("region", e.target.value.trim().toLowerCase() === "global" ? "global" : e.target.value)}
          />
          <datalist id="post-places">
            <option value="Global" />
            {places.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field label="Author shown">
          <input className={inputCls} value={form.author} onChange={(e) => set("author", e.target.value)} />
        </Field>
        <Field label="Date">
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Banner photo" hint="Shown in the Home banner, the feed and More from us.">
            <BannerPicker value={form.image ?? ""} category={form.category} existingUrl={existingUrl} onChange={(v) => set("image", v)} />
          </Field>
        </div>
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
  const [editing, setEditing] = useState<{ id: string | null; input: PostInput; imageUrl?: string } | null>(null);
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
    region: "global",
    image: "",
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
      {editing && <PostEditor key={editing.id ?? "new"} initial={editing.input} editing={!!editing.id} existingUrl={editing.imageUrl} onCancel={() => setEditing(null)} onSave={save} />}

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
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- banner thumbnail
                <img src={p.imageUrl} alt="" className="h-12 w-20 shrink-0 rounded-md object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold text-ink">{p.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-stone-500">
                  {p.category} · {formatDate(p.date)} · {p.author} · {(p.region ?? "global") === "global" ? "Global" : p.region}
                  {isDept(p.audience) ? <DeptTag dept={p.audience} /> : <span className="rounded-md bg-parchment px-2 py-0.5 text-stone-700">Everyone</span>}
                </p>
              </div>
              <button
                type="button"
                className="text-[13px] font-medium text-ember hover:underline"
                onClick={() => {
                  setEditing({
                    id: p.id,
                    imageUrl: p.imageUrl,
                    input: { title: p.title, excerpt: p.excerpt, category: p.category, author: p.author, date: p.date, body: p.body, audience: p.audience, region: p.region ?? "global", image: p.image ?? "" },
                  });
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
