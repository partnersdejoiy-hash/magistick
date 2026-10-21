import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyDeck from "@/components/PolicyDeck";
import { POLICIES, POLICY_BY_SLUG } from "@/lib/policies";

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = POLICY_BY_SLUG[params.slug];
  return { title: p ? `${p.title} — Policy Center` : "Policy Center" };
}

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const idx = POLICIES.findIndex((p) => p.slug === params.slug);
  if (idx < 0) notFound();
  return <PolicyDeck policy={POLICIES[idx]} prev={POLICIES[idx - 1]} next={POLICIES[idx + 1]} />;
}
