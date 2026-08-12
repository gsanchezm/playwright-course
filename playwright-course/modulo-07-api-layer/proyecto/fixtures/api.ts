// ============================================================
// fixtures/api.ts — Custom fixtures para la capa de API (M07)
// ============================================================
// Analogía QA: extiende el `test` de fixtures/omnipizza.ts (M05) en
// vez de reescribirlo — así los specs de API heredan `standardUser`
// gratis y solo suman lo propio de esta capa: `authService`
// (worker-scoped, un solo APIRequestContext por archivo, como hacía
// el beforeAll/afterAll manual) y `accessToken` (test-scoped, un
// login fresco por TC vía `authService.login(standardUser)`).
// ============================================================

import { test as omnipizzaTest, expect } from "./omnipizza";
import { AuthService } from "../services";

export const API_URL =
  process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

type ApiFixtures = {
  accessToken: string;
};

type ApiWorkerFixtures = {
  authService: AuthService;
};

export const test = omnipizzaTest.extend<ApiFixtures, ApiWorkerFixtures>({
  // eslint-disable-next-line no-empty-pattern
  authService: [
    async ({}, use) => {
      const auth = await AuthService.create(API_URL);
      await use(auth);
      await auth.dispose();
    },
    { scope: "worker" },
  ],

  accessToken: async ({ authService, standardUser }, use) => {
    const { access_token } = await authService.login(standardUser);
    await use(access_token);
  },
});

export { expect };
