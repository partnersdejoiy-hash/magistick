import Link from "next/link";
import AppLauncher from "@/components/AppLauncher";
import { ARTICLES } from "@/lib/data";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const latest = ARTICLES.slice(0, 3);
  return (
    <div className="space-y-10">
      {/* Personalized greeting (Glowstick had none) */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight">{greeting()}, Deepak</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your apps, updates, and tickets — all in one place.{" "}
          <Link href="/help" className="text-brand-400 hover:text-brand-300">Check your open tickets →</Link>
        </p>
      </section>

      {/* App launcher */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your apps</h2>
          <Link href="/apps" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
        </div>
        <AppLauncher compact />
      </section>

      {/* Updates feed */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest updates</h2>
          <Link href="/updates" className="text-sm text-brand-400 hover:text-brand-300">All updates →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {latest.map((a) => (
            <Link key={a.slug} href={`/updates/${a.slug}`} className="rounded-xl border border-line bg-panel p-5 transition-colors hover:border-brand-500/60">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-400">{a.category}</p>
              <h3 className="mt-2 font-semibold text-slate-100">{a.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{a.excerpt}</p>
              <p className="mt-3 text-xs text-slate-500">{a.author} · {a.date}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
