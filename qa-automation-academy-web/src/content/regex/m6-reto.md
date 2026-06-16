# 🚩 Reto M6 — "Validador data-driven de lote multi-mercado"

> **Módulo 6 · Regex en pruebas**

> **Analogía QA:** OmniPizza recibe un **lote** de pedidos crudos de 4 mercados (MX, US, CH, JP). Algunos están bien, otros traen basura. Tu trabajo es construir el validador que **separe los buenos de los malos**, campo por campo, como el guardia de la puerta de tu suite.

---

## Objetivo

Completar cada regex marcada con `// TODO:` (ahora son `/CAMBIAME/`, que no matchea nada) para que **solo** los pedidos genuinamente válidos pasen **todas** sus validaciones. El validador data-driven ya está escrito: tú solo defines las reglas.

> Es **esperado** que veas ❌ hasta que completes las regex. Razona qué pedidos del lote **deberían** ser válidos: en `LOTE_PEDIDOS`, son los de **MX** y **US**.

---

## Instrucciones

1. Abre `modulo-06-regex-en-pruebas/reto.ts`.
2. Completa cada regex con `// TODO:`. **Debe quedar anclada con `^ ... $`** y ser específica por campo (email, teléfono por mercado, SKU, total).
3. Pistas de formato:
   - El **total** es un número con 2 decimales: `^\d+\.\d{2}$`.
   - El **mercado** debe ser uno de `MX`/`US`/`CH`/`JP` **exactamente**.
   - **Reusa** lo aprendido en 6.1: emails, teléfonos por mercado, SKU.
4. Ejecuta y verifica que **solo** los pedidos de mercados conocidos y con todos los campos bien formados muestren ✅ en todas sus filas.

---

## Plantilla

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/reto.ts
import { checkMatch } from "../helpers/check";
import { LOTE_PEDIDOS, MERCADOS, type Mercado } from "../data/samples";

console.log("\n===== 🚩 Reto 6: Validador data-driven de lote multi-mercado =====");

// TODO (1): mercado válido — debe ser exactamente MX, US, CH o JP.
const reMercado = /CAMBIAME/; // p.ej. /^(MX|US|CH|JP)$/

// TODO (2): email válido (reusa la idea de 6.1: [^@\s]+@... anclado).
const reEmail = /CAMBIAME/;

// TODO (3): teléfono válido POR MERCADO. Cada mercado tiene su formato.
//   MX: +52 55 1234 5678   US: +1 (415) 555-0123
//   CH: +41 44 668 18 00   JP: +81 3-1234-5678
const reTelefonoPorMercado: Record<Mercado, RegExp> = {
  MX: /CAMBIAME/, // TODO
  US: /CAMBIAME/, // TODO
  CH: /CAMBIAME/, // TODO
  JP: /CAMBIAME/, // TODO
};

// TODO (4): SKU de pizza PZ-#### (2 letras may. + guion + 4 dígitos).
const reSku = /CAMBIAME/;

// TODO (5): total = número con 2 decimales (ej. "249.00", "19.99").
const reTotal = /CAMBIAME/;

// ------------------------------------------------------------
// El validador data-driven: recorre el lote y valida campo por campo.
// NO necesitas tocar esta parte; solo completa las regex de arriba.
// ------------------------------------------------------------
function esMercadoConocido(m: string): m is Mercado {
  return m === "MX" || m === "US" || m === "CH" || m === "JP";
}

for (const pedido of LOTE_PEDIDOS) {
  console.log(`\n· Pedido mercado=${pedido.mercado} email=${pedido.email}`);

  checkMatch(reMercado, pedido.mercado, true);
  checkMatch(reEmail, pedido.email, true);
  checkMatch(reSku, pedido.sku, true);
  checkMatch(reTotal, pedido.total, true);

  if (esMercadoConocido(pedido.mercado)) {
    checkMatch(reTelefonoPorMercado[pedido.mercado], pedido.telefono, true);
  } else {
    console.log(`  (mercado "${pedido.mercado}" desconocido en ${Object.keys(MERCADOS).join("/")})`);
  }
}
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-regex-en-pruebas/reto.ts
```

---

## Checklist de auto-corrección

- [ ] **Todas** las regex están ancladas con `^ ... $`.
- [ ] `reMercado` acepta exactamente `MX`/`US`/`CH`/`JP` y nada más (ni `XX`, ni minúsculas).
- [ ] `reEmail` usa `[^@\s]+` (no `\S+`) y exige `\.` + TLD.
- [ ] Cada teléfono por mercado calza **su** formato real (paréntesis en US, guiones en JP, etc.).
- [ ] `reSku` exige exactamente 2 mayúsculas, guion y 4 dígitos.
- [ ] `reTotal` exige `\d+\.\d{2}` anclado (rechaza `"1500"` sin decimales y `"abc"`).
- [ ] Tras completar, **solo** los pedidos MX y US muestran ✅ en todas sus filas.

---

## Pistas (solo si te atoras)

<details>
<summary>Ver pistas</summary>

- Mercado: una **alternancia** anclada con las 4 siglas exactas (las tienes en el `// TODO`).
- Email: vuelve a 6.1 — la clave es `[^@\s]+` (no `\S+`) y exigir `\.` + TLD, todo anclado.
- Teléfonos: ya resolviste los 4 formatos en 6.1; trae cada patrón aquí, uno por mercado, anclado.
- SKU: repasa 6.4 — 2 mayúsculas, guion, 4 dígitos, anclado.
- Total: el formato `^\d+\.\d{2}$` que aparece en las instrucciones — el `"1500"` de JP falla porque le faltan los 2 decimales.
- En el lote, **CH** trae `bad-email@` y **JP** trae `sku: "pz-12"` y `total: "1500"`: esos campos deben fallar.

</details>

---

⬅️ Anterior: [6.5 Replace avanzado](/docs/regex/m6-replace-avanzado) · ➡️ Siguiente: [🧠 Síntesis M6](/docs/regex/m6-sintesis)
