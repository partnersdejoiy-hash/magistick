"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { IT_HELPDESK_URL } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { useSession } from "@/lib/roles";
import { FOUNDER } from "@/lib/vision";
import { matchesGeo, type GeoView } from "./GeoToggle";
import { IconArrowRight, IconBook, IconExternal, IconPeople, IconTicket } from "./icons";
import type { Post } from "./UpdatesFeed";

/** HR, people and culture updates get the photo-banner treatment in the sidebar. */
const PEOPLE_NEWS = /hr|people|culture|kudos|shine|benefit|policy|workforce|wellness|celebrat|event/i;

/** Sticky "More from us" column: HR & culture banners, the founder, the Policy Center, and quick help links. */
export default function MoreFromUs({ geo }: { geo: GeoView }) {
  const { can } = useSession();
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts(Array.isArray(d.posts) ? d.posts : []))
      .catch(() => setPosts([]));
  }, []);

  const news = (posts ?? []).filter((p) => PEOPLE_NEWS.test(p.category) && matchesGeo(geo, p.region)).slice(0, 3);

  return (
    <aside aria-labelledby="more-h" className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[28px] bg-gold p-2 shadow-[0_14px_36px_-14px_rgba(234,179,8,0.9)]">
        <h2 id="more-h" className="px-3 pb-2 pt-2 font-display text-[22px] font-semibold text-nil">
          More from us
        </h2>

        <ul className="space-y-2">
          {posts === null
            ? [0, 1].map((n) => <li key={n} className="skeleton h-40 rounded-2xl" />)
            : news.map((p) => (
                <li key={p.id}>
                  <Link href={`/updates/${p.slug}`} className="group block overflow-hidden rounded-2xl bg-nil text-white">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {p.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- banner photo
                        <img src={p.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-nil via-nil/30 to-transparent" />
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-gold px-2 py-0.5 text-[11px] font-bold text-nil">{p.category}</span>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold leading-snug group-hover:text-gold">{p.title}</p>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-white/70">{p.excerpt}</p>
                      <p className="mt-2 text-[11.5px] text-white/50">
                        {formatDate(p.date)} · {(p.region ?? "global") === "global" ? "Global" : p.region}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}

          <li>
            <Link href="/vision" className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-nil p-3 pr-4 text-white">
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-nil-2 ring-1 ring-gold/60">
                {/* eslint-disable-next-line @next/next/no-img-element -- local portrait */}
                <img src={FOUNDER.photo} alt="" className="h-full w-full object-cover object-top" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[15px] italic leading-snug">“{FOUNDER.quote}”</span>
                <span className="mt-1 block text-[11.5px] text-white/60 group-hover:text-gold">{FOUNDER.name} · Founder&apos;s vision →</span>
              </span>
            </Link>
          </li>

          <li>
            <Link href="/policies" className="group relative block overflow-hidden rounded-2xl text-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- CDN photo */}
              <img src={photoUrl("hero", 700)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-nil via-nil/80 to-nil/30" />
              <div className="relative p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Policy Center</p>
                <p className="mt-1 font-semibold leading-snug">Leave, shifts, POSH and more, in 2-minute decks</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-gold">
                  Open <IconArrowRight size={13} />
                </span>
              </div>
            </Link>
          </li>

          <li className="overflow-hidden rounded-2xl bg-panel">
            <p className="px-4 pb-1 pt-3 text-[12px] font-bold uppercase tracking-wider text-stone-500">Need something?</p>
            <ul className="divide-y divide-line text-[13.5px]">
              {[
                { href: "/help", icon: IconTicket, title: "Raise a ticket", sub: "HR, payroll, WFM, transport, facilities", ext: false },
                { href: IT_HELPDESK_URL, icon: IconExternal, title: "IT ticket", sub: "Laptop, network, access, passwords", ext: true },
                { href: "/team", icon: IconPeople, title: can("view_team") ? "My team" : "Our team", sub: "Who's who across DEJOIY", ext: false },
                { href: "/new-hire", icon: IconBook, title: "New hire guide", sub: "Every tool explained", ext: false },
              ].map(({ href, icon: Icon, title, sub, ext }) => (
                <li key={title}>
                  <a
                    href={href}
                    {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-ground"
                  >
                    <Icon size={16} className="text-stone-500" />
                    <span className="flex-1">
                      <span className="block font-medium text-ink">{title}</span>
                      <span className="text-[12px] text-stone-500">{sub}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </aside>
  );
}
