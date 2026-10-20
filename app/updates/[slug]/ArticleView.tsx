import Link from "next/link";
import type { DbPost } from "@/lib/db";
import { isDept } from "@/lib/rbac";
import { DeptTag } from "@/components/Stamp";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";
import { formatDate } from "@/lib/format";

export default function ArticleView({ article, prev, next }: { article: DbPost; prev?: DbPost; next?: DbPost }) {
  return (
    <article className="mx-auto max-w-[72ch] pb-8">
      <Link href="/updates" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 hover:text-ember">
        <IconArrowLeft size={14} /> All updates
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px] text-stone-600">
        <span className="font-medium text-stone-700">{article.category}</span>
        {isDept(article.audience) && <DeptTag dept={article.audience} />}
      </div>
      <h1 className="mt-2 text-balance text-[30px] font-semibold leading-tight tracking-tight text-ink sm:text-[34px]">
        {article.title}
      </h1>
      <p className="mt-3 text-[13.5px] text-stone-600">
        {article.author} · <time dateTime={article.date}>{formatDate(article.date, "long")}</time>
      </p>

      <div className="prose-body mt-8 border-t border-line pt-8 text-[16px] leading-[1.75] text-stone-800">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="More updates">
        {prev ? (
          <Link href={`/updates/${prev.slug}`} className="group rounded-xl border border-line bg-panel p-4 hover:border-ember/40">
            <span className="flex items-center gap-1.5 text-[12.5px] text-stone-500">
              <IconArrowLeft size={13} /> Newer
            </span>
            <span className="mt-1 block text-[14.5px] font-medium leading-snug text-ink group-hover:text-ember">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/updates/${next.slug}`} className="group rounded-xl border border-line bg-panel p-4 text-right hover:border-ember/40">
            <span className="flex items-center justify-end gap-1.5 text-[12.5px] text-stone-500">
              Older <IconArrowRight size={13} />
            </span>
            <span className="mt-1 block text-[14.5px] font-medium leading-snug text-ink group-hover:text-ember">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
