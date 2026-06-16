# 3.2 — Captura `(...)` vs no-captura `(?:...)`

> **Módulo 3 · Grupos, captura y alternancia**

> **Analogía QA:** en un reporte de bug no anotas TODO lo que viste, solo los datos que vas a usar (pasos, resultado esperado). El grupo de captura `(...)` "anota" lo que matcheó en un índice; el grupo de no-captura `(?:...)` solo agrupa para la lógica pero NO ocupa una casilla. Si llenas tu match de grupos que no usas, los ÍNDICES se recorren y tu `m[2]` deja de ser lo que creías: un clásico bug silencioso de parseo.

---

## ¿Qué aprendes?

- Cuándo necesitas agrupar pero **no** quieres capturar.
- Cómo `(?:...)` mantiene la numeración de tus grupos estable.
- Por qué esto importa en `replace()` con `$1`, `$2`…
- Cómo repetir bloques sin ensuciar los índices.

---

## 1) Agrupar para alternar, pero capturar solo lo que importa

Versión OmniPizza del id de orden: `ORD-` (o `ord-`) seguido de dígitos. Usamos `(?:ORD|ord)` SOLO para que el `|` abarque las dos opciones; lo que de verdad queremos es el número, así que ESE sí va en `(...)`. Resultado: el número queda en `m[1]`.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/02-captura-vs-no-captura.ts
const reConNoCaptura = /^(?:ORD|ord)-(\d+)$/;
const mNoCap = "ORD-456".match(reConNoCaptura);
check("match completo (m[0])", mNoCap ? mNoCap[0] : null, "ORD-456");
check("número en grupo 1 (m[1])", mNoCap ? mNoCap[1] : null, "456");
// Como el primer paréntesis es (?:...), NO existe un m[2]: solo hay 1 grupo.
// Leer un índice inexistente devuelve el valor `undefined` (no un string).
check("no existe grupo 2 (índice fuera de rango)", mNoCap?.[2] === undefined, true);
```

---

## 2) Capturar de más RECORRE los índices

Si por descuido usamos `(ORD|ord)` en vez de `(?:ORD|ord)`, ahora el prefijo es el grupo 1 y el número pasa a ser el grupo 2. Si tu código seguía leyendo `m[1]` esperando el número, de pronto lee `"ORD"`. BUG sutil.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/02-captura-vs-no-captura.ts
const reConCaptura = /^(ORD|ord)-(\d+)$/;
const mCap = "ORD-456".match(reConCaptura);
check("ahora m[1] es el PREFIJO", mCap ? mCap[1] : null, "ORD");
check("y el número se fue a m[2]", mCap ? mCap[2] : null, "456");
```

> Moraleja en una línea: capturar de más NO rompe el match, ROMPE los índices. `(?:...)` mantiene tu numeración estable y tu intención clara.

---

## 3) Por qué importa en `replace()`: `$1`, `$2`… apuntan a grupos de captura

Queremos reescribir `"ORD-456"` como `"orden #456"` pero SIN capturar el prefijo. Con `(?:ORD|ord)` el número es `$1`.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/02-captura-vs-no-captura.ts
const conNoCaptura = "ORD-456".replace(reConNoCaptura, "orden #$1");
check("replace con no-captura usa $1 = número", conNoCaptura, "orden #456");

// Con el patrón que captura el prefijo, $1 = "ORD" y el número es $2.
// Si hubiéramos escrito "orden #$1" por costumbre, saldría "orden #ORD".
const conCaptura = "ORD-456".replace(reConCaptura, "orden #$2");
check("replace con captura debe usar $2", conCaptura, "orden #456");
```

---

## 4) Repetir un bloque sin ensuciar los índices

Una ruta de API tipo `/api/v1/pizzas/orders` es uno o más segmentos `/palabra`. Solo queremos el ÚLTIMO recurso. `(?:/\w+)*` agrupa-y-repite los segmentos intermedios SIN capturarlos; el grupo de captura `(\w+)` final se queda con el recurso. Así `m[1]` es siempre el último segmento, sin importar cuántos haya antes.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/02-captura-vs-no-captura.ts
const reRuta = /^(?:\/\w+)*\/(\w+)$/;
const mRuta = "/api/v1/pizzas/orders".match(reRuta);
check("último recurso de la ruta", mRuta ? mRuta[1] : null, "orders");
checkMatch(reRuta, "/orders", true); // también con un solo segmento
checkMatch(reRuta, "sin-slash", false); // debe empezar con "/"
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-grupos-captura/02-captura-vs-no-captura.ts
```

---

## Qué observar

- Regla práctica: si agrupas **solo** para `|` o para repetir, usa `(?:...)`. Reserva `(...)` para lo que de verdad vas a leer.
- Un grupo de más no cambia QUÉ matchea el patrón; cambia DÓNDE quedan tus datos.
- En `replace()`, los `$N` siguen exactamente la misma numeración de grupos de captura.

⬅️ Anterior: [3.1 Grupos y alternancia](/docs/regex/m3-grupos-y-alternancia) · ➡️ Siguiente: [3.3 Grupos nombrados](/docs/regex/m3-grupos-nombrados)
