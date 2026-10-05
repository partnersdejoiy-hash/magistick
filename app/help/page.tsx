import TicketPanel from "@/components/TicketPanel";
import { IT_HELPDESK_URL } from "@/lib/data";

export const metadata = { title: "Get Help — magistick" };

export default function HelpPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Get Help</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">
        We’re here to help! General tickets (HR, payroll, WFM…) are raised and tracked
        right here, powered by OrbitDesk. IT issues go to the dedicated IT tool.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Path 1 — general tickets, inline via OrbitDesk */}
        <div className="rounded-xl border border-brand-500/40 bg-panel p-5">
          <h2 className="text-sm font-semibold text-slate-100">General tickets</h2>
          <p className="mt-1 text-xs text-slate-400">
            HR, payroll, WFM, facilities and more — raise and follow the whole thread
            below without leaving magistick.
          </p>
        </div>
        {/* Path 2 — IT, external tool in a new tab (Glowstick's ServiceNow pattern) */}
        <div className="rounded-xl border border-line bg-panel p-5">
          <h2 className="text-sm font-semibold text-slate-100">IT support</h2>
          <p className="mt-1 text-xs text-slate-400">
            Device, network, and access issues live in the dedicated IT tool.
          </p>
          <a
            href={IT_HELPDESK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-200 hover:border-brand-500/60 hover:text-white"
          >
            Submit IT Ticket ↗
          </a>
          {IT_HELPDESK_URL === "#" && (
            <p className="mt-2 text-xs text-slate-500">IT tool coming soon — link lands here.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <TicketPanel />
      </div>
    </div>
  );
}
