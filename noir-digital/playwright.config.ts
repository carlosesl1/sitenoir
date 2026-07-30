import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env["PLAYWRIGHT_BASE_URL"];
const baseURL = externalBaseURL ?? "http://127.0.0.1:3105";

export default defineConfig({
  testDir: "./tests/interaction",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 2,
  forbidOnly: process.env["CI"] === "true",
  retries: process.env["CI"] === "true" ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          command: "npm run dev -- --port 3105",
          env: {
            DEV_INSPECTORS_ENABLED: "0",
          },
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
});
