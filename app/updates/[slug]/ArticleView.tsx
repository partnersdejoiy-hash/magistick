import Link from "next/link";
import type { Article } from "@/lib/data";
import { Reveal } from "@/components/motion";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Full article rendering — shared by seed posts and stub-created posts. */
export default function ArticleView({
  article,
  prev,
  next,
}: {
  article: Article;
  prev?: Article;
  next?: Article;
}) {
  return (
    <article className="mx-auto max-w-2xl pb-8">
      <Reveal y={12}>
        <Link
          href="/updates"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-ember"
        >
          <IconArrowLeft size={14} /> All updates
        </Link>
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-ember">
          {article.category}
        </p>
        <h1 className="mt-3 font-display text-[36px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[44px]">
          {article.title}
        </h1>
        <div className="mt-5 flex items-center gap-3 border-y border-line py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ember-tint font-display text-sm font-semibold text-ember-ink">
            {article.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{article.author}</p>
            <p className="text-xs text-stone-500">{formatDate(article.date)}</p>
          </div>
        </div>
      </Reveal>

      <Reveal y={14} delay={0.12}>
        <div className="mt-8 space-y-5 text-[16.5px] leading-[1.75] text-ink/85">
          {article.body.map((p, i) => (
            <p key={i} className={i === 0 ? "dropcap" : undefined}>
              {p}
            </p>
          ))}
        </div>
      </Reveal>

      <nav className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2" aria-label="More updates">
        {prev ? (
          <Link href={`/updates/${prev.slug}`} className="group bg-paper p-5 transition-colors hover:bg-parchment/70">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              <IconArrowLeft size={12} /> Newer
            </p>
            <p className="mt-2 font-display text-[16px] font-medium leading-snug text-ink transition-colors group-hover:text-ember-deep">
              {prev.title}
            </p>
          </Link>
        ) : <span className="bg-paper" />}
        {next ? (
          <Link href={`/updates/${next.slug}`} className="group bg-paper p-5 text-right transition-colors hover:bg-parchment/70">
            <p className="flex items-center justify-end gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Older <IconArrowRight size={12} />
            </p>
            <p className="mt-2 font-display text-[16px] font-medium leading-snug text-ink transition-colors group-hover:text-ember-deep">
              {next.title}
            </p>
          </Link>
        ) : <span className="bg-paper" />}
      </nav>
    </article>
  );
}
