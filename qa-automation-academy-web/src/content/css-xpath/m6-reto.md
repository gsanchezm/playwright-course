# 🚩 Reto — Módulo 6: "Ancla y navega"

> **Módulo 6 · XPath Ejes**

> **Analogía QA:** tu tarea es localizar la **tarjeta completa** de una pizza partiendo solo de su **nombre** visible en pantalla. Es justo lo que haces a diario con Playwright: ves el texto "Cuatro Quesos", pero el elemento que quieres accionar (la tarjeta, su botón) está más arriba. Anclas en lo estable y subes por eje.

---

## Instrucciones

1. Tu tarea: escribir **un** XPath que, anclando en el nombre de la pizza **"Cuatro Quesos"**, navegue **por eje** hasta su `<article>` contenedor (la tarjeta completa). Debe matchear **exactamente 1** elemento: la tarjeta `pizza-card-102`.
2. Completa la expresión marcada con `// TODO:` (ahora es `//CAMBIAME`, un XPath válido que matchea **0** elementos).
3. Ejecuta el archivo y verifica que **las 2 filas** queden en ✅.

> Es **esperado** que veas ❌ hasta que completes el XPath: con `//CAMBIAME` la expresión matchea 0 elementos y el check de "= 1 tarjeta" sale ❌. Cuando lo resuelvas, **ambas** filas deben quedar en ✅: matchea 1 elemento y es la tarjeta 102.

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/reto.ts
import { countXpath, $x, attr } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 6: Ancla y navega =====");

// TODO: reemplaza `//CAMBIAME` por un XPath que ancle en el nombre
//       "Cuatro Quesos" y suba por eje hasta su <article> (la tarjeta 102).
const xpathTarjeta = `//CAMBIAME`; // TODO: completar (ancla por texto + eje hacia arriba)

// Casos de prueba (NO los toques): debe matchear EXACTAMENTE la tarjeta 102.
check("matchea EXACTAMENTE 1 elemento", countXpath(xpathTarjeta), 1);
const encontrado = $x(xpathTarjeta)[0] as Element | undefined;
check("ese elemento es la tarjeta pizza-card-102", attr(encontrado, "data-testid"), "pizza-card-102");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-xpath-ejes/reto.ts
```

**Objetivo:** cuando tu XPath esté listo, las **2 filas** deben mostrar ✅ (matchea 1 elemento y es la tarjeta 102).

---

## Checklist de auto-corrección

- [ ] **Anclas** por el **texto limpio** del nombre, con `normalize-space()` (no `text()` crudo).
- [ ] Subes por el **eje correcto**: `ancestor::article` (cualquier nivel) — o `parent::article` / `..`, que aquí coinciden porque el `<h3>` es hijo directo del `<article>`.
- [ ] El resultado matchea **exactamente 1** elemento, no 0 ni varios.
- [ ] Ese elemento tiene `data-testid="pizza-card-102"`.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- ¿Cómo comparas el **texto limpio** de un elemento para anclar? Revisa [6.2](/docs/css-xpath/m6-padre-ancestro) (`normalize-space()`).
- ¿Qué eje **sube** desde el `<h3>` hasta cualquier contenedor del tipo que buscas? `ancestor::` ([6.2](/docs/css-xpath/m6-padre-ancestro)).
- El contenedor accionable es la **tarjeta**: un `<article>`.
- **Bonus:** cambia el destino del salto para llegar al **botón** add-to-cart de esa tarjeta en vez del article (pista: `following-sibling::button`, ya que en la tarjeta el `<h3>` y el botón son hermanos).

</details>

---

⬅️ Anterior: [6.5 El patrón ancla-y-navega](/docs/css-xpath/m6-ancla-y-navega) · ➡️ Siguiente: [Síntesis M6](/docs/css-xpath/m6-sintesis)
