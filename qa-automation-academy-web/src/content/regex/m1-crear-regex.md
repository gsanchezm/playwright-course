# 1.2 — Dos formas de crear una regex

> **Módulo 1 · Fundamentos**

> **Analogía QA:** un literal `/.../` es un caso de prueba **hardcodeado** (lo escribes fijo en el código); `new RegExp("...")` es un caso **parametrizado / data-driven** (lo construyes en runtime a partir de datos). Igual que en un framework de pruebas: a veces el dato va en el test, a veces viene de un fixture.

---

## ¿Qué aprendes?

- La forma **literal** `/patrón/flags`: preferida cuando el patrón es fijo.
- La forma **constructor** `new RegExp("patrón", "flags")`: para patrones dinámicos.
- El **doble escapado** del constructor (`\d` vs `\\d`) y por qué es una trampa clásica.
- Cuándo conviene cada una.

---

## Forma 1: literal `/patrón/flags`

Es la forma preferida cuando el patrón es **fijo** y lo conoces al escribir el código. Ventaja: no hay doble escapado y el editor lo resalta como regex.

```ts
// @file regex-qa-course/modulo-01-fundamentos/02-crear-regex.ts
const reLiteral = /PZ-\d{4}/; // SKU de pizza: "PZ-" + 4 dígitos
checkMatch(reLiteral, "PZ-1234", true);
checkMatch(reLiteral, "PZ-12", false); // solo 2 dígitos, no 4
```

---

## Forma 2: constructor `new RegExp("patrón", "flags")`

Útil cuando el patrón se **construye en runtime** (desde datos de prueba, configuración, parámetros). El patrón es un **string normal**.

⚠️ **Ojo con el escapado:** en un string, la barra invertida `\` es especial. Para que la regex reciba `\d` debes escribir `"\\d"` en el string. Por eso el literal de arriba dice `\d` pero aquí decimos `\\d`. Ambas producen **exactamente el mismo patrón** (`.source`):

```ts
// @file regex-qa-course/modulo-01-fundamentos/02-crear-regex.ts
const reConstruida = new RegExp("PZ-\\d{4}");
check("literal y constructor producen el mismo .source", reConstruida.source, reLiteral.source);
checkMatch(reConstruida, "PZ-0001", true);
```

Si en el string pones `"\d"` (una sola barra), JavaScript interpreta `\d` como... solo `d` (no es un escape válido de string, así que la barra se pierde). El patrón resultante sería `PZ-dddd` (cuatro letras `d` literales), que **no** es lo que querías.

---

## El caso de uso real del constructor: regex dinámica desde datos

Imagina un test parametrizado que valida que un texto contenga el nombre del ambiente bajo prueba. El ambiente viene de una **variable**, no es fijo: aquí brilla el constructor.

```ts
// @file regex-qa-course/modulo-01-fundamentos/02-crear-regex.ts
const ambienteBajoPrueba = "UAT";
const reAmbienteDinamico = new RegExp(`ambiente: ${ambienteBajoPrueba}\\b`);
checkMatch(reAmbienteDinamico, "log: ambiente: UAT activo", true);
checkMatch(reAmbienteDinamico, "log: ambiente: PROD activo", false);
```

⚠️ **Advertencia profesional:** si interpolas datos **no confiables** en una regex, caracteres como `.` o `(` del dato se interpretan como metacaracteres y rompen el patrón (o abren agujeros de validación). Para datos arbitrarios hay que "escaparlos" primero — lo verás en [1.4](/docs/regex/m1-literales-y-punto) con los metacaracteres.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-fundamentos/02-crear-regex.ts
```

---

## Qué observar

- En el **literal** escribes `\d`; en el **constructor** (string) escribes `\\d`. Es el mismo patrón.
- Usa **literal** cuando el patrón es estático: menos ruido, resaltado del editor.
- Usa **constructor** cuando el patrón se arma desde datos/variables en runtime.
- `re.source` te muestra el patrón "crudo" — útil para comparar que dos regex son iguales.

⬅️ Anterior: [1.1 ¿Qué es una regex?](/docs/regex/m1-que-es-regex) · ➡️ Siguiente: [1.3 Métodos básicos](/docs/regex/m1-metodos-basicos)
