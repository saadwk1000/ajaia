import type { NextConfig } from "next";
import path from "node:path";
function resolveApiOrigin() {
  const hosted =
    process.env.VERCEL === "1" ||
    ["production", "preview"].includes(process.env.VERCEL_ENV || "");
  const configuredApiUrl = process.env.API_URL?.trim();
  if (!configuredApiUrl && (hosted || process.env.NODE_ENV === "production")) {
    throw new Error(
      "API_URL is required: set the deployed API HTTPS origin in the frontend project's Vercel environment variables before building.",
    );
  }
  const apiUrl = new URL(configuredApiUrl || "http://localhost:4000");
  if (
    !["http:", "https:"].includes(apiUrl.protocol) ||
    apiUrl.pathname !== "/" ||
    apiUrl.search ||
    apiUrl.hash ||
    apiUrl.username ||
    apiUrl.password
  ) {
    throw new Error(
      "API_URL must be an HTTP(S) origin without credentials, query, or /api/v1 path.",
    );
  }
  if (
    hosted &&
    (apiUrl.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "[::1]"].includes(apiUrl.hostname) ||
      apiUrl.hostname.endsWith(".localhost"))
  ) {
    throw new Error(
      "Vercel API_URL must point to a public HTTPS API, not localhost.",
    );
  }
  return apiUrl.origin;
}
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${resolveApiOrigin()}/api/v1/:path*`,
      },
    ];
  },
  turbopack: { root: path.resolve(__dirname, "..") },
};
export default nextConfig;
