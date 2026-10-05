import { ARTICLES } from "@/lib/data";
import ArticleView from "./ArticleView";
import StubArticleView from "./StubArticleView";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const idx = ARTICLES.findIndex((a) => a.slug === params.slug);
  if (idx === -1) {
    // Not a seed post — may be a stub-created post from Manage posts.
    return <StubArticleView slug={params.slug} />;
  }
  const article = ARTICLES[idx];
  const prev = ARTICLES[idx - 1];
  const next = ARTICLES[idx + 1];
  return <ArticleView article={article} prev={prev} next={next} />;
}
