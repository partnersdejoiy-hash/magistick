import Link from "next/link";
import HelpDesk from "@/components/HelpDesk";
import { IconArrowRight, IconExternal } from "@/components/icons";
import { Stamp } from "@/components/Stamp";
import { IT_HELPDESK_URL } from "@/lib/data";

export const metadata = { title: "Get Help — magistick" };

/** Get Help: raise and follow OrbitDesk tickets here; IT keeps its own tool; POSH goes to the IC. */
export default function HelpPage() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="help-h" className="stars relative isolate overflow-hidden rounded-3xl bg-nil px-7 py-10 text-white shadow-lift sm:px-12">
        <span aria-hidden className="animate-drift-a absolute -left-24 -top-28 -z-10 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
        <span aria-hidden className="animate-drift-b absolute -bottom-32 right-0 -z-10 h-80 w-80 rounded-full bg-magenta/20 blur-3xl" />
        <p className="w-fit rounded-full bg-gold px-3 py-1 text-[12.5px] font-bold text-nil">Get Help</p>
        <h1 id="help-h" className="mt-4 text-[34px] font-semibold leading-[1.05] sm:text-[46px]">
          How can we <span className="text-gold">help you</span> today?
        </h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-white/80">
          Pick a category, tell us what you need, and follow your ticket right here, from the first reply to resolution.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <HelpDesk />

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="it-h" className="rounded-3xl bg-panel p-5 ring-1 ring-line">
            <h2 id="it-h" className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Stamp dept="it" size={16} /> IT help desk
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">Laptop, network, VPN, passwords and system access go to the IT team&rsquo;s own tool.</p>
            <a
              href={IT_HELPDESK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={IT_HELPDESK_URL === "#"}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13.5px] font-semibold text-ink hover:border-gold"
            >
              Submit IT ticket <IconExternal size={14} />
            </a>
            {IT_HELPDESK_URL === "#" && <p className="mt-3 text-[12.5px] text-stone-500">The IT tool is still being built; this button will open it once it&rsquo;s live.</p>}
          </section>

          <section aria-labelledby="posh-h" className="rounded-3xl bg-[#A855F7] p-5 text-white">
            <h2 id="posh-h" className="text-[15px] font-semibold">Sexual harassment (POSH)</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">
              These complaints don&rsquo;t go through tickets. Write to the Internal Committee directly. Everything stays confidential.
            </p>
            <Link href="/policies/posh" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-nil hover:bg-gold">
              How to reach the IC <IconArrowRight size={14} />
            </Link>
          </section>

          <section aria-labelledby="urgent-h" className="rounded-3xl bg-bad-tint p-5 ring-1 ring-bad/20">
            <h2 id="urgent-h" className="text-[15px] font-semibold text-bad">Unsafe right now?</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink">Call your floor security desk or a team leader immediately. Raise a ticket afterwards.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
