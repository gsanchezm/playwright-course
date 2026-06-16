# 6.4 — Validación data-driven (matriz de regresión)

> **Módulo 6 · Regex en pruebas**

> **Analogía QA:** en vez de escribir un test por cada caso, defines una **tabla** de casos `{ input, debeCoincidir, descripcion }` y la recorres en bucle. Es una **matriz de regresión**: agregar un caso nuevo (un bug encontrado) es una **línea más** en la tabla, no un test nuevo entero. Cada fila se auto-documenta con su descripción.

---

## ¿Qué aprendes?

- El patrón **data-driven**: separar los **casos** (la tabla) de la **lógica** (un solo bucle).
- A modelar cada caso con una `interface` y a construir la tabla desde los datos compartidos.
- Por qué este patrón convierte cada bug encontrado en una línea más de regresión.
- A imprimir descripciones razonadas para que el reporte sea legible por humanos.

---

## El patrón data-driven en una frase

> **Una sola línea de lógica de test, N casos cubiertos.**

La regex bajo prueba valida un SKU de pizza OmniPizza: `PZ-####` → exactamente 2 letras mayúsculas, guion, y exactamente 4 dígitos. Anclada, porque `"PZ-12345"` (5 díg.) y `"PZ-12"` (2 díg.) deben fallar — sin `$`, `"PZ-1234"` colaría dentro de `"PZ-12345"`.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/04-data-driven-validacion.ts
const reSku = /^[A-Z]{2}-\d{4}$/;
```

---

## La tabla: la fuente de verdad

Cada fila declara su `input`, si **debe coincidir** y una **descripción**. Mezclamos los datos del contrato (`samples.ts`) con la expectativa explícita por fila.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/04-data-driven-validacion.ts
interface CasoValidacion {
  input: string;
  debeCoincidir: boolean;
  descripcion: string;
}

// Por qué cada caso inválido es inválido (razonado, no adivinado).
const motivoInvalido: Record<string, string> = {
  "pz-1234": "letras en minúscula (deben ser mayúsculas)",
  "PZ-12": "solo 2 dígitos (se requieren 4)",
  "PZA-1234": "3 letras (se requieren exactamente 2)",
  "PZ-12345": "5 dígitos (se requieren exactamente 4)",
  "PZ1234": "falta el guion separador",
  "P-1234": "solo 1 letra (se requieren exactamente 2)",
};

const TABLA_SKU: CasoValidacion[] = [
  ...SKUS_VALIDOS.map((sku) => ({
    input: sku,
    debeCoincidir: true,
    descripcion: `SKU bien formado: ${sku}`,
  })),
  ...SKUS_INVALIDOS.map((sku) => ({
    input: sku,
    debeCoincidir: false,
    descripcion: `rechazar "${sku}" — ${motivoInvalido[sku] ?? "formato inválido"}`,
  })),
];
```

> 💡 Construir la tabla desde `SKUS_VALIDOS` y `SKUS_INVALIDOS` (los arreglos compartidos) garantiza que la prueba y el "contrato" de datos no se desincronicen.

---

## El recorrido: un bucle para todos los casos

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/04-data-driven-validacion.ts
for (const caso of TABLA_SKU) {
  console.log(`· ${caso.descripcion}`);
  checkMatch(reSku, caso.input, caso.debeCoincidir);
}
```

Imprimir `caso.descripcion` hace que el reporte sea legible por humanos: cuando algo falla, ves **qué caso** y **por qué se esperaba** ese veredicto, sin abrir el código.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-regex-en-pruebas/04-data-driven-validacion.ts
```

---

## Qué observar

- **Casos** (datos) y **lógica** (un bucle) viven separados: ese es el corazón del data-driven.
- Agregar un caso nuevo es **una línea** en la tabla, no un test nuevo entero.
- La `descripcion` por fila convierte el reporte en algo que un humano entiende de un vistazo.
- Regex + data-driven = una **matriz de regresión** que crece cada vez que cazas un bug.

⬅️ Anterior: [6.3 Scrubbing de snapshots](/docs/regex/m6-scrubbing-de-snapshots) · ➡️ Siguiente: [6.5 Replace avanzado](/docs/regex/m6-replace-avanzado)
