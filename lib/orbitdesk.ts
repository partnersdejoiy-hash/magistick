/**
 * Server-side OrbitDesk client for the magistick proxy.
 *
 * Design (see docs/orbitdesk-interlink.md): the browser never talks to
 * OrbitDesk. These helpers run inside Next.js route handlers, log in once with
 * the service account (env vars only), and forward the session as an
 * Authorization: Bearer token. Mutating requests carry
 * `Origin: <ORBITDESK_BASE_URL>` so OrbitDesk's same-host origin check passes.
 * No OrbitDesk code, config, or schema is touched.
 */

const BASE = process.env.ORBITDESK_BASE_URL?.replace(/\/$/, "");
const EMAIL = process.env.ORBITDESK_SERVICE_EMAIL;
const PASSWORD = process.env.ORBITDESK_SERVICE_PASSWORD;

export function orbitdeskConfigured(): boolean {
  return Boolean(BASE && EMAIL && PASSWORD);
}

let cachedToken: string | null = null;
let tokenFetchedAt = 0;
const TOKEN_TTL_MS = 7 * 60 * 60 * 1000; // sessions live 8h; refresh early

function extractToken(setCookie: string | null): string | null {
  if (!setCookie) return null;
  // Cookie names: __Host-orbit_session (prod) or orbit_session (dev)
  const m = setCookie.match(/(?:__Host-)?orbit_session=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OrbitDesk login failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const token = extractToken(res.headers.get("set-cookie"));
  if (!token) throw new Error("OrbitDesk login succeeded but returned no session cookie");
  cachedToken = token;
  tokenFetchedAt = Date.now();
  return token;
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() - tokenFetchedAt < TOKEN_TTL_MS) return cachedToken;
  return login();
}

export type ProxyResult = { status: number; body: string; contentType: string };

/**
 * Forward one request to the OrbitDesk API. `subPath` is the part after /api/,
 * e.g. "tickets?status=open". Never logs credentials or tokens.
 */
export async function proxyToOrbitDesk(
  subPath: string,
  init: { method?: string; body?: string; query?: string } = {},
): Promise<ProxyResult> {
  if (!orbitdeskConfigured()) {
    return {
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "OrbitDesk not connected",
        detail:
          "Set ORBITDESK_BASE_URL, ORBITDESK_SERVICE_EMAIL and ORBITDESK_SERVICE_PASSWORD env vars (see docs/orbitdesk-interlink.md).",
      }),
    };
  }

  const method = (init.method ?? "GET").toUpperCase();
  const url = `${BASE}/api/${subPath}${init.query ?? ""}`;

  const attempt = async (token: string): Promise<Response> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    // OrbitDesk rejects non-GET calls without a matching Origin header.
    // Same-host origin passes its check; no OrbitDesk change required.
    if (method !== "GET" && method !== "HEAD") headers["Origin"] = BASE as string;
    return fetch(url, {
      method,
      headers,
      body: init.body,
      // never follow into HTML login pages; API always returns JSON
      redirect: "manual",
    });
  };

  let res = await attempt(await getToken());
  if (res.status === 401) {
    // token expired server-side → fresh login, one retry
    cachedToken = null;
    res = await attempt(await login());
  }

  const contentType = res.headers.get("content-type") ?? "application/json";
  const body = await res.text();
  return { status: res.status, body, contentType };
}
