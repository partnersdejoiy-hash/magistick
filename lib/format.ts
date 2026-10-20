/** "21 Oct 2026" (or "21 October 2026") from a YYYY-MM-DD date; the raw string if unparseable. */
export function formatDate(iso: string, month: "short" | "long" = "short"): string {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month, year: "numeric" });
}
