import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
const code = `import config from '../frontend/next.config.ts'; config.rewrites!().then(routes => console.log(JSON.stringify(routes))).catch(error => {console.error(error.message); process.exitCode=1;});`;
function resolve(env) {
  return spawnSync(
    process.execPath,
    [path.resolve("backend/node_modules/tsx/dist/cli.mjs"), "--eval", code],
    {
      cwd: path.resolve("backend"),
      env: {
        ...process.env,
        API_URL: "",
        VERCEL: "",
        VERCEL_ENV: "",
        NODE_ENV: "development",
        ...env,
      },
      encoding: "utf8",
    },
  );
}
const production = resolve({
  VERCEL: "1",
  API_URL: "https://api.example.com/",
});
assert.equal(production.status, 0, production.stderr);
assert.ok(production.stdout.includes("https://api.example.com/api/v1/:path*"));
const local = resolve({});
assert.equal(local.status, 0, local.stderr);
assert.ok(local.stdout.includes("http://localhost:4000/api/v1/:path*"));
const invalid = [
  { VERCEL: "1" },
  { NODE_ENV: "production" },
  { VERCEL_ENV: "preview", API_URL: "http://localhost:4000" },
  { VERCEL: "1", API_URL: "https://localhost" },
  { VERCEL: "1", API_URL: "http://api.example.com" },
  { VERCEL: "1", API_URL: "https://api.example.com/api/v1" },
  { VERCEL: "1", API_URL: "https://user:password@api.example.com" },
];
for (const env of invalid)
  assert.notEqual(
    resolve(env).status,
    0,
    "Invalid deployment routing was accepted",
  );
console.log(
  "PASS: 9 deployment routing checks (public API rewrites, local development, missing values, preview localhost, HTTPS, paths, credentials).",
);
