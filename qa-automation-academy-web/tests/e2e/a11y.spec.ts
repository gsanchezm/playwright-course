import { test, expect } from "@playwright/test";

test.describe("Accesibilidad estructural — smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("landmarks: header, main, footer y nav presentes", async ({ page }) => {
    expect(await page.locator("header").count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator("main")).toHaveCount(1);
    expect(await page.locator("footer").count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByRole("navigation").first()).toBeVisible();
  });

  test("headings: un h1 y varios h2", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const h2Count = await page.getByRole("heading", { level: 2 }).count();
    expect(h2Count).toBeGreaterThanOrEqual(3);
  });

  test("links externos usan rel noopener", async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const rel = (await link.getAttribute("rel")) ?? "";
      expect(
        rel,
        `link #${i} target=_blank debe incluir rel="noopener"`
      ).toContain("noopener");
    }
  });

  test("links y botones tienen nombre accesible", async ({ page }) => {
    const interactive = page.locator("a, button");
    const count = await interactive.count();

    for (let i = 0; i < count; i++) {
      const el = interactive.nth(i);
      const text = (await el.innerText().catch(() => "")).trim();
      const ariaLabel = (await el.getAttribute("aria-label")) ?? "";
      const ariaLabelledBy = (await el.getAttribute("aria-labelledby")) ?? "";
      const title = (await el.getAttribute("title")) ?? "";

      const hasName =
        text.length > 0 ||
        ariaLabel.length > 0 ||
        ariaLabelledBy.length > 0 ||
        title.length > 0;

      expect(
        hasName,
        `Elemento interactivo #${i} sin nombre accesible`
      ).toBeTruthy();
    }
  });
});
