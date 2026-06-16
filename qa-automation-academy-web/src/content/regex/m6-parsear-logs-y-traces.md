# 6.2 — Parsear logs y stack traces

> **Módulo 6 · Regex en pruebas**

> **Analogía QA:** tras una corrida nocturna de CI nadie quiere leer 5000 líneas de log a mano. El regex es tu **grep con bisturí**: extrae el nombre del test que reventó, cuenta cuántos warnings hubo, y descompone cada frame del stack trace en `archivo:línea:columna` para abrirlo directo en el IDE.

---

## ¿Qué aprendes?

- A **extraer** un campo de una línea de log con un grupo de captura.
- A **contar** ocurrencias con la flag `g` y `matchAll`.
- A **parsear** un stack trace en objetos `{ archivo, linea, columna }`.
- Por qué `[^']+` es más robusto que `.*` para leer "hasta el siguiente delimitador".

---

## 1) Extraer el nombre del test fallido

La línea de interés es: `... [ERROR] test 'checkout flow' failed: TimeoutError`. Capturamos lo que está entre comillas simples tras `test `. La pieza clave es `[^']+` ("todo menos comilla"): lee **hasta la siguiente comilla** sin tragarse de más, evitando el `.*` glotón.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/02-parsear-logs-y-traces.ts
const reTestFallido = /test '([^']+)' failed/;
const mFallido = LOG_BLOB.match(reTestFallido);
// .match() devuelve RegExpMatchArray | null → en strict hay que verificar.
const nombreTestFallido = mFallido ? mFallido[1] : null;
check("nombre del test fallido", nombreTestFallido, "checkout flow");
```

> 💡 `.match()` sin flag `g` devuelve `RegExpMatchArray | null`. En TypeScript strict **debes** comprobar el `null` antes de leer `[1]`.

---

## 2) Contar los warnings con `g` + `matchAll`

`matchAll` **exige** la flag `g`; sin ella **lanza `TypeError`**. Por eso este regex es un objeto aparte, con `g`, y no lo pasamos a `checkMatch` (que quita la `g`). `matchAll` devuelve un **iterador**, así que lo volcamos a un array con spread.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/02-parsear-logs-y-traces.ts
const reWarn = /\[WARN\]/g;
const warnings = [...LOG_BLOB.matchAll(reWarn)];
// Hay 2 líneas [WARN] en el blob (retry attempt 2, slow response 1200ms).
check("cantidad de warnings", warnings.length, 2);

// El mismo conteo con match()+g devuelve un array (o null si no hubo).
const warnsAlt = LOG_BLOB.match(reWarn);
check("conteo de warnings vía match()+g", warnsAlt ? warnsAlt.length : 0, 2);
```

> 💡 Dos formas de contar: `matchAll` (iterador, te da grupos e índices) y `match()` con `g` (array plano de coincidencias). Para contar a secas, ambos sirven.

---

## 3) Parsear el stack trace → `archivo:línea:columna`

El `STACK_TRACE` tiene 4 líneas, pero solo 2 son **frames con ubicación** del tipo `archivo.ts:LÍNEA:COLUMNA`. Las otras dos no deben colar:

- `TimeoutError: locator.click: Timeout 15000ms exceeded.` tiene `:` pero **no** el patrón `:\d+:\d+` al final.
- `at runMicrotasks (<anonymous>)` no tiene ubicación.

Capturamos 3 grupos: `(ruta)(línea)(columna)`. La ruta admite letras, dígitos, `/`, `.`, `-` (rutas estilo `pages/CheckoutPage.ts`).

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/02-parsear-logs-y-traces.ts
const reFrame = /([\w./-]+):(\d+):(\d+)/g;

interface Frame {
  archivo: string;
  linea: number;
  columna: number;
}
const frames: Frame[] = [];
for (const m of STACK_TRACE.matchAll(reFrame)) {
  // m[1], m[2], m[3] existen porque el patrón tiene 3 grupos obligatorios.
  frames.push({ archivo: m[1], linea: Number(m[2]), columna: Number(m[3]) });
}

check("número de frames con ubicación", frames.length, 2);
check("frame[0]", frames[0], { archivo: "pages/CheckoutPage.ts", linea: 54, columna: 12 });
check("frame[1]", frames[1], { archivo: "checkout.spec.ts", linea: 42, columna: 9 });
```

El frame más útil para un reporte de bug suele ser el **primero de tu propio código**. Lo formateamos como `ruta:línea:col` (clic directo en el IDE):

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/02-parsear-logs-y-traces.ts
const top = frames[0];
const ubicacion = top ? `${top.archivo}:${top.linea}:${top.columna}` : "desconocida";
check("ubicación clickable del frame superior", ubicacion, "pages/CheckoutPage.ts:54:12");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-regex-en-pruebas/02-parsear-logs-y-traces.ts
```

---

## Qué observar

- `[^delimitador]+` lee "hasta el siguiente delimitador" sin la glotonería de `.*`.
- `matchAll` y `replaceAll` con regex **exigen** la flag `g`, o lanzan `TypeError`.
- Convertir cada coincidencia en un **objeto tipado** (`Frame`) hace que el log se vuelva datos consultables.
- Un patrón específico (`:\d+:\d+`) descarta las líneas que tienen `:` pero no son ubicaciones.

⬅️ Anterior: [6.1 Validar datos de prueba](/docs/regex/m6-validar-datos-de-prueba) · ➡️ Siguiente: [6.3 Scrubbing de snapshots](/docs/regex/m6-scrubbing-de-snapshots)
