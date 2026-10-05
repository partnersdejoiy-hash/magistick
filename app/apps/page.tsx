import AppDirectory from "@/components/AppDirectory";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Apps — magistick" };

export default function AppsPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div>
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Directory</p>
        <h1 className="mt-1 font-display text-[34px] font-semibold tracking-tight text-ink">Every app, one shelf</h1>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-stone-600">
          The full BPO toolkit — HR, pay, learning, IT and culture. Pin your daily
          drivers and they’ll ride at the top, everywhere.
        </p>
      </Reveal>
      <div className="mt-8">
        <AppDirectory initialQuery={searchParams.q ?? ""} />
      </div>
    </div>
  );
}
