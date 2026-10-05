import Link from "next/link";
import AppCarousel from "@/components/AppCarousel";
import UpdatesFeed from "@/components/UpdatesFeed";
import { ARTICLES } from "@/lib/data";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Personalized greeting (Glowstick had none) */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{greeting()}, Deepak</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your apps, updates, and tickets — all in one place.{" "}
          <Link href="/help" className="font-medium text-violet-600 hover:text-violet-500">
            Check your open tickets →
          </Link>
        </p>
      </section>

      {/* App launcher carousel — Glowstick's signature pattern */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your apps</h2>
          <Link href="/apps" className="text-sm font-medium text-violet-600 hover:text-violet-500">
            View all →
          </Link>
        </div>
        <AppCarousel />
      </section>

      {/* Featured hero band */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-fuchsia-600 text-white shadow-lg">
        <div className="flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">Featured</p>
            <h2 className="mt-2 text-2xl font-bold">Welcome to the new magistick</h2>
            <p className="mt-1 max-w-xl text-sm text-violet-100">
              One login, every app, every update — rebuilt lighter, faster, and prettier.
              Pin your daily apps and explore the new help desk.
            </p>
          </div>
          <Link
            href="/apps"
            className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 shadow hover:bg-violet-50"
          >
            Explore apps →
          </Link>
        </div>
      </section>

      {/* Updates feed */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Latest updates</h2>
          <Link href="/updates" className="text-sm font-medium text-violet-600 hover:text-violet-500">
            All updates →
          </Link>
        </div>
        <UpdatesFeed articles={ARTICLES} initialVisible={3} step={3} />
      </section>
    </div>
  );
}
