import { NextRequest, NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { chainFrom, loadPeople, type Person } from "@/lib/people";
import { PREVIEW_TEAM, UI_PREVIEW } from "@/lib/preview";

export const dynamic = "force-dynamic";

const card = (p: Person, reports: number) => ({
  id: p.id,
  name: p.name,
  email: p.email,
  title: p.title,
  level: p.level,
  department: p.department,
  location: p.location,
  manager_id: p.manager_id,
  reports,
});

/**
 * GET /api/directory?id=<personId>  → { person, chain (top→down), reports }
 * GET /api/directory?q=<text>       → { results } (name, email, title, location)
 * GET /api/directory?all=1          → { people } every active person, for the team chart
 * No params → the caller's own card. Suspended people are hidden.
 */
export async function GET(req: NextRequest) {
  const g = await requireMe(["view_directory"]);
  if ("error" in g) return g.error;
  if (UI_PREVIEW && req.nextUrl.searchParams.get("all")) {
    const reports = (id: string | null) => PREVIEW_TEAM.filter((p) => p.manager_id === id).length;
    return NextResponse.json({ people: PREVIEW_TEAM.map((p) => ({ ...p, email: "", reports: reports(p.id) })) });
  }
  const people = (await loadPeople()).filter((p) => p.status === "active");
  const byId = new Map(people.map((p) => [p.id, p]));
  const count = new Map<string, number>();
  for (const p of people) if (p.manager_id) count.set(p.manager_id, (count.get(p.manager_id) ?? 0) + 1);
  const toCard = (p: Person) => card(p, count.get(p.id) ?? 0);

  if (req.nextUrl.searchParams.get("all")) return NextResponse.json({ people: people.map(toCard) });

  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (q) {
    const results = people
      .filter((p) => [p.name, p.email, p.title, p.location].some((f) => f.toLowerCase().includes(q)))
      .slice(0, 25)
      .map(toCard);
    return NextResponse.json({ results });
  }

  const person = byId.get(req.nextUrl.searchParams.get("id") ?? g.me.id);
  if (!person) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({
    person: toCard(person),
    chain: chainFrom(person.manager_id, byId).reverse().map(toCard),
    reports: people.filter((p) => p.manager_id === person.id).map(toCard),
  });
}
