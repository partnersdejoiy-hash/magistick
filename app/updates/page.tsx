import UpdatesIndex from "@/components/UpdatesIndex";
import ManagePostsLink from "@/components/ManagePostsLink";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Updates — magistick" };

export default function UpdatesPage() {
  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Bulletin</p>
            <h1 className="mt-1 font-display text-[34px] font-semibold tracking-tight text-ink">Company updates</h1>
            <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-stone-600">
              Announcements, IT notices and workforce news from across the BPO —
              written by the teams, not the algorithm.
            </p>
          </div>
          <ManagePostsLink />
        </div>
      </Reveal>
      <div className="mt-8">
        <UpdatesIndex initialVisible={7} step={4} />
      </div>
    </div>
  );
}
