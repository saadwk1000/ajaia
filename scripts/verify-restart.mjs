import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const root = process.cwd();
const require = createRequire(path.join(root, "backend/package.json"));
const env = require("dotenv").parse(await readFile("backend/.env", "utf8"));
const base = "http://localhost:4100/api/v1";
const headers = {
  "X-Ajaia-Request": "1",
  Origin: "http://localhost:3000",
  "Content-Type": "application/json",
};
let child;
let cookie;
let id;
async function start() {
  child = spawn(process.execPath, ["dist/main.js"], {
    cwd: path.join(root, "backend"),
    env: {
      ...process.env,
      ...env,
      PORT: "4100",
      NODE_ENV: "development",
      FRONTEND_ORIGIN: headers.Origin,
    },
    stdio: "ignore",
  });
  for (let i = 0; i < 150; i++) {
    try {
      const r = await fetch(`${base}/health`);
      if (r.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Restart verification API did not become ready");
}
async function stop() {
  if (child?.exitCode === null) {
    const current = child;
    await new Promise((resolve) => {
      current.once("exit", resolve);
      current.kill("SIGTERM");
    });
  }
}
async function request(route, method = "GET", body) {
  const r = await fetch(base + route, {
    method,
    headers: { ...headers, ...(cookie ? { Cookie: cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(r.ok, `Unexpected ${r.status} for ${route}`);
  return r;
}
try {
  await start();
  const login = await request("/auth/demo-login", "POST", {
    userId: "11111111-1111-4111-8111-111111111111",
  });
  cookie = login.headers.get("set-cookie").split(";")[0];
  const doc = await (await request("/documents", "POST")).json();
  id = doc.id;
  const content = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Persisted across API restart",
            marks: [{ type: "bold" }],
          },
        ],
      },
    ],
  };
  await request(`/documents/${id}/content`, "PATCH", {
    content,
    expectedVersion: doc.version,
  });
  await stop();
  await start();
  const reopened = await (await request(`/documents/${id}`)).json();
  assert.deepEqual(reopened.content, content);
  assert.equal(reopened.version, 2);
  assert.equal((await (await request("/auth/me")).json()).name, "Alice");
  console.log(
    "PASS: formatted content, version, and validated session survived an API process restart.",
  );
} finally {
  if (child?.exitCode === null) {
    if (id) await request(`/documents/${id}`, "DELETE");
    if (cookie) await request("/auth/logout", "POST");
  }
  await stop();
}
