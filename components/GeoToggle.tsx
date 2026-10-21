"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/roles";

/** Which updates to show by geography: everything you can see, company-wide only, or your location only. */
export type GeoView = "all" | "global" | "local";

/** "local" means the reader's own location (case-insensitive), never another office's. */
export const matchesGeo = (view: GeoView, region: string | undefined, place?: string) => {
  const r = (region ?? "global").trim().toLowerCase();
  if (view === "all") return r === "global" || !place || r === place.trim().toLowerCase();
  if (view === "global") return r === "global";
  return !!place && r === place.trim().toLowerCase();
};

const KEY = "magistick.geo";

/** Remembers the choice per browser (a convenience; it never hides anything for good). */
export function useGeoView(): [GeoView, (v: GeoView) => void] {
  const [view, setView] = useState<GeoView>("all");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "global" || v === "local" || v === "all") setView(v);
    } catch {
      /* storage unavailable: default view */
    }
  }, []);
  const set = (v: GeoView) => {
    setView(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  };
  return [view, set];
}

/** Segmented control: Everywhere · Global · <your location>. Hidden location option if your profile has none. */
export default function GeoToggle({ value, onChange, dark = false }: { value: GeoView; onChange: (v: GeoView) => void; dark?: boolean }) {
  const { user } = useSession();
  const place = user?.location?.trim();
  const opts: [GeoView, string][] = [
    ["all", "Everywhere"],
    ["global", "🌐 Global"],
    ...(place ? ([["local", `📍 ${place}`]] as [GeoView, string][]) : []),
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Show updates for"
      className={`inline-flex rounded-full p-1 text-[12.5px] font-semibold ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-panel ring-1 ring-line"}`}
    >
      {opts.map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            value === v ? "bg-gold text-nil" : dark ? "text-white/75 hover:text-white" : "text-stone-600 hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
