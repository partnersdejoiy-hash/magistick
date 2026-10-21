import type { CSSProperties } from "react";
import { DEPT_BY_ID, LEVEL_BY_ID, type DeptId, type LevelId } from "@/lib/rbac";
import AvatarPhoto from "./AvatarPhoto";

/**
 * The signature move: every department owns one hand-block "thappa" motif in
 * its own dye. The same stamp marks that department on the header band,
 * avatars, app access, the permission matrix and the org chart.
 * 16×16 grid, solid fills (evenodd), like a carved wooden block.
 */
export const MOTIFS: Record<string, string> = {
  chevron: "M1 10.5 8 3.5l7 7-2.2 2.2L8 7.9l-4.8 4.8z",
  flower:
    "M8 1.5a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2zM8 9.3a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2zM1.5 8a2.6 2.6 0 1 1 5.2 0 2.6 2.6 0 0 1-5.2 0zM9.3 8a2.6 2.6 0 1 1 5.2 0 2.6 2.6 0 0 1-5.2 0z",
  sun: "M8 4.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM7.2 0h1.6v3.2H7.2zM7.2 12.8h1.6V16H7.2zM0 7.2h3.2v1.6H0zM12.8 7.2H16v1.6h-3.2z",
  leaf: "M8 .8c4.6 3.4 4.6 11 0 14.4C3.4 11.8 3.4 4.2 8 .8zm0 3.6c-1.6 2.2-1.6 5 0 7.2 1.6-2.2 1.6-5 0-7.2z",
  grid: "M1.5 1.5h5.5V7H1.5zM9 1.5h5.5V7H9zM1.5 9H7v5.5H1.5zM9 9h5.5v5.5H9z",
  lotus: "M8 2.2c2.2 2.4 2.2 6.6 0 9.8-2.2-3.2-2.2-7.4 0-9.8zM1 7.6c3.2 0 5.6 2 6.4 5-3.2.2-5.6-1.6-6.4-5zm14 0c-.8 3.4-3.2 5.2-6.4 5 .8-3 3.2-5 6.4-5z",
  diamond: "M8 .5 15.5 8 8 15.5.5 8zm0 4.3L4.8 8 8 11.2 11.2 8z",
  dots: "M4 2.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm8 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM8 6.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm-4 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm8 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z",
  lattice: "M1 1h2.4L15 12.6V15h-2.4L1 3.4zM15 1v2.4L3.4 15H1v-2.4L12.6 1z",
  wave: "M0 8.5c2.7-4 5.3-4 8 0s5.3 4 8 0v3.2c-2.7 4-5.3 4-8 0s-5.3-4-8 0z",
  star: "M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z",
  paisley: "M9.2 1.5c4.2.2 6.4 4.4 4.2 8.6-2 3.8-7.4 5.2-9.6 3 3.2-.2 5.2-2.2 4.4-4.2-.9-1.6-3.2-1.2-3.2-3.4 0-2.4 1.8-4.1 4.2-4z",
};

export function Stamp({
  dept,
  size = 14,
  color,
  className,
  title,
}: {
  dept: DeptId;
  size?: number;
  color?: string;
  className?: string;
  title?: string;
}) {
  const d = DEPT_BY_ID[dept];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d={MOTIFS[d.stamp]} fill={color ?? d.dye} fillRule="evenodd" />
    </svg>
  );
}

/** A repeating printed band of one department's stamp, for the strip under the header. */
export function stampBandStyle(dept: DeptId): CSSProperties {
  const d = DEPT_BY_ID[dept];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='10' viewBox='0 0 22 10'><g transform='translate(6 1) scale(0.5)'><path d='${MOTIFS[d.stamp]}' fill='rgba(255,255,255,0.42)' fill-rule='evenodd'/></g></svg>`;
  return {
    backgroundColor: d.dye,
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundRepeat: "repeat-x",
    backgroundSize: "22px 10px",
  };
}

/** Department chip: stamp + name, tinted with the dye. */
export function DeptTag({ dept, className = "" }: { dept: DeptId; className?: string }) {
  const d = DEPT_BY_ID[dept];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium text-ink ${className}`}
      style={{ backgroundColor: `${d.dye}14`, boxShadow: `inset 0 0 0 1px ${d.dye}33` }}
    >
      <Stamp dept={dept} size={11} />
      {d.label}
    </span>
  );
}

/** Level chip: rank is the hierarchy, so it reads as a plain neutral label with its short name. */
export function LevelTag({ level, className = "" }: { level: LevelId; className?: string }) {
  const l = LEVEL_BY_ID[level];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md bg-parchment px-2 py-0.5 text-[12px] font-medium text-stone-700 ${className}`}
      title={l.blurb}
    >
      {l.label.split(" (")[0]}
    </span>
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar: initials on the department's dye, with that department's stamp pressed in the corner.
 * With `id`, the person's photo covers the initials when they have one. `v` is their photo_at
 * when known: 0 skips the request, a timestamp busts the cache right after a change.
 */
export function Avatar({ name, dept, size = 40, id, v }: { name: string; dept: DeptId; size?: number; id?: string; v?: number }) {
  const d = DEPT_BY_ID[dept];
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: d.dye, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials(name)}
      {id && v !== 0 && <AvatarPhoto key={`${id}-${v ?? ""}`} src={`/api/people/${encodeURIComponent(id)}/photo${v ? `?v=${v}` : ""}`} />}
      <span
        className="absolute -bottom-0.5 -right-0.5 z-[1] flex items-center justify-center rounded-full bg-white"
        style={{ width: size * 0.42, height: size * 0.42, boxShadow: "0 0 0 1.5px #fff" }}
      >
        <Stamp dept={dept} size={Math.round(size * 0.28)} />
      </span>
    </span>
  );
}
