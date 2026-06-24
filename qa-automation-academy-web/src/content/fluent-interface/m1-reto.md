# 🚩 Reto — Módulo 1: "Hazlo encadenable"

> **Módulo 1 · Fundamentos del encadenamiento**

> **Analogía QA:** ya viste el "antes" (un `await` por acción) y el "después" (una frase fluida). Ahora te toca escribir esa frase tú: el login completo como **una sola cadena** que se lee como user story —"voy al login, elijo mercado MX, entro como standard_user"— y se cierra con un único `await`. Es justo lo que harías al escribir un flujo con un Page Object fluido: encadenas las acciones y dejas que el `await` final las ejecute en orden.

---

## Instrucciones

1. Trabajas sobre `LoginPage`, que **ya** viene en su forma fluida: cada acción (`goto`, `selectMarket`, `loginAs`) devuelve `this`, así que se pueden **encadenar**.
2. Tu única tarea: completar el `// TODO` del spec escribiendo el login como **UNA sola expresión** que encadene las tres acciones y la cierre con **un solo `await`** al frente:

   ```ts
   await loginPage.goto().selectMarket("MX").loginAs(standardUser);
   ```

3. `standardUser` ya viene resuelto en el spec desde `users.json` — solo lo usas en `loginAs(...)`.
4. La **validación fija** `await expect(page).toHaveURL(/\/catalog/)` comprueba que la cadena navegó, eligió mercado, hizo login y llegó al catálogo. No la toques.

> **Regla de oro:** la cadena solo se ejecuta si la haces `await`. Cada acción encola su paso y devuelve `this`; el `await` final **drena la cola** en orden. Sin ese `await` al frente, encolaste acciones que nunca corren y la validación falla en rojo.

---

## Plantilla

```ts
// @file fluent-interface-course/tests/reto-m1.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages";
import type { User } from "../types";
import usersJson from "../data/users.json";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test("Reto M1 — encadena goto + selectMarket + loginAs en una sola expresión", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // ──────────────────────────────────────────────────────────
  // TODO — Escribe el login como UNA sola cadena fluida
  // ──────────────────────────────────────────────────────────
  // Encadena, en esta línea, las tres acciones (cada una devuelve `this`)
  // y ciérrala con UN solo `await`:
  //   goto()  →  selectMarket("MX")  →  loginAs(standardUser)
  //
  //   await loginPage.goto().selectMarket("MX").loginAs(standardUser);
  //
  // (escribe la cadena aquí)

  // ──────────────────────────────────────────────────────────
  // Validación fija (NO la toques) — falla en ROJO hasta que tu cadena
  // navegue, elija mercado, haga login y llegue al catálogo.
  // ──────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/catalog/);
});
```

---

## Cómo correrlo

```bash
$ npx playwright test tests/reto-m1.spec.ts
```

Mientras el `// TODO` esté sin resolver, la página nunca navega al catálogo y `expect(page).toHaveURL(/\/catalog/)` **falla en ROJO**. En cuanto escribas la cadena `await loginPage.goto().selectMarket("MX").loginAs(standardUser);`, el flujo navega, elige mercado, hace login, aterriza en `/catalog` y el test pasa en **VERDE**.

---

## Checklist de auto-corrección

- [ ] Las tres acciones se llaman **encadenadas** en una sola expresión: `loginPage.goto().selectMarket("MX").loginAs(standardUser)`.
- [ ] La expresión completa lleva **un solo `await`** al frente.
- [ ] Usas `standardUser` (el que ya viene resuelto desde `users.json`), no un usuario inventado.
- [ ] **No** tocaste la validación fija `expect(page).toHaveURL(/\/catalog/)`.
- [ ] Al correrlo, el test pasa en **VERDE**: la cadena llegó a `/catalog`.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Cada método (`goto`, `selectMarket`, `loginAs`) devuelve `this`, así que el resultado de uno es el objeto sobre el que llamas el siguiente: `loginPage.goto()` te devuelve `loginPage`, y sobre él llamas `.selectMarket("MX")`, y sobre ese resultado `.loginAs(standardUser)`.
- Todo es **una sola línea**: no pongas un `await` por acción. El encadenamiento construye la cola; un único `await` al frente la ejecuta en orden.
- El argumento de `selectMarket` es el código de mercado `"MX"`; el de `loginAs` es el objeto `standardUser` (no su `username` suelto).
- Si el test queda en rojo y nunca sale del login, lo más probable es que falte el `await` al frente: sin él la cadena se encola pero no corre, y la página jamás llega a `/catalog`.

</details>

---

⬅️ Anterior: [1.2 return this](/docs/fluent-interface/m1-return-this) · ➡️ Siguiente: [Síntesis M1](/docs/fluent-interface/m1-sintesis)
