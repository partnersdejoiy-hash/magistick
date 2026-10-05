/**
 * Ambient gradient field — threeui-inspired depth, tuned down for a work portal.
 * Two slow-drifting warm blobs + film grain. Pure CSS, pointer-transparent,
 * aria-hidden. Respects prefers-reduced-motion via globals.css.
 */
export default function AmbientField({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`grain pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="animate-drift-a absolute -top-32 right-[-8%] h-[420px] w-[560px] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(217,72,15,0.16), transparent)" }}
      />
      <div
        className="animate-drift-b absolute bottom-[-30%] left-[-10%] h-[480px] w-[620px] rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(214,164,60,0.14), transparent)" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-40 opacity-80"
        style={{ background: "linear-gradient(to bottom, rgba(250,248,243,1), transparent)" }}
      />
    </div>
  );
}
