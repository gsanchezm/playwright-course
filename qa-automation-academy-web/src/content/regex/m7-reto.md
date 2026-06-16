# 🚩 Reto — Módulo 7: "Repara la regex insegura" (capstone)

> **Módulo 7 · Avanzado y seguro**

> **Analogía QA:** este es el **reto capstone** del curso. Te dan un validador real que está roto de dos formas a la vez: es **inseguro** (ReDoS) y **excluyente** (rechaza nombres internacionales). Tu trabajo es el de un QA senior: detectar ambos defectos y reescribir el patrón para que sea seguro, Unicode-safe y data-driven. Reúne lo aprendido en 7.1, 7.2 y 7.3.

---

## Contexto

OmniPizza valida los *handles* (nombres de usuario público) que la gente teclea al registrarse. El validador actual usa una regex **vulnerable a ReDoS** y, además, **rechaza nombres internacionales válidos** (no es Unicode-safe). Un atacante puede mandar un handle diseñado para colgar el servidor; y un cliente de México o Tōkyō no puede registrarse.

El validador roto, tal como está en producción (aquí solo como "antes"):

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/reto.ts
// Problemas:
//   (a) (\w+)+  → cuantificador ANIDADO solapado = backtracking exponencial
//       (ReDoS) cuando el input falla al final. Mismo ADN que /(a+)+$/ de 7.1.
//   (b) \w es ASCII → rechaza 'é', 'ō', 'ü'... (no Unicode-safe).
//   (c) sin techo de longitud → nada acota cuántos caracteres procesa.
const REGEX_VULNERABLE = /^(\w+)+$/;
```

> ⚠️ **Seguridad al probar (no negociable):** nunca corras la regex vulnerable contra un input largo. Los inputs de demo del archivo son cortos (≤ 12 caracteres) a propósito. Si experimentas, mantén cualquier cadena de prueba en ≤ 12 caracteres. Reproducir el cuelgue **no** es parte del reto: reconocerlo y arreglarlo, sí.

---

## Instrucciones (3 partes)

1. **Seguridad:** reemplaza la regex vulnerable por una **equivalente y segura** — sin cuantificadores anidados solapados, **anclada** y **acotada**.
2. **Unicode:** que acepte letras acentuadas / de otros alfabetos usando `\p{L}` con la flag `u` (NO el `\w` ASCII).
3. **Data-driven:** deja que pasen **todos** los `HANDLES_VALIDOS` y se rechacen **todos** los `HANDLES_INVALIDOS`.

Las reglas del handle OmniPizza:

- Solo **letras** (de cualquier idioma) y **dígitos**. Sin espacios ni símbolos.
- Entre **3 y 12** caracteres.

---

## Plantilla

La especificación viva ya está escrita: **no edites los casos**, haz que tu regex los cumpla.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/reto.ts
const HANDLES_VALIDOS = [
  "ana123",  // ASCII clásico
  "México",  // acento → exige \p{L} (6 chars)
  "Tōkyō",   // macrones japoneses (5 chars)
  "Zürich2", // umlaut + dígito (7 chars)
  "qaTeam",  // mixto (6 chars)
];
const HANDLES_INVALIDOS = [
  "ab",            // 2 chars: muy corto (mín. 3)
  "ana qa",        // espacio: no permitido
  "ana!",          // símbolo '!': no permitido
  "trececharsss1", // 13 chars: excede el máximo de 12
  "handle_corto",  // 12 chars pero el '_' NO es letra ni dígito → inválido
];

// TODO (1+2+3): tu versión SEGURA + Unicode-safe + acotada.
// Pistas:
//   • Letra Unicode O dígito:   [\p{L}\p{N}]   (recuerda la flag 'u')
//   • Sin anidar: una sola repetición acotada {3,12}, NADA de (...)+
//   • Anclada de punta a punta: ^ ... $
//   • Forma objetivo (descúbrela tú):  /^[ ... ]{ ... , ... }$/u
const REGEX_SEGURA = /CAMBIAME/; // TODO: reemplaza por tu regex segura y Unicode-safe
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-07-avanzado-seguro/reto.ts
```

Es **esperado** ver ❌ hasta que completes los `TODO`. El archivo corre sin crashear y **sin colgarse** desde el primer momento (porque todos los inputs de demo son cortos).

**Output esperado al terminar:** los 5 handles válidos salen ✅ (porque tu regex los acepta) y los 5 inválidos también salen ✅ (porque tu regex los rechaza, como se espera).

---

## Checklist de auto-corrección

- [ ] Tu regex **no** contiene ningún `(X+)+` ni cuantificador anidado solapado (esa es la prueba de que mataste el ReDoS).
- [ ] Usa `\p{L}` (y `\p{N}` para dígitos) con la flag `u`, no `\w`.
- [ ] Está **anclada** con `^` al inicio y `$` al final.
- [ ] El rango de longitud está **acotado** explícitamente (`{3,12}`).
- [ ] Los 5 válidos pasan y los 5 inválidos se rechazan, todos en ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- "Letra Unicode **o** dígito" se escribe como una clase de caracteres que combina dos propiedades: `[\p{L}\p{N}]`.
- "Entre 3 y 12 de eso" es un cuantificador **acotado** `{3,12}` aplicado a la clase, **sin** envolverla en un grupo cuantificado.
- No olvides la flag `u`: sin ella, `\p{L}` ni siquiera es válido.
- Si `"handle_corto"` se cuela como válido, recuerda que `_` **sí** está en `\w` pero **no** en `[\p{L}\p{N}]`: por eso `\w` no sirve aquí.
- Si `"ab"` o `"trececharsss1"` se clasifican mal, revisa los números de tu `{min,max}`.

</details>

---

⬅️ Anterior: [7.5 Cuándo NO usar regex](/docs/regex/m7-cuando-no-usar-regex) · ➡️ Siguiente: [Síntesis Módulo 7](/docs/regex/m7-sintesis)
