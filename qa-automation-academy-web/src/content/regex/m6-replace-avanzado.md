# 6.5 — Replace avanzado

> **Módulo 6 · Regex en pruebas**

> **Analogía QA:** a veces no basta con "buscar y reemplazar texto fijo". Quieres **reordenar** (fecha ISO → `dd/mm/yyyy`), **transformar** (mayúsculas, cálculos) o **extraer todo** de un golpe. Estas son las herramientas finas del cinturón: la **función replacer**, la sustitución por **grupo nombrado** `$<nombre>`, `String.matchAll` y `String.replaceAll`.

---

## ¿Qué aprendes?

- A reordenar texto con grupos nombrados en el reemplazo: `$<nombre>`.
- A **calcular** el reemplazo con una **función replacer**.
- A iterar todas las coincidencias con sus grupos usando `matchAll`.
- La diferencia entre `replaceAll` con string literal y con regex (que **exige** `g`).

---

## 1) `$<nombre>`: reemplazo con grupos nombrados

Reordenamos una fecha ISO (`yyyy-mm-dd`) a formato local (`dd/mm/yyyy`) **sin escribir código**: el string de reemplazo referencia los grupos por nombre con `$<nombre>`. Mucho más legible que `$1`/`$2`/`$3`.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/05-replace-avanzado.ts
const reFechaNombrada = /(?<anio>\d{4})-(?<mes>\d{2})-(?<dia>\d{2})/;
const fechaLocal = "2026-06-16".replace(reFechaNombrada, "$<dia>/$<mes>/$<anio>");
check("fecha ISO → dd/mm/yyyy con $<grupo>", fechaLocal, "16/06/2026");
```

---

## 2) Función replacer: el reemplazo se **calcula**

El 2.º argumento de `replace` puede ser una **función**. Recibe la coincidencia y los grupos, y devuelve el texto a insertar. Aquí aplicamos un 16 % de impuesto a cada precio — algo **imposible** con un string fijo.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/05-replace-avanzado.ts
const reTotal = /total=(\d+\.\d{2})/g;
const conImpuesto = "a total=100.00 b total=250.00".replace(
  reTotal,
  (_match, monto: string) => {
    const conIva = (Number(monto) * 1.16).toFixed(2);
    return `total=${conIva}`;
  }
);
// 100.00 * 1.16 = 116.00 ; 250.00 * 1.16 = 290.00
check("replacer aplica IVA 16%", conImpuesto, "a total=116.00 b total=290.00");
```

Los grupos **nombrados** llegan a la función en el **último argumento** como objeto `groups`. Útil cuando hay varios grupos y el orden cansa.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/05-replace-avanzado.ts
const reSku = /(?<letras>[A-Z]{2})-(?<num>\d{4})/g;
const normalizado = "items: PZ-1234 y PZ-0001".replace(
  reSku,
  (...args) => {
    // El último arg es el objeto de grupos nombrados.
    const grupos = args[args.length - 1] as { letras: string; num: string };
    return `${grupos.letras}#${grupos.num}`;
  }
);
check("replacer con grupos nombrados", normalizado, "items: PZ#1234 y PZ#0001");
```

---

## 3) `String.matchAll`: iterar todas las coincidencias

`matchAll` **exige** la flag `g` o lanza `TypeError`. Devuelve un **iterador** de matches, cada uno con índice y grupos. Extraemos todos los SKUs de un texto a un array — el patrón clásico de "scraping de logs".

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/05-replace-avanzado.ts
const textoSkus = "pedido con PZ-1234, PZ-0001 y PZ-9999 confirmado";
const reSkuG = /(?<letras>[A-Z]{2})-(?<num>\d{4})/g;
const encontrados: string[] = [];
for (const m of textoSkus.matchAll(reSkuG)) {
  // m.groups es `{...} | undefined` en strict → lo verificamos.
  if (m.groups) encontrados.push(`${m.groups.letras}-${m.groups.num}`);
}
check("matchAll extrae todos los SKUs", encontrados, ["PZ-1234", "PZ-0001", "PZ-9999"]);
check("matchAll encontró 3 SKUs", encontrados.length, 3);
```

---

## 4) `String.replaceAll`: todas las ocurrencias

Con **string literal**, `replaceAll` no necesita regex: reemplaza el texto fijo en todas partes (mientras que `replace()` solo cambiaría la 1.ª).

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/05-replace-avanzado.ts
const sinComas = "1,234,567".replaceAll(",", "");
check("replaceAll con string literal", sinComas, "1234567");
```

Con **regex**, `replaceAll` **exige** la flag `g` (si no, lanza `TypeError`). Aquí enmascaramos todos los emails de una línea con un placeholder.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/05-replace-avanzado.ts
const reEmailG = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const enmascarado = "contacto: a@x.com y b@y.org".replaceAll(reEmailG, "<EMAIL>");
check("replaceAll con regex+g enmascara emails", enmascarado, "contacto: <EMAIL> y <EMAIL>");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-regex-en-pruebas/05-replace-avanzado.ts
```

---

## Qué observar

- `$<nombre>` en el reemplazo reordena texto sin una sola línea de código imperativo.
- Una **función replacer** desbloquea transformaciones complejas: cálculos, mayúsculas, numeración.
- Los grupos nombrados llegan a la función en el **último argumento** (`groups`).
- `matchAll` y `replaceAll` con regex **exigen** `g`; `replaceAll` con string literal no necesita regex.

⬅️ Anterior: [6.4 Validación data-driven](/docs/regex/m6-data-driven-validacion) · ➡️ Siguiente: [🚩 Reto M6](/docs/regex/m6-reto)
