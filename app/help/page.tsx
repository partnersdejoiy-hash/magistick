import TicketPanel from "@/components/TicketPanel";
import { Reveal } from "@/components/motion";
import { IconExternal, IconTicket } from "@/components/icons";
import { IT_HELPDESK_URL } from "@/lib/data";

export const metadata = { title: "Get Help — magistick" };

export default function HelpPage() {
  return (
    <div>
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Support</p>
        <h1 className="mt-1 font-display text-[34px] font-semibold tracking-tight text-ink">Get Help</h1>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-stone-600">
          We’re here to help. General tickets are raised and tracked right here, powered by
          OrbitDesk. IT issues live in the dedicated IT tool.
        </p>
      </Reveal>

      {/* Two paths — feature band + quiet row, not two identical cards */}
      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3" delay={0.05}>
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-ink p-7 text-paper sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
              style={{ background: "radial-gradient(closest-side, #D9480F, transparent)" }}
            />
            <div className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ember text-ink">
                <IconTicket size={20} />
              </span>
              <h2 className="mt-4 font-display text-[24px] font-semibold tracking-tight">
                General tickets, inline
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-400">
                <li className="flex gap-2.5"><span className="text-magenta">—</span>HR, payroll, WFM, facilities & more</li>
                <li className="flex gap-2.5"><span className="text-magenta">—</span>Raise one below in under a minute</li>
                <li className="flex gap-2.5"><span className="text-magenta">—</span>Follow the full thread without leaving magistick</li>
              </ul>
            </div>
            <p className="relative mt-6 text-[12px] uppercase tracking-[0.18em] text-stone-500">
              Scroll down to raise & track ↓
            </p>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.12}>
          <div className="flex h-full flex-col justify-between rounded-3xl border border-line bg-white/70 p-7 shadow-card sm:p-8">
            <div>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">IT support</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Device, network and access issues live in the dedicated IT help-desk tool —
                opening in a new tab, the way it should be.
              </p>
            </div>
            <div className="mt-6">
              <a
                href={IT_HELPDESK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
              >
                Submit IT Ticket
                <IconExternal size={14} />
              </a>
              {IT_HELPDESK_URL === "#" && (
                <p className="mt-3 text-xs text-stone-400">The dedicated IT tool is being built — this button will open it.</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-12">
        <Reveal>
          <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink">My tickets</h2>
          <p className="mt-1 text-sm text-stone-500">Raised by you, answered by support — the whole thread, here.</p>
        </Reveal>
        <div className="mt-6">
          <TicketPanel />
        </div>
      </div>
    </div>
  );
}
