/** Browser Origin is always scheme+host+port — no path, no trailing slash. */

function normalizeOrigin(url) {
  if (!url || typeof url !== "string") return "";
  const s = url.trim().replace(/\/+$/, "");
  return s;
}

export function getAllowedOrigins() {
  const raw = process.env.CLIENT_ORIGIN || "";
  const parts = raw
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);

  if (parts.length > 0) return new Set(parts);

  return new Set([normalizeOrigin("https://golf-platform-frontend-coral.vercel.app/")]);
}

export function createCorsConfig() {
  const allowed = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = normalizeOrigin(origin);
      if (allowed.has(normalized)) {
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

export function corsErrorHeaders(req) {
  const origin = req.headers.origin;
  if (!origin) return {};
  const normalized = normalizeOrigin(origin);
  if (getAllowedOrigins().has(normalized)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
    };
  }
  return {};
}
