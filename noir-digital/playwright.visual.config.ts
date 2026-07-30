import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  timeout: 60_000,
  workers: 1,
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
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    env: {
      NEXT_PUBLIC_VISUAL_TEST_MODE: "1",
    },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
