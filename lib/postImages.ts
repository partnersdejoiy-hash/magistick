import { PHOTOS, photoUrl, type PhotoKey } from "./photos";

/**
 * Update banners. posts.image holds "" (use the category's default photo),
 * "lib:<photoKey>" (a library photo) or an uploaded data-URL JPEG (served by
 * /api/posts/<id>/image so lists never carry the bytes).
 */

const CATEGORY_DEFAULT: [RegExp, PhotoKey][] = [
  [/announce|news/i, "hero"],
  [/support|help/i, "support"],
  [/workforce|wfm|roster|attendance|shift/i, "attendance"],
  [/\bit\b|tech|system/i, "itUse"],
  [/kudos|culture|shine|celebrat|award|event/i, "celebration"],
  [/hr|people|policy|benefit|leave/i, "teamwork"],
  [/security|safety/i, "security"],
];

export const LIBRARY: PhotoKey[] = Object.keys(PHOTOS) as PhotoKey[];

export function defaultPhotoFor(category: string): PhotoKey {
  return CATEGORY_DEFAULT.find(([re]) => re.test(category))?.[1] ?? "celebration";
}

/** Public URL for a post's banner; `image` may be the raw value or the marker "data". */
export function postImageUrl(id: string, image: string, category: string, w = 1400): string {
  if (image.startsWith("lib:") && image.slice(4) in PHOTOS) return photoUrl(image.slice(4) as PhotoKey, w);
  if (image.startsWith("data") ) return `/api/posts/${encodeURIComponent(id)}/image`;
  return photoUrl(defaultPhotoFor(category), w);
}

/** Validates an image value sent by an editor. Returns the value to store, or null if invalid. */
export function cleanImageInput(v: unknown): string | null {
  if (v === "" ) return "";
  if (typeof v !== "string") return null;
  if (v.startsWith("lib:")) return v.slice(4) in PHOTOS ? v : null;
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(v) && v.length <= 900_000) return v;
  return null;
}

/** "global" or a location name (as in users.location), trimmed. */
export function cleanRegion(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return "global";
  if (typeof v !== "string" || v.trim().length > 60) return null;
  const r = v.trim();
  return r.toLowerCase() === "global" ? "global" : r;
}
