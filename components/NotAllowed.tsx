import Link from "next/link";
import { Reveal } from "@/components/motion";
import { IconArrowLeft } from "@/components/icons";

/**
 * Shown when the stubbed role lacks the capability for an admin surface.
 * TODO(phase-2): replace with a server-side 403 via real session auth.
 */
export default function NotAllowed({ what = "this area" }: { what?: string }) {
  return (
    <Reveal>
      <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white/70 px-8 py-14 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
          Restricted
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
          You can't open {what}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone-500">
          Your current role doesn't include this capability. Ask an admin to
          grant it, or switch roles in <span className="font-medium text-ink">Admin → Roles &amp; access</span> to
          preview the portal as another role.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ember"
        >
          <IconArrowLeft size={14} /> Back home
        </Link>
      </div>
    </Reveal>
  );
}
