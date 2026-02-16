import { expect, test } from "@playwright/test";

test("unauthorized member route redirects to login", async ({ request }) => {
  const res = await request.get("/member", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/login?next=%2Fmember");
});

test("registered member stays pending until admin approval", async ({ request }) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `member.${suffix}@aura.local`;
  const password = `TestPass!${suffix}`;

  const registerRes = await request.post("/api/auth/register", {
    data: {
      name: "E2E Member",
      email,
      password
    }
  });
  expect(registerRes.status()).toBe(201);
  const registerJson = await registerRes.json();
  expect(registerJson.requiresApproval).toBe(true);
  expect(registerJson.user.approved).toBe(false);

  const meRes = await request.get("/api/auth/me");
  expect(meRes.ok()).toBeTruthy();
  const meJson = await meRes.json();
  expect(meJson.user).toBeNull();

  const loginRes = await request.post("/api/auth/login", {
    data: { email, password }
  });
  expect(loginRes.status()).toBe(403);
  const loginJson = await loginRes.json();
  expect(loginJson.error).toContain("pending");

  const profileRes = await request.get("/api/member/profile");
  expect(profileRes.status()).toBe(401);

  const logoutRes = await request.post("/api/auth/logout");
  expect(logoutRes.ok()).toBeTruthy();

  const meAfterRes = await request.get("/api/auth/me");
  const meAfterJson = await meAfterRes.json();
  expect(meAfterJson.user).toBeNull();
});
