import Link from "next/link";
import { ARTICLES } from "@/lib/data";

export const metadata = { title: "Updates — magistick" };

export default function UpdatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Company updates</h1>
      <p className="mt-1 text-sm text-slate-400">Announcements, IT notices, and workforce news from the BPO.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/updates/${a.slug}`} className="rounded-xl border border-line bg-panel p-5 transition-colors hover:border-brand-500/60">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-400">{a.category}</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">{a.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{a.excerpt}</p>
            <p className="mt-3 text-xs text-slate-500">
              By {a.author} · {a.date}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
