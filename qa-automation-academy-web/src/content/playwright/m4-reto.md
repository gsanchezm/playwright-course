# 🚩 Reto M04

## Paso 10 — Resolver el reto

El reto tiene **2 partes** independientes, ambas con TODOs detallados:

1. **Login NEGATIVO con `locked_out_user`.** OmniPizza **no tiene admin**: todas sus personas son `customer` y se distinguen por *comportamiento de login*, no por permisos. `locked_out_user` está bloqueado → el login se **rechaza** con el texto exacto `Invalid credentials`. Llenas el formulario con `getByTestId`, haces clic en **Sign In** y asertas el error con `page.getByText("Invalid credentials")`.
2. **Mock con latencia simulada** usando `page.route()` + `setTimeout` + `route.continue()`, y validar que la UI muestra un skeleton mientras tanto.

Cada TODO sigue **Qué hacer / Pista / Cómo verificar**.

> **Nota para el alumno:** la PARTE A te enseña dos cosas honestas a la vez. **(a)** Un usuario bloqueado **no autentica**, así que **no** es un setup project con `storageState` (no hay badge que guardar): es un **test de UI de autenticación fallida**. **(b)** Este spec corre bajo `ui-chromium`, que ya hereda el badge de `standard_user`; para ver el formulario de login tienes que **renunciar** a esa sesión con `test.use({ storageState: undefined })` — exactamente el mecanismo inverso al `storageState` por project que configuraste en el Paso 3 de la guía.

> El patrón de setup project **sí** escala a un 2º rol, pero solo a personas que **autentican**. Si algún día necesitas un segundo `storageState` autenticado, copia `auth.setup.ts` apuntando a una persona que **sí** entra (`problem_user` o `performance_glitch_user`), guarda en `.auth/<persona>.json` y declara su project con `dependencies: ["setup"]`. `locked_out_user` no sirve para eso justamente porque nunca llega a generar un badge — por eso aquí es un caso de **aserción de error**, no de setup.

---

## Código completo — `reto.spec.ts`

```ts
// @file modulo-04-setup-fixtures/reto.spec.ts
// ============================================================
// 🚩 Reto M04 — Login negativo (persona bloqueada) + mock con latencia
// ============================================================
// Tiene DOS partes independientes:
//
//   PARTE A — Login NEGATIVO con `locked_out_user`:
//     · OmniPizza NO tiene admin: sus personas son todas `customer`
//       y se distinguen por COMPORTAMIENTO de login, no por permisos.
//     · `locked_out_user` está bloqueado → el login se RECHAZA con el
//       texto exacto "Invalid credentials" (un <div> inline SIN
//       role=alert → se asserta con page.getByText, NO getByRole alert).
//     · Como NO autentica, NO es un setup project con storageState:
//       es un test de UI de autenticación fallida.
//
//   PARTE B — Mock con latencia y validar el skeleton/loader:
//     · usar page.route() + setTimeout + route.continue()
//     · validar que el UI muestra el spinner durante la espera
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm test:setup pasa y existe .auth/user.json
//   ✔ pnpm m4 corre en verde
//   ✔ Conoces fixtures/omnipizza.ts y sabes qué hace `dependencies`
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test modulo-04-setup-fixtures/reto.spec.ts --headed --project=ui-chromium
//
//   ⚠️ PARTE A corre bajo `ui-chromium`, que HEREDA el badge de
//      standard_user (.auth/user.json). Para VER el formulario de
//      login hay que renunciar a esa sesión con
//      `test.use({ storageState: undefined })` — si no, el test
//      arranca ya autenticado y el login ni siquiera se renderiza.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

// ============================================================
// PARTE A — Login negativo con persona bloqueada (locked_out_user)
// ============================================================
//
// ⚠️ RENUNCIA AL BADGE HEREDADO.
// Este archivo importa `test` desde ../fixtures/omnipizza y corre bajo
// `ui-chromium`, que declara `storageState: ".auth/user.json"` — o sea,
// arranca con la sesión de standard_user ya cargada. Si no la anulamos,
// la app te lleva directo a /catalog y NUNCA verás el formulario de
// login que queremos probar. `storageState: undefined` lo desactiva
// SOLO para este describe (es el reverso del "storageState por
// project" que configuraste en el paso 3.1 del README).
test.describe("Challenge M04 — PART A: negative login (locked_out_user)", () => {
  test.use({ storageState: undefined });

  test.skip("TODO — blocked login shows 'Invalid credentials'", async ({
    page,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO A1 — Llenar el formulario con locked_out_user
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Navega a /login y llena usuario/contraseña con la persona
    //   bloqueada de data/users.json (locked_out_user / pizza123).
    //
    // Pista (los inputs de OmniPizza NO tienen label accesible — su
    //        nombre = el placeholder — así que getByRole/getByLabel
    //        FALLAN; baja de nivel a testid):
    //   await page.goto("/login");
    //   await page.getByTestId("username-desktop").fill("locked_out_user");
    //   await page.getByTestId("password-desktop").fill("pizza123");
    //
    // Cómo verificar:
    //   Con --headed ves los dos campos llenos antes de enviar.


    // ────────────────────────────────────────────────────────
    // TODO A2 — Enviar y asertar el rechazo
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Haz clic en "Sign In" (este botón SÍ tiene role) y verifica que
    //   el login se rechaza con el texto EXACTO "Invalid credentials".
    //
    // ⚠️ El error se renderiza en un <div> inline SIN role=alert →
    //    getByRole("alert") NO lo encuentra. Usa getByText:
    //   await page.getByTestId("login-button-desktop").click();
    //   await expect(page.getByText("Invalid credentials")).toBeVisible();
    //
    // Cómo verificar:
    //   El test pasa y el mensaje aparece en rojo en el formulario.


    // ────────────────────────────────────────────────────────
    // TODO A3 — Confirmar que NO entró a la app
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Un login negativo no solo muestra el error: tampoco debe dejarte
    //   pasar. Verifica que la URL SIGUE en /login (no saltó a /catalog).
    //
    // Pista:
    //   await expect(page).toHaveURL(/\/login/);
    //
    // 💡 Nota conceptual: locked_out_user NUNCA autentica, así que no hay
    //    storageState que guardar — por eso esto es un test de auth
    //    fallida, NO un setup project. El patrón de setup project (la
    //    PARTE A original montaba un admin INEXISTENTE) sí escala a un
    //    2º rol AUTENTICADO: copia auth.setup.ts apuntando a una persona
    //    que SÍ entra (problem_user / performance_glitch_user), guarda en
    //    .auth/<persona>.json y declara su project con dependencies:["setup"].
    expect(true).toBe(true);
  });
});

// ============================================================
// PARTE B — Mock con latencia simulada
// ============================================================
test.describe("Challenge M04 — PART B: mock with latency @regression", () => {
  test("slow backend response shows skeleton/loader", async ({
    page,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO B1 — Registrar el mock con delay artificial
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Interceptar GET /api/pizzas* y antes de dejar pasar el request
    //   al backend real, esperar 3 segundos. Eso simula un backend lento.
    //
    // Pista (ya viene rellenado abajo; léelo, no lo borres):
    await page.route("**/api/pizzas*", async (route) => {
      await new Promise((r) => setTimeout(r, 3_000));
      await route.continue();
    });

    // ────────────────────────────────────────────────────────
    // TODO B2 — Navegar al catálogo
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   page.goto al catálogo. El mock se va a disparar y vas a tener
    //   ~3s de "loading" hasta que el backend real responda.
    //
    // Pista:
    //   await page.goto("/catalog");


    // ────────────────────────────────────────────────────────
    // TODO B3 — Validar que el skeleton/loader aparece
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   ANTES de que las pizzas reales aparezcan (en los primeros
    //   ~3 segundos), debe ser visible un indicador de carga. Su
    //   testid puede ser `catalog-loading`, `skeleton-card`, etc.
    //
    // Pista (ajusta el testid al DOM real de OmniPizza):
    //   await expect(page.getByTestId("catalog-loading")).toBeVisible();
    //
    // 💡 Si OmniPizza no muestra un skeleton, este reto te enseña algo:
    //    abre un bug. Las cargas largas SIN feedback visual son un
    //    defecto de UX clásico — esa es la conversación QA↔UX.


    // ────────────────────────────────────────────────────────
    // TODO B4 — Validar que tras los 3s, las pizzas aparecen
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Esperar a que aparezcan tarjetas reales de pizza
    //   (el mock dejó pasar el request, así que el backend responde
    //    tarde pero responde).
    //
    // Pista:
    //   const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    //   await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    //
    // Criterio de éxito:
    //   El test pasa. La duración total será ≥ 3s.


    // Placeholder para que el TS compile aunque no hayas terminado.
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. PARTE A — ¿Por qué locked_out_user NO puede ser un setup project
//      con storageState? (Esperado: nunca autentica, así que no hay
//      badge que guardar — es un caso de aserción de error de UI.)
//
//   2. PARTE A — Si necesitaras un 2º rol AUTENTICADO, ¿cuántos archivos
//      tocarías y cómo evitarías duplicar `auth.setup.ts`? (Esperado: 2
//      — un `<persona>.setup.ts` con problem_user/performance_glitch_user
//      + el project en `playwright.config.ts`; factoriza el login común
//      en una función `loginAndSave(user, path)` en `helpers/`.)
//
//   3. PARTE B — Si el mock NO existiera (latencia real del backend),
//      ¿el test sería determinista? (Esperado: NO — el tiempo real
//      varía. Por eso mockeamos.)
//
// 👉 En M05 vas a ver la otra cara de la moneda: en lugar de
//    mockear UI, vas a probar la API DIRECTAMENTE con servicios
//    tipados (BaseService abstracta + factory pattern).
// ============================================================
```
