// ============================================================
// 🚩 Reto M07 — Login negativo + SEGUNDO usuario con su propio badge
//               (UI y API)
// ============================================================
// OmniPizza NO tiene roles ni admin: todos sus usuarios son `customer` y se
// distinguen por COMPORTAMIENTO de login, no por permisos. Este reto
// tiene dos partes:
//
//   PARTE A — login NEGATIVO (`locked_out_user`).
//     Nunca autentica → NO hay badge que guardar: es un test de auth
//     fallida, por UI (alerta "Sorry, this user has been locked out.") y
//     por API (403 "locked out"). Es el MISMO LoginPage/AuthService de siempre.
//
//   PARTE B — SEGUNDO USUARIO con SU PROPIO badge (`performance_glitch_user`).
//     Un usuario que SÍ entra con normalidad (verificado en vivo: login
//     limpio, catálogo completo; solo carga más lento). Tú escribes sus
//     setups — uno por UI y uno por API — y un test que prueba que cada
//     badge abre una sesión DE ESE USUARIO, no la de standard_user.
//
// 🧰 Pre-requisitos:
//   ✔ pnpm test:setup-ui y pnpm test:setup-api pasan (existen
//     .auth/user.ui.json y .auth/user.api.json)
//   ✔ pnpm m7 corre en verde (ejemplo autenticado)
//   ✔ Entiendes qué hace `dependencies` + `storageState` por project
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium
//
//   ⚠️ Este spec corre bajo `chromium`, que HEREDA el badge de
//      standard_user (.auth/user.api.json). Por eso cada parte del reto
//      DECLARA qué sesión quiere con `test.use({ storageState })`: vacía
//      en la parte A (para VER el login), la del 2º usuario en la parte B.
//      (⚠️ `storageState: undefined` NO funciona: ver nota abajo.)
// ============================================================

import { test, expect } from "../fixtures/omnipizza";
import { AuthService } from "../services";
import type { User } from "../types";
import usersJson from "../data/users.json";
import { GLITCH_API_FILE, GLITCH_UI_FILE } from "./setup/auth.paths";

const users = usersJson as User[];
const lockedOutUser = users.find((u) => u.username === "locked_out_user")!;
const glitchUser = users.find((u) => u.username === "performance_glitch_user")!;
const API_URL =
  process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

// ============================================================
// PARTE A — Login negativo (locked_out_user)
// ============================================================
// ⚠️ RENUNCIA AL BADGE HEREDADO.
// El project `chromium` declara `storageState: ".auth/user.api.json"` — o sea,
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
test.describe("Reto M07 A — login negativo (locked_out_user)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.skip("TODO A1 — UI: login bloqueado muestra la alerta de usuario bloqueado", async ({
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
    //   rechaza: primero con la aserción que ya trae el POM, luego con el
    //   texto EXACTO que muestra la app (verificado en vivo).
    //
    // Pista:
    //   await loginPage.expectLoginError();
    //   await expect(page.getByRole("alert")).toHaveText(
    //     "Sorry, this user has been locked out.",
    //   );
    //
    // 💡 Es el mismo texto que devuelve la API (error del 403): la UI
    //    solo muestra el mensaje del backend.
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
    expect(false, "Reto sin resolver: quita test.skip, completa los TODOs y borra esta línea.").toBe(true);
  });

  test.skip("TODO A2 — API: login bloqueado responde 403 'locked out'", async () => {
    // ────────────────────────────────────────────────────────
    // TODO 4 — El mismo caso negativo, SIN navegador
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Usa el AuthService de M06 con locked_out_user. `login()` lanza
    //   cuando el backend no responde 2xx, con el status y el body en el
    //   mensaje ("Login failed (403): {...locked out...}").
    //
    // Pista:
    //   const auth = await AuthService.create(API_URL);
    //   await expect(auth.login(lockedOutUser)).rejects.toThrow(
    //     /Login failed \(403\).*locked out/s,
    //   );
    //   await auth.dispose();
    //
    // 💡 Mismo usuario, dos capas: la UI muestra la alerta "Sorry, this user has been locked out.",
    //    y la API devuelve ese mismo mensaje en un 403.
    //    Un 403 en login NO es 401: el usuario SÍ se identificó, pero la
    //    cuenta está bloqueada.
    void AuthService; // quita esta línea cuando uses AuthService en el TODO 4
    void API_URL; // ídem
    void lockedOutUser; // ídem
    expect(false, "Reto sin resolver: quita test.skip, completa los TODOs y borra esta línea.").toBe(true);
  });
});

// ============================================================
// PARTE B — Segundo usuario (performance_glitch_user) con su badge
// ============================================================
// Mismo patrón que los setups de standard_user, otro usuario, otros
// archivos. Los DOS badges de este usuario conviven con los dos de
// standard_user sin pisarse (rutas en tests/setup/auth.paths.ts).
//
// 📁 TODO B0 — ANTES de los tests, crea los setups y regístralos
// ────────────────────────────────────────────────────────────
//  1) tests/setup/auth.glitch.ui.setup.ts
//     Copia `auth.ui.setup.ts`, cambia el usuario por `glitchUser`
//     (búscalo en data/users.json como hace este archivo) y guarda en
//     GLITCH_UI_FILE. performance_glitch_user es ~2.5× más lento (≈5 s vs 2 s): sube
//     `setup.setTimeout` (el de 90_000 ya sobra).
//  2) tests/setup/auth.glitch.api.setup.ts
//     Copia `auth.api.setup.ts`, haz login con `glitchUser`, siembra el
//     MISMO localStorage (el `behavior` ya viene en la respuesta del
//     login) y guarda en GLITCH_API_FILE.
//  3) playwright.config.ts → registra UN project de setup para ambos y
//     hazlo dependencia de `chromium`:
//       { name: "setup-glitch", testMatch: /auth\.glitch\..*\.setup\.ts/ },
//       ...
//       { name: "chromium", ..., dependencies: ["setup-api", "setup-glitch"] },
//     (Los regex de `setup-ui`/`setup-api` NO matchean "auth.glitch.*":
//     cada setup corre en SU project, una sola vez.)
//  Cómo verificar:
//     pnpm exec playwright test --project=setup-glitch
//     → se crean .auth/glitch.ui.json y .auth/glitch.api.json
//  💡 Opcional: tres setups casi idénticos piden un helper común
//     `loginAndSave(user, path)` — refactorízalo cuando funcionen.
// ============================================================
test.describe("Reto M07 B — 2º usuario con su propio badge (performance_glitch_user)", () => {
  test.describe("badge hecho por UI", () => {
    test.use({ storageState: GLITCH_UI_FILE });

    test.skip("TODO B1 — el badge UI abre la sesión de performance_glitch_user", async ({
      page,
      catalogPage,
    }) => {
      // ──────────────────────────────────────────────────────
      // TODO 5 — Aterrizar autenticado COMO el 2º usuario
      // ──────────────────────────────────────────────────────
      // Qué hacer:
      //   Ir directo a /catalog (sin login) y verificar DOS cosas:
      //   1) hay sesión (catálogo con pizzas — el glitch tarda más:
      //      confía en los timeouts de `expect`, no pongas sleeps);
      //   2) la sesión es DE ESE usuario, no la heredada de standard_user.
      //
      // Pista:
      //   await page.goto("/catalog");
      //   await catalogPage.expectLoaded();
      //   await catalogPage.expectHasPizzas();
      //   const username = await page.evaluate(() => localStorage.getItem("username"));
      //   expect(username).toBe(glitchUser.username);
      //
      // 💡 Sin el segundo assert, este test pasaría igual con el badge
      //    equivocado: "hay sesión" no prueba "es la sesión correcta".
      void page;
      void catalogPage;
      void glitchUser;
      expect(false, "Reto sin resolver: quita test.skip, completa los TODOs y borra esta línea.").toBe(true);
    });
  });

  test.describe("badge hecho por API", () => {
    test.use({ storageState: GLITCH_API_FILE });

    test.skip("TODO B2 — el badge API abre la sesión de performance_glitch_user", async ({
      page,
      catalogPage,
    }) => {
      // ──────────────────────────────────────────────────────
      // TODO 6 — Lo mismo con el badge sembrado por API
      // ──────────────────────────────────────────────────────
      // Qué hacer:
      //   Mismo test que el TODO 5, ahora con GLITCH_API_FILE (el
      //   `test.use` de este describe ya lo declara).
      //
      // Pista:
      //   await page.goto("/catalog");
      //   await catalogPage.expectLoaded();
      //   await catalogPage.expectHasPizzas();
      //   const raw = await page.evaluate(() => localStorage.getItem("omnipizza-auth"));
      //   expect(JSON.parse(raw!).state.username).toBe(glitchUser.username);
      //
      // 💡 Aquí lees el store `omnipizza-auth` (el que la app consulta
      //    para saber si hay sesión) en vez de la clave suelta `username`:
      //    comprueba que el setup API sembró lo MISMO que el SPA escribe.
      void page;
      void catalogPage;
      void glitchUser;
      expect(false, "Reto sin resolver: quita test.skip, completa los TODOs y borra esta línea.").toBe(true);
    });
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. ¿Por qué locked_out_user NO puede ser un setup project con
//      storageState? (Esperado: nunca autentica, así que no hay badge que
//      guardar — es un caso de aserción de error, en UI y en API.)
//
//   2. ¿Por qué necesitas `test.use({ storageState: { cookies: [], origins: [] } })`
//      en la parte A y NO en el ejemplo? (Esperado: el ejemplo QUIERE la
//      sesión heredada; la parte A necesita VER el login, así que renuncia
//      al badge — y `storageState: undefined` NO sirve: Playwright lo
//      trata como "no anular", no como "vaciar".)
//
//   3. Un segundo usuario, ¿cuántos archivos tocaste? (Esperado: 3 — dos
//      setups + el project en playwright.config.ts; el test solo cambia
//      de badge con `test.use`.) ¿Y un tercero? Si copias de nuevo, es
//      la señal para factorizar `loginAndSave(user, path)`.
//
//   4. ¿Por qué el test del 2º usuario asserta el USERNAME y no solo que
//      el catálogo cargue? (Esperado: un badge equivocado también carga
//      el catálogo; solo la identidad prueba que usaste el badge correcto.)
//
// 👉 En M08 llevas todo esto a CI/CD: los setups corren en el pipeline,
//    sobre varios browsers en paralelo, con traces descargables.
// ============================================================
