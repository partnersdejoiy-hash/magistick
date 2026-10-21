import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

// The browser crops to 256px JPEG (~20 KB); this cap leaves room but stops abuse.
const MAX_CHARS = 300_000;
const DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

/** POST /api/me/photo { image: dataURL } → set your own profile photo. */
export async function POST(req: Request) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const body = await req.json().catch(() => ({}));
  const image = typeof body.image === "string" ? body.image : "";
  if (!DATA_URL.test(image)) return NextResponse.json({ error: "Upload a JPEG, PNG or WebP image." }, { status: 400 });
  if (image.length > MAX_CHARS) return NextResponse.json({ error: "That photo is too large. Try a smaller one." }, { status: 413 });
  const at = Date.now();
  await sql()`UPDATE users SET photo = ${image}, photo_at = ${at} WHERE id = ${g.me.id}`;
  return NextResponse.json({ photo_at: at });
}

/** DELETE /api/me/photo → back to initials. */
export async function DELETE() {
  const g = await requireMe();
  if ("error" in g) return g.error;
  await sql()`UPDATE users SET photo = '', photo_at = 0 WHERE id = ${g.me.id}`;
  return NextResponse.json({ photo_at: 0 });
}
