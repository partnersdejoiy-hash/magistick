import Link from "next/link";
import { photoUrl, type PhotoKey } from "@/lib/photos";
import { POLICIES, POLICY_BY_SLUG } from "@/lib/policies";
import { IconArrowRight } from "./icons";

/** Home-page insights from the Policy Center: one feature tile and four photo cards with the facts people ask about most. */
const INSIGHTS: { slug: string; value: string; label: string; photo: PhotoKey }[] = [
  { slug: "leave", value: "18 days", label: "Earned leave a year, and up to 30 carry forward", photo: "leave" },
  { slug: "attendance-and-shifts", value: "48 hrs", label: "Notice for a shift swap, approved by both TLs", photo: "attendance" },
  { slug: "information-security", value: "1 hour", label: "To report a security incident. Early is always better", photo: "security" },
  { slug: "posh", value: "90 days", label: "To complete every POSH inquiry, in full confidence", photo: "posh" },
];

export default function PolicyHighlights() {
  return (
    <section aria-labelledby="pol-h">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="pol-h" className="text-[17px] font-semibold text-ink">
          From the Policy Center
        </h2>
        <Link href="/policies" className="flex items-center gap-1 text-[13px] font-medium text-ember hover:underline">
          All policies <IconArrowRight size={14} />
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <li className="sm:col-span-2 lg:row-span-2">
          <Link href="/policies" className="glow-card group relative flex h-full min-h-[320px] overflow-hidden rounded-3xl text-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
            <img
              src={photoUrl("hero", 1400)}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-nil via-nil/60 to-nil/10" />
            <div className="stars absolute inset-0" />
            <div className="relative mt-auto p-6 sm:p-8">
              <span className="rounded-full bg-gold px-3 py-1 text-[12px] font-bold text-nil">{POLICIES.length} policies · 2-minute decks</span>
              <p className="mt-4 font-display text-[28px] font-semibold leading-[1.1] sm:text-[34px]">
                How we work, <span className="text-gold">in plain words</span>
              </p>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/80">
                Leave, shifts, security, POSH and more, as short visual decks with the full policy underneath.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-nil transition-colors group-hover:bg-gold">
                Open the Policy Center <IconArrowRight size={15} />
              </span>
            </div>
          </Link>
        </li>

        {INSIGHTS.map((it) => {
          const p = POLICY_BY_SLUG[it.slug];
          return (
            <li key={it.slug}>
              <Link href={`/policies/${it.slug}`} className="glow-card group relative flex h-full min-h-[220px] overflow-hidden rounded-3xl text-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
                <img
                  src={photoUrl(it.photo, 700)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(20,20,20,0.05) 20%, ${p.accent}F0 100%)` }} />
                <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-[11.5px] font-semibold backdrop-blur-sm">{p.title}</span>
                <div className="relative mt-auto p-5">
                  <p className="font-display text-[34px] font-semibold leading-none drop-shadow-md">{it.value}</p>
                  <p className="mt-2 text-[13px] leading-snug text-white/90">{it.label}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
