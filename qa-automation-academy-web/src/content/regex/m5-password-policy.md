# 5.4 — Política de contraseñas con múltiples lookahead

> **Módulo 5 · Lookaround**

> **Analogía QA:** es la **checklist del formulario de registro**. Cada lookahead es una casilla que DEBE quedar marcada (tiene mayúscula ✔, tiene dígito ✔, tiene símbolo ✔, mide ≥8 ✔). Como un test con varios `assert`: si uno falla, la contraseña entera se rechaza. **El** caso QA por excelencia.

---

## ¿Qué aprendes?

- Cómo apilar varios lookahead para validar condiciones **independientes** unidas por un AND lógico.
- Por qué el **orden** de los lookahead no cambia el veredicto.
- Cómo dar un **diagnóstico granular**: no solo "inválida", sino QUÉ regla falló (como los mensajes de error campo por campo de un formulario).

---

## Concepto

Validar "tiene mayúscula **Y** dígito **Y** símbolo" en un solo paso es difícil con regex normal, porque esos caracteres pueden estar en cualquier orden. La solución elegante: anclar en `^` y **apilar** varios lookahead de ancho cero. Cada `(?=.*X)` dice "mirando desde el inicio, en algún punto aparece una X". Como NO consumen, **todos miran la misma cadena completa**, independientes entre sí. Es una conjunción lógica (AND) hecha de asserts.

Desglose pieza por pieza:

| Pieza | Significado |
|---|---|
| `^` | empieza al inicio (los lookahead miran todo) |
| `(?=.*\d)` | ...en algún lugar hay un dígito |
| `(?=.*[A-Z])` | ...en algún lugar hay una mayúscula (ASCII) |
| `(?=.*[^A-Za-z0-9])` | ...en algún lugar hay un símbolo (no-alfanumérico) |
| `.{8,}` | y la cadena mide al menos 8 caracteres |
| `$` | hasta el final |

---

## Código

```ts
// @file regex-qa-course/modulo-05-lookaround/04-password-policy.ts
// La IDEA clave: lookahead apilado = condiciones INDEPENDIENTES y "AND".
const rePassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

console.log("--- Contraseñas VÁLIDAS (deben pasar TODAS las casillas) ---");
for (const p of PASSWORDS_VALIDAS) checkMatch(rePassword, p, true);
// Por qué pasan (razonado a mano):
//  "Pizza123!"    → 'P' may, '1' díg, '!' símbolo, 9 chars  → ✔
//  "QAteam#2026"  → 'Q' may, '2' díg, '#' símbolo, 11 chars → ✔
//  "Str0ng$Pass"  → 'S' may, '0' díg, '$' símbolo, 11 chars → ✔

console.log("--- Contraseñas INVÁLIDAS (cada una rompe una casilla) ---");
for (const p of PASSWORDS_INVALIDAS) checkMatch(rePassword, p, false);
// Por qué fallan (qué casilla NO marcan):
//  "pizza"       → sin díg, sin may, sin símbolo, <8       → falla
//  "password"    → sin díg, sin may, sin símbolo           → falla
//  "ALLUPPER1"   → tiene may y díg, pero NINGÚN símbolo    → falla
//  "NoSymbol123" → tiene may y díg, pero NINGÚN símbolo    → falla
//  "short1!"     → tiene díg y símbolo, pero sin may y <8  → falla
```

```ts
// @file regex-qa-course/modulo-05-lookaround/04-password-policy.ts
// Diagnóstico granular: un test bueno dice QUÉ regla falló.
// Cada regla se prueba por separado. Esto modela el típico
// "mensaje de error campo por campo" de un formulario.
function diagnosticar(pwd: string) {
  return {
    largo: /^.{8,}$/.test(pwd),              // ≥ 8 caracteres
    digito: /(?=.*\d)/.test(pwd),            // al menos un dígito
    mayuscula: /(?=.*[A-Z])/.test(pwd),      // al menos una mayúscula
    simbolo: /(?=.*[^A-Za-z0-9])/.test(pwd), // al menos un símbolo
  };
}

// "ALLUPPER1": cumple largo (9), dígito ('1') y mayúscula, pero le falta
// el símbolo. El diagnóstico debe señalar exactamente eso.
check("diagnóstico de 'ALLUPPER1'", diagnosticar("ALLUPPER1"), {
  largo: true,
  digito: true,
  mayuscula: true,
  simbolo: false, // ← la única casilla sin marcar
});
```

```ts
// @file regex-qa-course/modulo-05-lookaround/04-password-policy.ts
// Sutileza importante: el ORDEN de los lookahead no cambia el resultado.
// Como cada lookahead es independiente y de ancho cero, reordenarlos da
// EXACTAMENTE el mismo veredicto.
const reReordenada = /^(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*\d).{8,}$/;
for (const p of PASSWORDS_VALIDAS) {
  check(
    `orden de lookahead no afecta a '${p}'`,
    reReordenada.test(p),
    rePassword.test(p)
  );
}
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-lookaround/04-password-policy.ts
```

---

## Qué observar

- Cada `(?=.*X)` es una casilla independiente. La regex completa solo pasa si **todas** se marcan: es un AND construido con asserts de ancho cero.
- Como los lookahead no consumen, da igual el orden en que los escribas: `rePassword` y `reReordenada` dan el mismo veredicto para toda contraseña.
- Una regex monolítica te dice "sí/no", pero un buen test de QA quiere saber **qué** falló. La función `diagnosticar` rompe la política en reglas separadas para producir un mensaje campo por campo.

---

⬅️ Anterior: [5.3 Lookbehind](/docs/regex/m5-lookbehind) · ➡️ Siguiente: [5.5 Enmascarar PII](/docs/regex/m5-enmascarar-pii)
