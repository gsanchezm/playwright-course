// ============================================================
// 🚩 Reto M06 — Login negativo con persona bloqueada (locked_out_user)
// ============================================================
// OmniPizza NO tiene admin: todas sus personas son `customer` y se
// distinguen por COMPORTAMIENTO de login, no por permisos.
// `locked_out_user` está bloqueado → el login se RECHAZA con el texto
// exacto "Invalid credentials" (un <div> inline SIN role=alert → se
// asserta con page.getByText, NO getByRole("alert")).
//
// Como NO autentica, NO es un setup project con storageState: es un
// test de UI de autenticación fallida. Por eso NO hay badge que guardar.
//
// 🧰 Pre-requisitos:
//   ✔ pnpm test:setup pasa y existe .auth/user.json
//   ✔ pnpm m6 corre en verde (ejemplo autenticado)
//   ✔ Entiendes qué hace `dependencies` + `storageState` por project
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium
//
//   ⚠️ Este spec corre bajo `chromium`, que HEREDA el badge de
//      standard_user (.auth/user.json). Para VER el formulario de login
//      hay que RENUNCIAR a esa sesión con
//      `test.use({ storageState: undefined })` — si no, el test arranca
//      ya autenticado y el login ni siquiera se renderiza.
// ============================================================

import { test, expect } from "@playwright/test";

// ============================================================
// ⚠️ RENUNCIA AL BADGE HEREDADO.
// El project `chromium` declara `storageState: ".auth/user.json"` — o sea,
// arranca con la sesión de standard_user ya cargada. Si no la anulamos,
// la app te lleva directo a /catalog y NUNCA verás el formulario de login
// que queremos probar. `storageState: undefined` lo desactiva SOLO para
// este describe — es el REVERSO del "storageState por project" que
// configuraste en el playwright.config.ts.
// ============================================================
test.describe("Reto M06 — login negativo (locked_out_user)", () => {
  test.use({ storageState: undefined });

  test.skip("TODO — login bloqueado muestra 'Invalid credentials'", async ({
    page,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO 1 — Abrir el login y llenar con locked_out_user
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Abre la app, selecciona el mercado (MX) para ver el formulario y
    //   llena usuario/contraseña con la persona BLOQUEADA (locked_out_user
    //   / pizza123).
    //
    // Pista (los inputs de OmniPizza NO tienen label accesible — su nombre
    //        = el placeholder — así que getByRole/getByLabel FALLAN; usa
    //        testid):
    //   await page.goto("/");
    //   await page.getByTestId("market-MX").click();
    //   await page.getByTestId("username-desktop").fill("locked_out_user");
    //   await page.getByTestId("password-desktop").fill("pizza123");
    //
    // Cómo verificar:
    //   Con --headed ves los dos campos llenos antes de enviar.


    // ────────────────────────────────────────────────────────
    // TODO 2 — Enviar y asertar el rechazo
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Haz clic en "Sign In" (este botón SÍ tiene role) y verifica que el
    //   login se rechaza con el texto EXACTO "Invalid credentials".
    //
    // ⚠️ El error se renderiza en un <div> inline SIN role=alert →
    //    getByRole("alert") NO lo encuentra. Usa getByText:
    //   await page.getByRole("button", { name: "Sign In" }).click();
    //   await expect(page.getByText("Invalid credentials")).toBeVisible();
    //
    // Cómo verificar:
    //   El test pasa y el mensaje aparece en rojo en el formulario.


    // ────────────────────────────────────────────────────────
    // TODO 3 — Confirmar que NO entró a la app
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Un login negativo no solo muestra el error: tampoco debe dejarte
    //   pasar. Verifica que la URL SIGUE en /login (no saltó a /catalog).
    //
    // Pista:
    //   await expect(page).toHaveURL(/\/login/);
    //
    // 💡 Nota conceptual: locked_out_user NUNCA autentica, así que no hay
    //    storageState que guardar — por eso esto es un test de auth fallida,
    //    NO un setup project. El patrón de setup SÍ escala a un 2º rol
    //    AUTENTICADO: copia auth.setup.ts apuntando a una persona que SÍ
    //    entra (problem_user / performance_glitch_user), guarda en
    //    .auth/<persona>.json y declara su project con dependencies:["setup"].
    expect(true).toBe(true);
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. ¿Por qué locked_out_user NO puede ser un setup project con
//      storageState? (Esperado: nunca autentica, así que no hay badge que
//      guardar — es un caso de aserción de error de UI.)
//
//   2. ¿Por qué necesitas `test.use({ storageState: undefined })` aquí y
//      NO en el ejemplo? (Esperado: el ejemplo QUIERE la sesión heredada;
//      este reto necesita VER el login, así que renuncia al badge.)
//
//   3. Si necesitaras un 2º rol AUTENTICADO, ¿cuántos archivos tocarías y
//      cómo evitarías duplicar auth.setup.ts? (Esperado: 2 — un
//      `<persona>.setup.ts` + su project en playwright.config.ts;
//      factoriza el login común en un helper `loginAndSave(user, path)`.)
//
// 👉 En M07 vas a probar la API DIRECTAMENTE (servicios tipados), en vez
//    de manejar la sesión desde el navegador.
// ============================================================
