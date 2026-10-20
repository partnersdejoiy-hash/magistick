import TicketPanel from "@/components/TicketPanel";
import { IconExternal } from "@/components/icons";
import { IT_HELPDESK_URL } from "@/lib/data";
import { Stamp } from "@/components/Stamp";
import { DEPT_BY_ID, type DeptId } from "@/lib/rbac";

export const metadata = { title: "Get Help — magistick" };

/** Which team owns which kind of question: the map Glowstick hides inside a dropdown. */
const ROUTES: { dept: DeptId; covers: string }[] = [
  { dept: "hr", covers: "Policies, employee relations, letters, profile updates" },
  { dept: "payroll", covers: "Payslips, deductions, PF, reimbursements, tax forms" },
  { dept: "wfm", covers: "Leave approvals, schedule and shift changes, attendance" },
  { dept: "training", covers: "Courses, certifications, nesting and floor readiness" },
  { dept: "quality", covers: "Audit scores, disputes, calibration" },
  { dept: "admin_facilities", covers: "Seating, transport, access cards, cafeteria" },
  { dept: "recruitment", covers: "Referrals, interviews, internal job postings" },
  { dept: "it", covers: "Laptop, network, VPN, passwords, system access" },
];

export default function HelpPage() {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-tight text-ink">Get Help</h1>
      <p className="mt-1 max-w-2xl text-[14px] text-stone-600">
        General tickets (HR, payroll, WFM, facilities and more) are raised and tracked right here. IT issues go to the IT
        help desk.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="who-h" className="lg:col-span-2">
          <h2 id="who-h" className="mb-3 text-[15px] font-semibold text-ink">Who handles what</h2>
          <ul className="grid overflow-hidden rounded-xl border border-line bg-panel sm:grid-cols-2">
            {ROUTES.map((r) => (
              <li key={r.dept} className="flex gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0 sm:odd:border-r">
                <Stamp dept={r.dept} size={16} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-[13.5px] font-semibold text-ink">
                    {DEPT_BY_ID[r.dept].label}
                  </span>
                  <span className="block text-[12.5px] leading-snug text-stone-600">{r.covers}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="it-h" className="rounded-xl border border-line bg-panel p-5">
          <h2 id="it-h" className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Stamp dept="it" size={16} /> IT help desk
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">
            Device, network and access problems need the IT team&rsquo;s own queue. It opens in a new tab.
          </p>
          <a
            href={IT_HELPDESK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={IT_HELPDESK_URL === "#"}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[13.5px] font-semibold text-ink hover:border-ember/50 hover:text-ember"
          >
            Submit IT ticket <IconExternal size={14} />
          </a>
          {IT_HELPDESK_URL === "#" && (
            <p className="mt-3 text-[12.5px] text-stone-500">The IT tool is still being built; this button will open it once it&rsquo;s live.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="mine-h" className="mt-10">
        <h2 id="mine-h" className="text-[17px] font-semibold text-ink">My tickets</h2>
        <p className="mt-1 text-[13.5px] text-stone-600">Raise a general or WFM ticket and follow the whole thread here.</p>
        <div className="mt-4">
          <TicketPanel />
        </div>
      </section>
    </div>
  );
}
