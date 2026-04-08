import { test, expect, type ConsoleMessage } from "@playwright/test";

test.describe("Home — smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero: headline y CTAs principales visibles", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Aprende automatización");
    await expect(h1).toContainText("Playwright");

    const exploreCta = page.getByRole("link", { name: "Explorar ejercicios" });
    await expect(exploreCta).toBeVisible();
    await expect(exploreCta).toHaveAttribute("href", "#rutas");

    const repoCta = page.getByRole("link", { name: "Ver el repo" });
    await expect(repoCta).toBeVisible();
    await expect(repoCta).toHaveAttribute("target", "_blank");
    const href = await repoCta.getAttribute("href");
    expect(href).toMatch(/^https:\/\/github\.com\//);
  });

  test("header: navegación a secciones ancla", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(nav).toBeVisible();

    // Rutas
    await nav.getByRole("link", { name: "Rutas" }).click();
    await expect(page.locator("#rutas")).toBeInViewport();

    // Metodología
    await nav.getByRole("link", { name: "Metodología" }).click();
    await expect(page.locator("#metodologia")).toBeInViewport();

    // Highlights
    await nav.getByRole("link", { name: "Highlights" }).click();
    await expect(page.locator("#highlights")).toBeInViewport();
  });

  test("rutas: tres cards con títulos esperados", async ({ page }) => {
    const rutas = page.locator("#rutas");
    await expect(
      rutas.getByRole("heading", { level: 3, name: "TypeScript para QA" })
    ).toBeVisible();
    await expect(
      rutas.getByRole("heading", {
        level: 3,
        name: "Git y GitHub para testers",
      })
    ).toBeVisible();
    await expect(
      rutas.getByRole("heading", {
        level: 3,
        name: "Playwright para automatización web",
      })
    ).toBeVisible();

    const articles = rutas.locator("article");
    await expect(articles).toHaveCount(3);
  });

  test("rutas: las 3 rutas están en estado Live", async ({ page }) => {
    const rutas = page.locator("#rutas");
    const liveCount = await rutas.getByText("Live", { exact: false }).count();
    expect(liveCount).toBeGreaterThanOrEqual(3);
  });

  test("code showcase: switching de tabs cambia contenido", async ({ page }) => {
    const region = page.getByRole("region", {
      name: "Ejemplos de código de aprendizaje",
    });
    await expect(region).toBeVisible();

    // Tab Setup: comandos de instalación
    await region.getByRole("tab", { name: "Setup" }).click();
    await expect(region).toContainText("brew install node@20");
    await expect(region).toContainText("playwright install");

    // Tab TypeScript: tipo BugReport real del curso
    await region.getByRole("tab", { name: "TypeScript" }).click();
    await expect(region).toContainText("BugReport");
    await expect(region).toContainText("CRITICAL");

    // Tab Git/GitHub: feature branch flow real
    await region.getByRole("tab", { name: "Git/GitHub" }).click();
    await expect(region).toContainText("feature/add-cart-tests");
    await expect(region).toContainText("gh pr create");

    // Tab Playwright: hello.spec.ts real
    await region.getByRole("tab", { name: "Playwright" }).click();
    await expect(region).toContainText("@playwright/test");
    await expect(region).toContainText("getByRole");
  });

  test("metodología: heading y mini-steps visibles", async ({ page }) => {
    const section = page.locator("#metodologia");
    await expect(
      section.getByRole("heading", {
        level: 2,
        name: "Práctica primero, teoría justa.",
      })
    ).toBeVisible();

    const items = section.locator("ol > li");
    expect(await items.count()).toBeGreaterThanOrEqual(5);
  });

  test("highlights: heading y 4 cards", async ({ page }) => {
    const section = page.locator("#highlights");
    await expect(
      section.getByRole("heading", {
        level: 2,
        name: "Una academia pensada para ejecutarse en tu terminal.",
      })
    ).toBeVisible();

    await expect(section.locator("article")).toHaveCount(4);
  });

  test("consola limpia: sin pageerror ni console.error críticos", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignora errores de recursos opcionales (favicon, etc)
        if (/favicon|Failed to load resource/i.test(text)) return;
        errors.push(`console.error: ${text}`);
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });
    // Interactúa para forzar render de estados
    await page
      .getByRole("region", { name: "Ejemplos de código de aprendizaje" })
      .getByRole("tab", { name: "Playwright" })
      .click();

    expect(errors).toEqual([]);
  });
});
