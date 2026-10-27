import { NextRequest, NextResponse } from "next/server";
import { getMe } from "@/lib/auth";
import { sql } from "@/lib/db";
import { allowedReturn, signSso } from "@/lib/sso";

export const dynamic = "force-dynamic";

/** GET /api/sso/authorize?return=<app callback URL> → back to the app with ?token=… */
export async function GET(req: NextRequest) {
  const back = allowedReturn(req.nextUrl.searchParams.get("return"));
  if (!back) return NextResponse.json({ error: "That app is not allowed to sign in with magistick." }, { status: 400 });
  const me = await getMe().catch(() => null);
  if (!me) {
    const next = `/api/sso/authorize?return=${encodeURIComponent(back.toString())}`;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, req.url));
  }
  const mgr = me.manager_id
    ? ((await sql()`SELECT email FROM users WHERE id = ${me.manager_id} LIMIT 1`) as { email: string }[])[0]
    : undefined;
  const token = await signSso(
    {
      email: me.email,
      name: me.name,
      level: me.level,
      department: me.department,
      title: me.title,
      location: me.location,
      manager_email: mgr?.email ?? null,
    },
    back.host,
  );
  back.searchParams.set("token", token);
  return NextResponse.redirect(back);
}
