/**
 * Deployed frontend (Vercel) — must match browser Origin exactly (no path, no trailing slash).
 * Extra origins via CLIENT_ORIGIN (comma-separated) e.g. preview URLs.
 */

const VERCEL_APP = "https://golf-platform-frontend-coral.vercel.app";
const LOCAL_DEV = "http://localhost:3000";

export function normalizeOrigin(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/+$/, "");
}

export function getAllowedOrigins() {
  const set = new Set([
    normalizeOrigin(LOCAL_DEV),
    normalizeOrigin(VERCEL_APP),
  ]);

  (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean)
    .forEach((o) => set.add(o));

  return set;
}

export function createCorsConfig() {
  const allowed = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowed.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
