import type { Metadata } from "next";
import TeamChart from "@/components/TeamChart";

export const metadata: Metadata = { title: "Our Team — magistick" };

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="team-h" className="stars relative isolate overflow-hidden rounded-3xl bg-nil px-7 py-10 text-white shadow-lift sm:px-12 sm:py-12">
        <span aria-hidden className="animate-drift-a absolute -left-24 -top-28 -z-10 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
        <span aria-hidden className="animate-drift-b absolute -bottom-32 right-0 -z-10 h-80 w-80 rounded-full bg-magenta/20 blur-3xl" />
        <p className="w-fit rounded-full bg-gold px-3 py-1 text-[12.5px] font-bold text-nil">Our team</p>
        <h1 id="team-h" className="mt-4 text-[34px] font-semibold leading-[1.05] sm:text-[48px]">
          Everyone at DEJOIY, <span className="text-gold">in one chart</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-white/80">
          See who leads what, who reports to whom, and find anyone in seconds. Tap a number to open a team, or a name to see their profile.
        </p>
      </section>
      <TeamChart />
    </div>
  );
}
