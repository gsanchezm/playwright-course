# 6.3 — Scrubbing de snapshots

> **Módulo 6 · Regex en pruebas**

> **Analogía QA:** un snapshot test compara la salida de hoy contra una "foto" guardada. Pero si la salida trae un timestamp, un UUID o un `orderId` que cambian en cada corrida, el snapshot **falla siempre por ruido, no por un bug real** (test *flaky*). El **scrubbing** reemplaza esos datos volátiles por placeholders **estables** (`<TIMESTAMP>`, `<UUID>`, `<ORDER_ID>`) para que la comparación mida lo que importa: la **estructura**, no el ruido.

---

## ¿Qué aprendes?

- Qué es el **scrubbing** y por qué mata los tests intermitentes (*flaky*).
- A escribir un **scrubber**: una función pura que reemplaza datos volátiles por placeholders.
- Por qué todas las regex de scrubbing llevan flag `g`.
- A usar una **función replacer** cuando necesitas numerar las ocurrencias.

---

## Las regex de scrubbing (todas con `g`)

Queremos reemplazar **todas** las ocurrencias en el texto, no solo la primera, así que todas llevan la flag `g`.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/03-scrubbing-de-snapshots.ts
// Timestamp ISO (con o sin milisegundos, terminando en Z).
const reTimestamp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;
// UUID (cualquier versión: aquí solo nos importa enmascararlo, no validarlo).
const reUuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
// orderId formato ORD-####-#### (cuatro dígitos, guion, cuatro dígitos).
const reOrderId = /ORD-\d{4}-\d{4}/g;
```

> 💡 Aquí **no** validamos el UUID (no exigimos versión 4): para enmascarar, basta con reconocer la **forma**. Validar y enmascarar son trabajos distintos.

---

## El scrubber: una función pura

Aplica los tres reemplazos en orden. Al ser pura (entra texto sucio, sale texto estable) es trivial de testear.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/03-scrubbing-de-snapshots.ts
function scrub(texto: string): string {
  return texto
    .replace(reTimestamp, "<TIMESTAMP>")
    .replace(reUuid, "<UUID>")
    .replace(reOrderId, "<ORDER_ID>");
}
```

---

## La prueba reina: dos corridas → mismo resultado

Tomamos **dos snapshots del mismo evento** capturados en corridas distintas. Difieren **solo** en los datos volátiles (otra hora, otro UUID, otro `orderId`). Tras el scrub, deben quedar **idénticos** y coincidir con la salida canónica escrita a mano.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/03-scrubbing-de-snapshots.ts
const snapshotCorridaA =
  "2026-06-16T14:30:01Z [INFO] order ORD-2026-0456 created " +
  "txn=550e8400-e29b-41d4-a716-446655440000 total=249.00 MXN";

const snapshotCorridaB =
  "2026-06-17T09:12:45.987Z [INFO] order ORD-2026-9981 created " +
  "txn=f47ac10b-58cc-4372-a567-0e02b2c3d479 total=249.00 MXN";

// Salida canónica esperada, ESCRITA A MANO (no derivada de la regex).
const ESPERADO =
  "<TIMESTAMP> [INFO] order <ORDER_ID> created txn=<UUID> total=249.00 MXN";

const scrubA = scrub(snapshotCorridaA);
const scrubB = scrub(snapshotCorridaB);

check("snapshot A scrubbeado == canónico", scrubA, ESPERADO);
check("snapshot B scrubbeado == canónico", scrubB, ESPERADO);
// Dos snapshots con datos volátiles DISTINTOS quedan IDÉNTICOS tras el scrub.
check("A y B son idénticos tras scrub", scrubA, scrubB);
```

> 💡 El esperado se escribe **a mano**, no se deriva de la propia regex. Si lo generaras con la misma regex que pruebas, el test pasaría aunque la regex estuviera mal: estarías comparando el código contra sí mismo.

---

## Variante: numerar con una función replacer

A veces quieres **numerar** las ocurrencias para no perder cuántas había (p. ej. `<UUID_1>`, `<UUID_2>`). El 2.º argumento de `replace` puede ser una **función** que se ejecuta por cada coincidencia.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/03-scrubbing-de-snapshots.ts
const conDosUuids =
  "join 550e8400-e29b-41d4-a716-446655440000 with " +
  "f47ac10b-58cc-4372-a567-0e02b2c3d479 done";
let n = 0;
const numerado = conDosUuids.replace(reUuid, () => `<UUID_${++n}>`);
check("replacer numerado de UUIDs", numerado, "join <UUID_1> with <UUID_2> done");
check("se contaron 2 UUIDs", n, 2);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-regex-en-pruebas/03-scrubbing-de-snapshots.ts
```

---

## Qué observar

- El scrubbing **estabiliza** snapshots: mide estructura, no ruido, y mata los tests intermitentes.
- Todas las regex de scrubbing llevan `g` porque hay que reemplazar **todas** las ocurrencias.
- Un scrubber como **función pura** es fácil de testear y reutilizar.
- El esperado canónico se escribe a mano para no comparar la regex contra sí misma.
- Una **función replacer** desbloquea lo que un string fijo no puede: numerar, contar, calcular.

⬅️ Anterior: [6.2 Parsear logs y traces](/docs/regex/m6-parsear-logs-y-traces) · ➡️ Siguiente: [6.4 Validación data-driven](/docs/regex/m6-data-driven-validacion)
