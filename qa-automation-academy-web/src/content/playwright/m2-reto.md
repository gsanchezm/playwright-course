# 🚩 Reto M02

## Paso 7 — Resolver el reto

Abre `reto.spec.ts`. La meta es **localizar 3 elementos del catálogo con el nivel correcto de la jerarquía**. Para cada elemento eliges el nivel **MÁS ALTO** que funcione (`role` → `testid` → CSS), no el primero que se te ocurra:

1. **El buscador** → NIVEL 1 (`getByRole`, es un `textbox`). El catálogo está bien instrumentado: no bajes a testid ni a CSS aquí.
2. **Una pizza concreta** → NIVEL 1 + filtro (`getByRole("heading", { level: 3 }).filter({ hasText })`) — de "muchos" a "uno" sin CSS.
3. **El botón add-to-cart (icon-only)** → NIVEL 4 (CSS de prefijo) + **scoping** dentro de su card.

Todos los selectores que necesitas están en la **chuleta viva** del `test.describe("Reference — locator hierarchy")` de `ejemplo.spec.ts` (los dos `test.skip`). Cópialos de ahí. Cada TODO trae **Qué hacer / Pista / Cómo verificar**.

---

## Código completo — `reto.spec.ts`

```ts
// @file modulo-02-locators/reto.spec.ts
// ============================================================
// 🚩 Reto M02 — Localiza 3 elementos con el NIVEL correcto
// ============================================================
// Objetivo pedagógico: aplicar la JERARQUÍA de locators a
// conciencia. Para cada elemento tienes que elegir el nivel
// MÁS ALTO que funcione (role → testid → CSS), no el primero
// que se te ocurra. El catálogo de OmniPizza está bien
// instrumentado, así que casi todo vive en getByRole; sólo las
// cards (testids dinámicos) te obligan a bajar a CSS.
//
// Todos los selectores que necesitas están en la CHULETA viva
// del `test.describe("Reference — locator hierarchy")` de
// `ejemplo.spec.ts` (los dos `test.skip`). Cópialos de ahí.
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm m2 corre en verde el smoke de un mercado (ejemplo.spec.ts).
//   ✔ Tienes a mano la chuleta de locators de `ejemplo.spec.ts`.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test modulo-02-locators/reto.spec.ts --headed --project=ui-anon
//
//   (o con UI mode:)
//   pnpm test:ui
// ============================================================

import { test, expect } from "@playwright/test";

// Credenciales leídas de .env (dotenv en playwright.config.ts).
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Challenge M02 — locator hierarchy in the catalog", () => {
  test("Challenge — locate 3 catalog elements with the right level @locators", async ({
    page,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO 1 — Login en el mercado MX (para llegar al catálogo)
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Replicar el bloque de login de `ejemplo.spec.ts`: goto,
    //   click en la bandera MX, fill de username/password, click
    //   en "Sign In", y aserción de que la URL contiene "/catalog".
    //
    // Pista (fíjate en el NIVEL de cada locator):
    //   await page.goto("/");
    //   await page.getByTestId("market-MX").click();                 // testid: bandera icon-only
    //   await page.getByTestId("username-desktop").fill(USERNAME);   // testid: input sin label
    //   await page.getByTestId("password-desktop").fill(PASSWORD);   // testid: input sin label
    //   await page.getByRole("button", { name: "Sign In" }).click(); // role: el botón SÍ coopera
    //   await expect(page).toHaveURL(/\/catalog/);
    //
    // Cómo verificar (UI mode):
    //   Aterrizas en el grid de pizzas de /catalog.


    // ────────────────────────────────────────────────────────
    // TODO 2 — Elemento 1 (NIVEL 1: getByRole) → el buscador
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Localizar la caja de búsqueda del catálogo por su ROL
    //   (es un textbox) y aseverar que está visible. El catálogo
    //   está bien instrumentado: NO bajes a testid ni a CSS aquí.
    //
    // Pista:
    //   const searchBox = page.getByRole("textbox", { name: "Busca tu pizza favorita..." });
    //   await expect(searchBox).toBeVisible();
    //
    // Cómo verificar:
    //   La aserción pasa; en UI mode el buscador queda resaltado.


    // ────────────────────────────────────────────────────────
    // TODO 3 — Elemento 2 (NIVEL 1 + filtro): UNA pizza concreta
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   1) Localizar TODOS los headings de pizza por rol
    //      (getByRole "heading", level: 3) → es un "locator de muchos".
    //   2) Aseverar que hay más de 0 (usa .count()).
    //   3) ESTRECHAR a una sola pizza con .filter({ hasText: ... })
    //      (elige un nombre que exista en el catálogo, p.ej. "Pepperoni")
    //      y aseverar que esa está visible.
    //
    // Pista:
    //   const headings = page.getByRole("heading", { level: 3 });
    //   expect(await headings.count()).toBeGreaterThan(0);
    //   const pepperoni = headings.filter({ hasText: "Pepperoni" });
    //   await expect(pepperoni).toBeVisible();
    //
    // Cómo verificar:
    //   Del "muchos" (todas las pizzas) pasaste a "exactamente esta"
    //   SIN bajar a un CSS frágil: sólo role + filtro.


    // ────────────────────────────────────────────────────────
    // TODO 4 — Elemento 3 (NIVEL 4: CSS) + scoping
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Las cards tienen testids DINÁMICOS (pizza-card-123, ...),
    //   así que el nivel correcto es CSS con prefijo `^=`.
    //   1) Localizar las cards con [data-testid^="pizza-card-"].
    //   2) Aseverar que hay más de 0.
    //   3) SCOPING: acotar a una card por su texto (.filter) y,
    //      DENTRO de ese scope, localizar su botón (add-to-cart
    //      icon-only) con card.getByRole("button"); aseverar visible.
    //
    // Pista:
    //   const cards = page.locator('[data-testid^="pizza-card-"]');
    //   expect(await cards.count()).toBeGreaterThan(0);
    //   const card = cards.filter({ hasText: "Pepperoni" });
    //   await expect(card.getByRole("button").first()).toBeVisible();
    //
    // Cómo verificar:
    //   El botón icon-only queda inequívoco NO por un selector más
    //   feo, sino por CONTEXTO (buscarlo dentro de su card).


    expect(true).toBe(true); // placeholder — quítalo cuando termines los TODOs
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. De los 3 elementos, ¿cuántos resolviste con getByRole y
//      cuántos te obligaron a bajar de nivel? ¿Por qué?
//      (Esperado: el buscador y la pizza con role; las cards con
//       CSS porque sus testids son dinámicos.)
//
//   2. En el TODO 3 pasaste de "muchos" a "uno" con .filter en vez
//      de un CSS posicional (nth-child). ¿Qué se rompería si en su
//      lugar usaras `.nth(2)` y el catálogo reordena las pizzas?
//
//   3. En el TODO 4, ¿por qué card.getByRole("button") es más
//      robusto que un getByRole("button") global de la página?
//      (Pista: scoping = desambiguar por contexto, no por un
//       selector más frágil.)
//
// 👉 En M03 vas a reutilizar este mismo catálogo, pero
//    parametrizando el smoke por los 4 mercados con datos tipados
//    (data/ + types/ + for...of). Los locators no cambian; cambia
//    de dónde salen los DATOS.
// ============================================================
```

---

## Paso 8 — Versiona tu trabajo (Git JIT)

Cuando el reto quede en verde, agrega **solo lo que cambió en este módulo** y commitéalo con un mensaje convencional:

```bash
git add modulo-02-locators
git commit -m "feat(m02): jerarquía de locators + chuleta de referencia"
```

M02 introduce la disciplina de locators y la chuleta viva del módulo. Versionarla en un commit atómico deja un punto de retorno limpio **antes** de que M03 empiece a parametrizar con datos tipados. (Aquí Git es JIT: commit al cerrar; las ramas y el push llegan cuando el flujo los pida.)

**Cómo verificas:**

```bash
git log --oneline -1        # muestra el commit feat(m02) recién creado
git status                  # working tree limpio para lo que tocaste
```
