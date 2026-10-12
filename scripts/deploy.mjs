import { readFile, writeFile, mkdir, mkdtemp, cp } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
const root = process.cwd();
const require = createRequire(path.join(root, "backend/package.json"));
const { parse } = require("dotenv");
const secrets = parse(await readFile(path.join(root, "backend/.env"), "utf8"));
if (!secrets.DATABASE_URL) throw new Error("DATABASE_URL is required");
const webEnvironment = parse(
  await readFile(path.join(root, "frontend/.env"), "utf8"),
);
const webOrigin = secrets.FRONTEND_ORIGIN?.trim();
const apiOrigin = webEnvironment.API_URL?.trim();
for (const [name, value] of [
  ["FRONTEND_ORIGIN", webOrigin],
  ["API_URL", apiOrigin],
]) {
  if (!value)
    throw new Error(
      `${name} is required; fill the actual deployed HTTPS origin in the relevant .env file first.`,
    );
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.origin !== value ||
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.hostname.endsWith(".localhost")
  )
    throw new Error(
      `${name} must be a public HTTPS origin without a path or trailing slash.`,
    );
}
const stage = await mkdtemp(path.join(os.tmpdir(), "ajaia-docs-deployment-"));
const files = [
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  ".gitignore",
  "backend/package.json",
  "backend/tsconfig.json",
  "backend/tsconfig.build.json",
  "backend/nest-cli.json",
  "backend/prisma.config.ts",
  "backend/vercel.json",
  "backend/prisma",
  "backend/src",
  "frontend/package.json",
  "frontend/next.config.ts",
  "frontend/vercel.json",
  "frontend/postcss.config.mjs",
  "frontend/tsconfig.json",
  "frontend/next-env.d.ts",
  "frontend/public",
  "frontend/src",
];
for (const file of files) {
  await mkdir(path.dirname(path.join(stage, file)), { recursive: true });
  await cp(path.join(root, file), path.join(stage, file), {
    recursive: true,
    filter: (source) =>
      !source.includes("/generated/") && !source.endsWith(".spec.ts"),
  });
}
await writeFile(
  path.join(stage, ".vercelignore"),
  "node_modules\n.git\n**/.env\n**/.env.*\n**/dist\n**/.next\n**/generated\ndocs\ntests\n",
);
function run(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn("vercel", args, {
      cwd: stage,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (b) => {
      output += b;
    });
    child.stderr.on("data", (b) => {
      output += b;
    });
    child.stdin.end(input || "");
    child.on("error", reject);
    child.on("exit", (code) => {
      let safe = output;
      for (const value of [secrets.DATABASE_URL, secrets.DIRECT_URL])
        if (value) safe = safe.split(value).join("[REDACTED]");
      if (code) {
        console.error(safe);
        reject(
          new Error(
            `Vercel command failed (${code}): ${args.slice(0, 2).join(" ")}`,
          ),
        );
      } else resolve(safe);
    });
  });
}
for (const [project, directory, framework, buildCommand] of [
  ["ajaia-docs-api", "backend", "nestjs", "pnpm prisma:generate && pnpm build"],
  ["ajaia-docs-web", "frontend", "nextjs", "pnpm build"],
]) {
  await run(
    [
      "api",
      `/v9/projects/${project}`,
      "-X",
      "PATCH",
      "--input",
      "-",
      "--silent",
    ],
    JSON.stringify({
      rootDirectory: directory,
      framework,
      buildCommand,
      installCommand: "pnpm install --frozen-lockfile",
      nodeVersion: "24.x",
      ssoProtection: null,
    }),
  );
  const envs =
    project === "ajaia-docs-api"
      ? {
          DATABASE_URL: secrets.DATABASE_URL,
          DIRECT_URL: secrets.DIRECT_URL || secrets.DATABASE_URL,
          FRONTEND_ORIGIN: webOrigin,
          ADDITIONAL_FRONTEND_ORIGINS:
            secrets.ADDITIONAL_FRONTEND_ORIGINS || "",
          NODE_ENV: "production",
          TRUST_PROXY: secrets.TRUST_PROXY || "1",
          DB_POOL_MAX: secrets.DB_POOL_MAX || "5",
          DB_CONNECT_TIMEOUT_MS: secrets.DB_CONNECT_TIMEOUT_MS || "10000",
        }
      : { API_URL: apiOrigin };
  for (const [key, value] of Object.entries(envs))
    await run(
      [
        "api",
        `/v10/projects/${project}/env?upsert=true`,
        "-X",
        "POST",
        "--input",
        "-",
        "--silent",
      ],
      JSON.stringify({
        key,
        value,
        type:
          key.includes("URL") && project === "ajaia-docs-api"
            ? "sensitive"
            : "plain",
        target: ["production"],
      }),
    );
  await run(["link", "--yes", "--project", project]);
  console.log(`Deploying ${project}…`);
  const result = await run(["deploy", "--yes", "--prod", "--logs"]);
  await writeFile(
    path.join(root, "docs/verification", `${project}-deployment.log`),
    result,
  );
  console.log(result);
}
