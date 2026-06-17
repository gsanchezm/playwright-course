// Datos de la Lección interactiva, derivados de una lección REAL basada en pasos:
// playwright/m1-spec.md (TC-001 del smoke de OmniPizza). El código por paso es
// acumulativo (se va construyendo el spec) y `highlight` marca la(s) línea(s)
// nuevas de cada paso. META/cuerpo/pista están destilados de los recuadros
// 🔷/🔍 de esa misma lección.

export type LessonStep = {
  title: string;
  /** Objetivo del paso (callout META). */
  meta: string;
  /** 1–2 párrafos de instrucción (admite `code` inline con backticks). */
  body: string[];
  /** Pista (💡). */
  hint: string;
  /** Código acumulado del archivo hasta este paso. */
  code: string;
  /** Subcadenas que marcan la(s) línea(s) activa(s) del paso. */
  highlight: string[];
};

export const lesson = {
  course: "Playwright",
  courseHref: "/cursos",
  module: "Módulo 1 · Primer smoke",
  logo: "/logos/logo-playwright.png",
  file: "modulo-01-smoke-feo/ejemplo.spec.ts",
  testName: "TC-001 — login exitoso",
  fullLessonHref: "/docs/playwright/m1-spec",
};

const HEAD = `import { test, expect } from "@playwright/test";

const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test("TC-001 — login exitoso @smoke", async ({ page }) => {`;

const STEP1 = `  // Paso 1 — abrir la pantalla de login
  await page.goto("/");`;

const STEP2 = `  // Paso 2 — seleccionar mercado (MX)
  await page.getByTestId("market-MX").click();`;

const STEP3 = `  // Paso 3 — llenar credenciales
  await page.getByTestId("username-desktop").fill(USERNAME);
  await page.getByTestId("password-desktop").fill(PASSWORD);`;

const STEP4 = `  // Paso 4 — enviar formulario
  await page.getByTestId("login-button-desktop").click();

  // Resultado esperado — aterrizar en el catálogo
  await expect(page).toHaveURL(/\\/catalog/);`;

function build(...blocks: string[]): string {
  return `${HEAD}\n\n${blocks.join("\n\n")}\n});`;
}

export const steps: LessonStep[] = [
  {
    title: "Abrir la pantalla de login",
    meta: "Abrir la app en la ruta raíz usando el baseURL del config.",
    body: [
      "`page.goto(\"/\")` se concatena con el `baseURL` de `playwright.config.ts`. Dejar solo `/` mantiene el host en un único lugar.",
      "El día que el frontend cambie de dominio (staging, otro puerto), tocas una línea del config y **todos** los specs siguen funcionando.",
    ],
    hint: "Cada acción y aserción lleva `await`. Sin él, la promesa se dispara pero nadie la espera y el orden real deja de coincidir con el que lees.",
    code: build(STEP1),
    highlight: ["page.goto"],
  },
  {
    title: "Seleccionar el mercado (MX)",
    meta: "Elegir el mercado MX por su test id estable.",
    body: [
      "OmniPizza pide elegir mercado antes del login. Lo localizamos con `getByTestId(\"market-MX\")`.",
      "El **test id** es estable aunque cambie el texto o el idioma del botón — a diferencia de `getByRole(..., { name })`, que depende del copy visible.",
    ],
    hint: "¿Por qué test id y no `getByRole`? El test id no se rompe si el botón pasa de \"Sign In\" a \"Iniciar sesión\".",
    code: build(STEP1, STEP2),
    highlight: ["market-MX"],
  },
  {
    title: "Llenar las credenciales",
    meta: "Escribir usuario y contraseña leídos desde .env.",
    body: [
      "`getByTestId(\"username-desktop\").fill(...)` escribe en el input. Las credenciales vienen de `process.env.*`.",
      "El `?? \"standard_user\"` es solo un **fallback** por seguridad: la fuente real es tu archivo `.env` (que nunca subes al repo).",
    ],
    hint: "Nunca subas tu `.env` al repositorio. El fallback existe por seguridad, no como fuente real de credenciales.",
    code: build(STEP1, STEP2, STEP3),
    highlight: [".fill("],
  },
  {
    title: "Enviar y validar el catálogo",
    meta: "Enviar el formulario y verificar que aterrizas en /catalog.",
    body: [
      "El `click()` envía el formulario y `expect(page).toHaveURL(/\\/catalog/)` afirma el resultado con una regex.",
      "Playwright reintenta la aserción automáticamente (**auto-waiting**): sin `sleep`, espera *lo justo* hasta que la URL cambia o se agota el timeout.",
    ],
    hint: "Una aserción sin `await` puede reportar verde sin haber comprobado nada: un falso positivo silencioso.",
    code: build(STEP1, STEP2, STEP3, STEP4),
    highlight: ["login-button-desktop", "toHaveURL"],
  },
];
