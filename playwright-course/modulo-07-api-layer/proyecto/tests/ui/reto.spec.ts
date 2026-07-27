// ============================================================
// 🚩 Reto (heredado de M06) — Login negativo con locked_out_user
// ============================================================
// OmniPizza NO tiene admin: todas sus personas son `customer` y se
// distinguen por COMPORTAMIENTO de login, no por permisos.
// `locked_out_user` está bloqueado → el login se RECHAZA con el texto
// exacto "Invalid credentials" (un <div> inline SIN role=alert → se
// asserta con page.getByText, NO getByRole("alert")).
//
// Como NO autentica, NO es un setup project con storageState: es un
// test de UI de autenticación fallida. Por eso NO hay badge que guardar.
// Sí es el MISMO LoginPage de M04 — el reto negativo no inventa
// locators nuevos, solo lo usa sin esperar a /catalog.
//
// 🧰 Pre-requisitos:
//   ✔ pnpm test:setup pasa y existe .auth/user.json
//   ✔ pnpm test:ui-smoke corre en verde (ejemplo autenticado)
//   ✔ Entiendes qué hace `dependencies` + `storageState` por project
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test tests/ui/reto.spec.ts --headed --project=chromium
//
//   ⚠️ Este spec corre bajo `chromium`, que HEREDA el badge de
//      standard_user (.auth/user.json). Para VER el formulario de login
//      hay que RENUNCIAR a esa sesión con
//      `test.use({ storageState: { cookies: [], origins: [] } })` — si
//      no, el test arranca ya autenticado y el login ni siquiera se
//      renderiza. (⚠️ `storageState: undefined` NO funciona: ver nota
//      abajo del describe.)
// ============================================================

import { test, expect } from "../../fixtures/omnipizza";
import type { User } from "../../types";
import usersJson from "../../data/users.json";

const users = usersJson as User[];
const lockedOutUser = users.find((u) => u.username === "locked_out_user")!;

// ============================================================
// ⚠️ RENUNCIA AL BADGE HEREDADO.
// El project `chromium` declara `storageState: ".auth/user.json"` — o sea,
// arranca con la sesión de standard_user ya cargada. Si no la anulamos,
// la app te lleva directo a /catalog y NUNCA verás el formulario de login
// que queremos probar. `storageState: { cookies: [], origins: [] }` lo
// desactiva SOLO para este describe — es el REVERSO del "storageState por
// project" que configuraste en el playwright.config.ts.
//
// ⚠️ `storageState: undefined` NO funciona aquí: Playwright lo trata como
// "no anular" y la sesión heredada se cuela igual. Hay que pasar un
// storageState VACÍO explícito (`{ cookies: [], origins: [] }`).
// ============================================================
test.describe("Reto (M06) — login negativo (locked_out_user)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.skip("TODO — login bloqueado muestra 'Invalid credentials'", async ({
    page,
    loginPage,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO 1 — Abrir el login y llenar con locked_out_user
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Usa el MISMO LoginPage de M04 (inyectado por el fixture) — pero
    //   con `loginAs`, NO `loginInMarket`: `loginInMarket` espera llegar
    //   a /catalog, y aquí el login debe FALLAR.
    //
    // Pista:
    //   await loginPage.goto();
    //   await loginPage.selectMarket("MX");
    //   await loginPage.loginAs(lockedOutUser);
    //
    // Cómo verificar:
    //   Con --headed ves los dos campos llenos antes de enviar.


    // ────────────────────────────────────────────────────────
    // TODO 2 — Asertar el rechazo
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   `loginAs` ya hizo click en "Sign In". Verifica que el login se
    //   rechaza con el texto EXACTO "Invalid credentials".
    //
    // ⚠️ El error se renderiza en un <div> inline SIN role=alert →
    //    getByRole("alert") NO lo encuentra. Usa getByText:
    //   await expect(page.getByText("Invalid credentials")).toBeVisible();
    //
    // Cómo verificar:
    //   El test pasa y el mensaje aparece en rojo en el formulario.


    // ────────────────────────────────────────────────────────
    // TODO 3 — Confirmar que NO entró a la app
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Un login negativo no solo muestra el error: tampoco debe dejarte
    //   pasar. Verifica que NO llegaste a /catalog.
    //
    // Pista:
    //   await expect(page).not.toHaveURL(/\/catalog/);
    //
    // 💡 Nota conceptual: locked_out_user NUNCA autentica, así que no hay
    //    storageState que guardar — por eso esto es un test de auth fallida,
    //    NO un setup project. El patrón de setup SÍ escala a un 2º rol
    //    AUTENTICADO: copia auth.setup.ts apuntando a una persona que SÍ
    //    entra (problem_user / performance_glitch_user), guarda en
    //    .auth/<persona>.json y declara su project con dependencies:["setup"].
    expect(false, "Reto sin resolver: quita test.skip, completa los TODOs y borra esta línea.").toBe(true);
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
//   2. ¿Por qué necesitas `test.use({ storageState: { cookies: [], origins: [] } })`
//      aquí y NO en el ejemplo? (Esperado: el ejemplo QUIERE la sesión
//      heredada; este reto necesita VER el login, así que renuncia al
//      badge — y `storageState: undefined` NO sirve para eso: Playwright
//      lo trata como "no anular", no como "vaciar".)
//
//   3. Si necesitaras un 2º rol AUTENTICADO, ¿cuántos archivos tocarías y
//      cómo evitarías duplicar auth.setup.ts? (Esperado: 2 — un
//      `<persona>.setup.ts` + su project en playwright.config.ts;
//      factoriza el login común en un helper `loginAndSave(user, path)`.)
//
// 👉 Este mismo módulo (M07) ya prueba la API DIRECTAMENTE con la capa
//    de servicios (`tests/ejemplo.spec.ts`, `tests/api/`) — UI y API
//    conviven en el mismo framework, cada una con su project.
// ============================================================
