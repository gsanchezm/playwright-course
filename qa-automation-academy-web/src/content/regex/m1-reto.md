# 🚩 Reto — Módulo 1: "El primer check"

> **Módulo 1 · Fundamentos**

> **Analogía QA:** tu primera tarea es validar que el nombre de un ambiente de ejecución sea **exactamente** uno de los permitidos. Suena trivial, pero es justo lo que hace un framework al arrancar: rechazar un ambiente mal escrito antes de lanzar la suite.

---

## Instrucciones

1. Tu tarea: validar con `.test()` que el nombre de un ambiente de ejecución sea **exactamente** uno de estos tres: `QA`, `UAT` o `PROD`. Nada más: ni `"qa"` en minúsculas, ni `"PRODUCTION"`, ni `"PROD "` con un espacio sobrante. Solo los tres exactos.
2. Completa la regex marcada con `// TODO:` (ahora es `/CAMBIAME/`, que no matchea nada útil).
3. Ejecuta el archivo y verifica que **las 9 filas** queden en ✅.

> Es **esperado** que veas ❌ hasta que completes la regex: con `/CAMBIAME/`, los 3 ambientes **válidos** saldrán ❌ (no matchean) y los 6 **inválidos** saldrán ✅ (correctamente no matchean). Cuando resuelvas el reto, **todas** las filas deben quedar en ✅: los válidos matchean y los inválidos no.

---

## Plantilla

```ts
// @file regex-qa-course/modulo-01-fundamentos/reto.ts
import { checkMatch } from "../helpers/check";
import { AMBIENTES_VALIDOS, AMBIENTES_INVALIDOS } from "../data/samples";

console.log("\n===== 🚩 Reto 1: El primer check =====");

// TODO: reemplaza /CAMBIAME/ por una regex que matchee EXACTAMENTE
//       "QA", "UAT" o "PROD" (y nada más).
const reAmbiente = /CAMBIAME/; // TODO: completar (ancla inicio/fin + alternancia exacta)

// Casos de prueba (NO los toques): cada VÁLIDO debe matchear (true) y cada
// INVÁLIDO debe ser rechazado (false).
console.log("\n· Ambientes que SÍ deben pasar:");
for (const amb of AMBIENTES_VALIDOS) {
  checkMatch(reAmbiente, amb, true);
}

console.log("\n· Ambientes que NO deben pasar:");
for (const amb of AMBIENTES_INVALIDOS) {
  checkMatch(reAmbiente, amb, false);
}
```

Los datos vienen del archivo compartido `data/samples.ts`:

```ts
// @file regex-qa-course/data/samples.ts
export const AMBIENTES_VALIDOS = ["QA", "UAT", "PROD"] as const;
export const AMBIENTES_INVALIDOS = ["qa", "STAGE", "PRODUCTION", "DEV", "Qa", "PROD "] as const;
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-fundamentos/reto.ts
```

**Objetivo:** cuando tu regex esté lista, las **9 filas** deben mostrar ✅ (los 3 válidos matchean y los 6 inválidos no).

---

## Checklist de auto-corrección

- [ ] La regex **ancla** al inicio y al final, así `"PRODUCTION"` no cuela por contener `"PROD"`.
- [ ] Ofrece **varias opciones exactas** (alternancia): `QA`, `UAT` o `PROD`.
- [ ] Respeta el case: `"qa"` y `"Qa"` quedan rechazados (las regex son case-sensitive por defecto).
- [ ] `"PROD "` (con espacio) queda rechazado: el espacio sobrante no forma parte del ambiente.
- [ ] Al correrlo, las 9 filas muestran ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Necesitas **anclar** el patrón al inicio y al final para exigir que el string **completo** sea el ambiente. ¿Qué metacaracteres anclan inicio y fin? (revisa [1.5](/docs/regex/m1-donde-aparece-en-qa)).
- Necesitas ofrecer **varias opciones exactas**. ¿Qué metacaracter da "esto o aquello"? (lo viste en 1.5 con `@(smoke|regression)`).
- Recuerda que las regex son **case-sensitive** por defecto ([1.1](/docs/regex/m1-que-es-regex)): `"qa"` no debe colar.
- Si tu regex acepta `"PRODUCTION"`, probablemente te falta el ancla de **fin**.

</details>

---

⬅️ Anterior: [1.5 Dónde aparece en QA](/docs/regex/m1-donde-aparece-en-qa) · ➡️ Siguiente: [Síntesis M1](/docs/regex/m1-sintesis)
