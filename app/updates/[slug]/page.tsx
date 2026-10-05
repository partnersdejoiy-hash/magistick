import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "@/lib/data";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = ARTICLES.find((a) => a.slug === params.slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link href="/updates" className="text-xs font-medium text-violet-600 hover:text-violet-500">
        ← All updates
      </Link>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-violet-600">{article.category}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{article.title}</h1>
      {/* Author + date shown on the page — Glowstick hid both */}
      <p className="mt-2 text-sm text-slate-500">By {article.author} · {article.date}</p>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-700">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
