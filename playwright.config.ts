import { defineConfig, devices } from "@playwright/test";
const deployedBaseUrl = process.env.AJAIA_E2E_BASE_URL;
export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./docs/test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 10000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "docs/playwright-report" }],
  ],
  use: {
    baseURL: deployedBaseUrl || "http://localhost:3000",
    trace: process.env.AJAIA_TRACE === "1" ? "retain-on-failure" : "off",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: deployedBaseUrl
    ? undefined
    : [
        {
          command: "pnpm --filter backend start:prod",
          env: {
            NODE_ENV: "test",
            FRONTEND_ORIGIN: "http://localhost:3000",
            ADDITIONAL_FRONTEND_ORIGINS: "",
            TRUST_PROXY: "0",
          },
          url: "http://localhost:4000/api/v1/health",
          reuseExistingServer: !process.env.CI,
          timeout: 60000,
        },
        {
          command: "pnpm --filter frontend start",
          env: { API_URL: "http://localhost:4000" },
          url: "http://localhost:3000/login",
          reuseExistingServer: !process.env.CI,
          timeout: 60000,
        },
      ],
});
