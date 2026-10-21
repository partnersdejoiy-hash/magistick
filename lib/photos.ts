/**
 * People photos for the Policy Center, hotlinked from Unsplash's CDN
 * (Unsplash License: free to use, no permission needed). Credits are shown
 * on the Policy Center page.
 */

export const PHOTOS = {
  hero: { id: "", by: "", page: "" },
  conduct: { id: "", by: "", page: "" },
  attendance: { id: "", by: "", page: "" },
  leave: { id: "", by: "", page: "" },
  security: { id: "", by: "", page: "" },
  posh: { id: "", by: "", page: "" },
  wfh: { id: "", by: "", page: "" },
  itUse: { id: "", by: "", page: "" },
  grievance: { id: "", by: "", page: "" },
  support: { id: "", by: "", page: "" },
  teamwork: { id: "", by: "", page: "" },
  celebration: { id: "", by: "", page: "" },
};

export type PhotoKey = keyof typeof PHOTOS;

/** Sized, cropped CDN URL for a photo. */
export function photoUrl(key: PhotoKey, w = 1600): string {
  return `https://images.unsplash.com/${PHOTOS[key].id}?w=${w}&q=80&auto=format&fit=crop`;
}
