# 🚩 Reto — Módulo 2: "Encola, drena, lee"

> **Módulo 2 · El motor: cola thenable**

> **Analogía QA:** un buen tester no sólo ejecuta el caso — **predice** qué va a pasar antes de correrlo. Tu reto es justo eso: razonar el **orden de ejecución** de una cadena (¿qué corre primero, qué se encola, qué dispara la cola?) y cerrar con una **query** que lee datos del catálogo. Si tu predicción es correcta, el test queda en verde.

---

## Instrucciones

1. Vas a completar el spec **ya shipeado** en `fluent-interface-course/tests/reto-m2.spec.ts`. Tiene **dos `// TODO`**.
2. **TODO 1 — drena la cadena:** hay una cadena de acciones encoladas sobre `loginPage` (goto + credenciales + mercado + login). Está construida en la variable `cadena` pero **sin ejecutar**. Tu trabajo es **drenarla** con un `await`.
3. **TODO 2 — usa una query terminal:** llama a `getPizzaNames()` del `catalogPage` para obtener la lista de nombres y guárdala en `names`.
4. Las assertions de abajo (Playwright `expect`) **NO se tocan**: verifican que la cadena corrió en orden (terminaste en `/catalog`) y que la query devolvió datos reales.
5. Corre el test y verifica que pase en **verde**.

> Es **esperado** que el test falle mientras los `// TODO` estén sin completar: sin el `await` de TODO 1, la cadena nunca se ejecuta y nunca llegas a `/catalog`; sin TODO 2, `names` queda vacío y el `expect(names.length)` falla. Cuando completes ambos, el test pasa.

---

## Plantilla

```ts
// @file fluent-interface-course/tests/reto-m2.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { User } from "../types";
import usersJson from "../data/users.json";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test("Reto M2 — encola, drena y lee el catálogo", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const catalogPage = new CatalogPage(page);

  // La cadena se CONSTRUYE aquí: cada método encola su trabajo y devuelve
  // `this`. Tras esta expresión hay 5 tareas en la fila... pero NADA ha
  // corrido todavía: falta drenar la cola.
  const cadena = loginPage
    .goto()
    .withUsername(standardUser.username)
    .withPassword(standardUser.password)
    .andMarket("MX")
    .login();

  // ──────────────────────────────────────────────────────────
  // TODO 1 — Drena la cadena con un `await`. Sin esto, el login
  //   nunca ocurre (la cola queda apuntada pero no se ejecuta).
  //   await cadena;
  // ──────────────────────────────────────────────────────────
  // (escribe el await aquí)

  // Espera a que el catálogo cargue (acción encolada + await).
  await catalogPage.waitForCatalog();

  // ──────────────────────────────────────────────────────────
  // TODO 2 — Usa la query terminal getPizzaNames(): DRENA la cola y
  //   devuelve string[] (es terminal, no encadenable). Guárdala en `names`.
  //   const names = await catalogPage.getPizzaNames();
  // ──────────────────────────────────────────────────────────
  const names: string[] = []; // <- reemplaza por: await catalogPage.getPizzaNames();

  // ──────────────────────────────────────────────────────────
  // Validaciones (NO las toques) — fallan en ROJO hasta que drenes la
  // cadena (TODO 1) y leas los nombres reales (TODO 2).
  // ──────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/catalog/);
  expect(names.length).toBeGreaterThan(0);
  expect(names.every((n) => n.trim().length > 0)).toBe(true);
});
```

---

## Cómo correrlo

> El spec ya está en el repo. Resuelve los **2 TODO** directamente sobre el archivo y córrelo:

```bash
$ npx playwright test tests/reto-m2.spec.ts
```

**Falla en ROJO** mientras los `// TODO` estén sin completar: sin el `await` de TODO 1 la cadena nunca se ejecuta (no llegas a `/catalog`), y sin TODO 2 `names` queda vacío. **Pasa en VERDE** cuando completes ambos: terminas en `/catalog` y `names` trae los nombres reales de las pizzas.

---

## Checklist de auto-corrección

- [ ] **TODO 1:** hiciste `await cadena;` (o `await loginPage...login();` directo). La cadena se **drena**, no sólo se construye.
- [ ] Entiendes que **sin** ese `await` la cola queda apuntada pero **nunca se ejecuta** — el test "pasaría" sin tocar la app si no fuera por las assertions.
- [ ] **TODO 2:** `names = await catalogPage.getPizzaNames();` — una **query terminal** que devuelve `string[]`.
- [ ] No intentaste encadenar nada **después** de `getPizzaNames()` (es terminal: devuelve datos, no `this`).
- [ ] El test termina en verde: `toHaveURL(/\/catalog/)` y `names.length > 0`.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- **TODO 1:** `cadena` ya es el Page con su cola encolada. El Page es *awaitable* (implementa `then`), así que `await cadena;` drena la fila en orden. Lo viste en [2.2](/docs/fluent-interface/m2-then-awaitable). Sin el `await`, el `goto/login` nunca corre.
- ¿Por qué la cadena no se ejecutó al construirse? Porque cada método (`goto`, `withUsername`...) sólo **encola** vía `step()` y devuelve `this` — no ejecuta. La ejecución la dispara el `await`. Repaso en [2.1](/docs/fluent-interface/m2-la-cola-y-step).
- **TODO 2:** `getPizzaNames()` es una **query** (drena la cola y devuelve `string[]`). Como devuelve datos, llévala con `await` y guárdala: `const names = await catalogPage.getPizzaNames();`. Lo viste en [2.3](/docs/fluent-interface/m2-query-terminal).
- Si tu IDE marca error al intentar `catalogPage.getPizzaNames().selectCategory(...)`, es la prueba de que la query es **terminal**: un `string[]` no tiene métodos del Page.

</details>

---

⬅️ Anterior: [2.3 query(): operaciones terminales](/docs/fluent-interface/m2-query-terminal) · ➡️ Siguiente: [Síntesis M2](/docs/fluent-interface/m2-sintesis)
