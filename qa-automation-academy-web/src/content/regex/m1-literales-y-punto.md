# 1.4 — Caracteres literales, el punto y escapar metacaracteres

> **Módulo 1 · Fundamentos**

> **Analogía QA:** en una regex la mayoría de los caracteres son **literales** (se matchean a sí mismos, como texto exacto en un assertion), pero un puñado son **metacaracteres** con poderes especiales — son los operadores del lenguaje. Confundir un metacaracter con texto literal es como olvidar escapar comillas en un CSV: el dato se interpreta como sintaxis y rompe.

---

## ¿Qué aprendes?

- Que la mayoría de los caracteres son **literales** (se matchean a sí mismos).
- El metacaracter **punto** `.` = "cualquier carácter (menos salto de línea)".
- Cómo **escapar** un metacaracter con `\` para volverlo literal.
- La lista de metacaracteres que siempre hay que escapar.
- Una utilidad `escapeRegExp` para neutralizar datos dinámicos.

---

## 1) Caracteres literales: la mayoría se matchea a sí mismo

Letras, dígitos y muchos símbolos no tienen poderes: `PROD` matchea el texto `"PROD"` tal cual. Es el comportamiento "obvio" y el más común.

```ts
// @file regex-qa-course/modulo-01-fundamentos/04-literales-y-punto.ts
checkMatch(/PROD/, "deploy a PROD", true);
checkMatch(/PROD/, "deploy a QA", false);
```

---

## 2) El punto `.` = comodín de "cualquier carácter"

`/PZ./` significa "PZ seguido de **un** carácter cualquiera" (menos el salto de línea).

```ts
// @file regex-qa-course/modulo-01-fundamentos/04-literales-y-punto.ts
const rePuntoComodin = /PZ./;
checkMatch(rePuntoComodin, "PZ-", true); // el '.' matchea el guion
checkMatch(rePuntoComodin, "PZ9", true); // ...o un dígito
checkMatch(rePuntoComodin, "PZ", false); // pero EXIGE un carácter: "PZ" solo, no
```

⚠️ **Trampa de QA:** si quieres validar un punto **literal** (p.ej. en `"v1.2"`) y usas `.` sin escapar, tu validación es demasiado **permisiva**: aceptará basura. Mira cómo `/v1.2/` acepta `"v1X2"`, que no es una versión válida:

```ts
// @file regex-qa-course/modulo-01-fundamentos/04-literales-y-punto.ts
checkMatch(/v1.2/, "v1X2", true); // ❌ semánticamente: coló un impostor
```

---

## 3) Escapar un metacaracter con `\` lo vuelve literal

Para matchear un punto **real**, escríbelo como `\.`. Ahora `/v1\.2/` exige el punto exacto y rechaza `"v1X2"`. Esta es la versión **correcta** del check:

```ts
// @file regex-qa-course/modulo-01-fundamentos/04-literales-y-punto.ts
const reVersion = /v1\.2/;
checkMatch(reVersion, "v1.2", true); // punto literal: ✅
checkMatch(reVersion, "v1X2", false); // ya NO cuela el impostor: ✅
```

---

## 4) Los metacaracteres que siempre hay que escapar

Si los quieres **literales**, escapa estos: `. \ * + ? ( ) [ ] { } ^ $ |`. Cada uno tiene un poder especial; con `\` se "apagan" y se matchean como texto. Validemos algunos artefactos típicos de QA:

```ts
// @file regex-qa-course/modulo-01-fundamentos/04-literales-y-punto.ts
// El '$' es ancla de "fin de línea"; escapado matchea el símbolo de dólar.
checkMatch(/\$\d+\.\d{2}/, "$19.99", true); // precio en USD literal
// El '+' significa "uno o más"; escapado matchea el prefijo telefónico.
checkMatch(/\+52/, "+52 55 1234 5678", true); // prefijo de México literal
// Los paréntesis agrupan; escapados matchean paréntesis de un teléfono US.
checkMatch(/\(415\)/, "+1 (415) 555-0123", true);
// El '?' significa "opcional"; escapado matchea un signo de pregunta en una query.
checkMatch(/catalog\?market=MX/, "/catalog?market=MX", true);
```

---

## 5) Escapar datos dinámicos: `escapeRegExp`

Cuando construyes una regex a partir de un **dato** (como en [1.2](/docs/regex/m1-crear-regex)), debes escapar sus metacaracteres o se interpretarán como sintaxis. Esta función reemplaza cada metacaracter por su versión escapada:

```ts
// @file regex-qa-course/modulo-01-fundamentos/04-literales-y-punto.ts
function escapeRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& = la coincidencia
}

// Queremos buscar el TEXTO literal "total=249.00 (MXN)", que trae '.', '(' y ')'.
const dato = "total=249.00 (MXN)";
const reSegura = new RegExp(escapeRegExp(dato));
check("escapeRegExp neutraliza los metacaracteres", reSegura.source, "total=249\\.00 \\(MXN\\)");
checkMatch(reSegura, "log: total=249.00 (MXN) ok", true);
// Y NO cuela un impostor donde el '.' fuera un comodín (p.ej. "249X00"):
checkMatch(reSegura, "log: total=249X00 (MXN) ok", false);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-fundamentos/04-literales-y-punto.ts
```

---

## Qué observar

- La mayoría de los caracteres son **literales**; solo un puñado son metacaracteres.
- El punto `.` sin escapar es un **comodín**: hace tu validación demasiado permisiva.
- Escapar con `\` "apaga" el poder del metacaracter y lo vuelve texto exacto.
- Para construir regex desde datos arbitrarios, **escapa siempre** con una utilidad como `escapeRegExp`.

⬅️ Anterior: [1.3 Métodos básicos](/docs/regex/m1-metodos-basicos) · ➡️ Siguiente: [1.5 Dónde aparece en QA](/docs/regex/m1-donde-aparece-en-qa)
