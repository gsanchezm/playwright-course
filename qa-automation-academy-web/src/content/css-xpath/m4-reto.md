# 🚩 Reto — Módulo 4: "Ancla por hook de prueba"

> **Módulo 4 · XPath Fundamentos**

> **Analogía QA:** en QA el ancla más estable casi nunca es la clase visual: es el `data-testid` que el equipo puso a propósito. Tu primera tarea de XPath es exactamente esa — escribir un selector que apunte a **un** elemento por su hook de prueba, ni uno más.

---

## Instrucciones

1. Tu tarea: escribir **un** XPath con **predicado de atributo** (`@data-testid`) que seleccione **exactamente uno** de estos dos targets (elige uno):
   - el botón **"Sign In"** → `@data-testid='login-button-desktop'`
   - la card **agotada** (`pizza-card-103`) → `@data-testid='pizza-card-103'`
2. Reemplaza el placeholder `"CAMBIAME"` por tu XPath. Debe usar `[@data-testid='...']` y matchear **exactamente 1** nodo.
3. Ejecuta el archivo y verifica que el check quede en ✅ (1 nodo).

> Es **esperado** que veas ❌ hasta que completes el XPath: `"CAMBIAME"` no es una expresión de atributo y devuelve 0 matches. Cuando lo resuelvas, el check debe quedar en ✅ (exactamente 1 nodo).

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/reto.ts
import { countXpath } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 4: Ancla por hook de prueba =====");

// TODO: reemplaza "CAMBIAME" por un XPath con predicado @data-testid que
//       seleccione EXACTAMENTE 1 nodo (el botón Sign In o la card agotada).
const miXpath = "CAMBIAME"; // TODO: p.ej. //button[@data-testid='...']  ó  //*[@data-testid='...']

// Caso de prueba (NO lo toques): tu XPath debe matchear exactamente 1 nodo.
check(`mi XPath selecciona exactamente 1 nodo  ·  ${miXpath}`, countXpath(miXpath), 1);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-xpath-fundamentos/reto.ts
```

**Objetivo:** cuando tu XPath esté listo, el check muestra ✅ (1 nodo). Con `"CAMBIAME"` verás ❌ porque devuelve 0.

---

## Checklist de auto-corrección

- [ ] Tu XPath empieza con `//` (relativo) y nombra una etiqueta (`button`, `article`) o el comodín `*`.
- [ ] Usa un **predicado de atributo**: `[@data-testid='...']`.
- [ ] El valor del `data-testid` es **exactamente** `login-button-desktop` **o** `pizza-card-103`.
- [ ] No usaste `@class`: con multi-clase fallarías (lo viste en 4.4).
- [ ] Al correrlo, el conteo es **1** (ni 0 ni 2) y el check sale ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- El esqueleto es `//ETIQUETA[@data-testid='VALOR']`. Para el botón: `ETIQUETA = button`, `VALOR = login-button-desktop`.
- Para la card agotada puedes usar `article` o el comodín `*`: `//*[@data-testid='pizza-card-103']`.
- `@data-testid` es **exacto y único** ([4.4](/docs/css-xpath/m4-atributos)); por eso da 1 limpio, a diferencia de `@class`.
- Si te da 0, revisa las comillas: el valor va entre comillas simples **dentro** del predicado.

</details>

---

## ⭐ Bonus (en un navegador, no en el companion)

Abre la app real, abre DevTools y ejecuta en la consola `$x("(//li)[1]")` y luego `$x("//li[1]")`. Observa que `(//li)[1]` es "el primer `<li>` **global**" mientras `//li[1]` es "el primero de **cada** padre". Recuerda: jsdom **no** reproduce los paréntesis (los evalúa como `//li[1]`); el navegador, Playwright y Selenium **sí**.

---

⬅️ Anterior: [4.5 XPath en herramientas](/docs/css-xpath/m4-xpath-en-herramientas) · ➡️ Siguiente: [Síntesis M4](/docs/css-xpath/m4-sintesis)
