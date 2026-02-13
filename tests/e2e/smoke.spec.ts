import { expect, test } from "@playwright/test";

test("home page html contains tool section", async ({ request }) => {
  const res = await request.get("/");
  expect(res.ok()).toBeTruthy();
  const html = await res.text();
  expect(html).toContain('id="tools"');
  expect(html).toContain("AURA Toolbox");
});

test("media manager route responds", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBeTruthy();
});
