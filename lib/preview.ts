/**
 * Temporary UI preview: sign-in off, read-only. Vercel preview deployments only;
 * VERCEL_ENV is "production" on the live site, so this can never turn on there.
 * shortcut: remove this file and its three call sites once the UI review is done.
 */
export const UI_PREVIEW = process.env.VERCEL_ENV === "preview" && process.env.UI_PREVIEW === "1";
