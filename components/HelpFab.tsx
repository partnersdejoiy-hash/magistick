"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/roles";
import { IconTicket } from "./icons";

/** Always-there help button, bottom-right. Hidden when signed out or already on /help. */
export default function HelpFab() {
  const pathname = usePathname();
  const { user } = useSession();
  if (!user || pathname.startsWith("/help")) return null;
  return (
    <Link
      href="/help"
      aria-label="Get help: raise a ticket"
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-nil px-3 text-white shadow-lift ring-2 ring-gold/70 transition-[box-shadow,padding] duration-300 hover:pr-5 hover:shadow-[0_0_24px_4px_rgba(255,196,0,0.45)] active:scale-95"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-nil">
        <IconTicket size={16} />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13.5px] font-semibold transition-all duration-300 group-hover:max-w-[8rem] group-focus-visible:max-w-[8rem]">
        Get help
      </span>
    </Link>
  );
}
