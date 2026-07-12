// ============================================================
// tests/api/auth.spec.ts — Suite API para autenticación (M07)
// ============================================================
// Corre en project `api` (sin storageState de UI).
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService } from "../../services";
import usersJson from "../../data/users.json";
import type { User } from "../../types";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("AuthService @api", () => {
  let auth: AuthService;

  test.beforeAll(async () => {
    auth = await AuthService.create(API_URL);
  });

  test.afterAll(async () => {
    await auth.dispose();
  });

  test("successful login returns access_token", async () => {
    const res = await auth.login(standardUser);
    expect(res.access_token).toBeTruthy();
    expect(typeof res.access_token).toBe("string");
  });

  test("login with invalid password fails", async () => {
    await expect(
      auth.login({ ...standardUser, password: "wrong-password" }),
    ).rejects.toThrow(/Login failed/);
  });
});
