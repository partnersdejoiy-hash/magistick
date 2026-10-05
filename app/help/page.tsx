import TicketPanel from "@/components/TicketPanel";

export const metadata = { title: "Get Help — magistick" };

export default function HelpPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Get Help</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">
        We’re here to help! Raise a ticket below and track the whole thread right here —
        no new tabs, powered by OrbitDesk.
      </p>
      <div className="mt-6">
        <TicketPanel />
      </div>
    </div>
  );
}
