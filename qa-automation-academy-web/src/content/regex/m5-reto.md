# 🚩 Reto — Módulo 5: "Política y enmascarado"

> **Módulo 5 · Lookaround**

> **Analogía QA:** eres responsable de DOS controles de seguridad en OmniPizza al mismo tiempo: validar que una contraseña cumpla la política corporativa **y** asegurarte de que ningún email se filtre a los logs. Dos asserts críticos, una sola tarea.

---

## Instrucciones

Eres responsable de dos controles de seguridad en OmniPizza:

1. **(Parte A)** Validar que una contraseña cumpla la política corporativa.
2. **(Parte B)** Enmascarar el email que aparece en una línea de log.

Completa las dos partes marcadas con `// TODO:` (ahora son placeholders que **no** funcionan): la regex de política `rePassword` y la regex/`replace` de enmascarado del email.

Es **esperado** que veas ❌ hasta que completes las dos partes. El reto está **resuelto** cuando:

- TODAS las contraseñas válidas pasan y TODAS las inválidas se rechazan, **y**
- el email del log queda enmascarado (sin exponer usuario ni dominio reales).

---

## Plantilla

```ts
// @file regex-qa-course/modulo-05-lookaround/reto.ts
// 🚩 Reto QA — Módulo 5: "Política y enmascarado"
import { check, checkMatch } from "../helpers/check";
import {
  PASSWORDS_VALIDAS,
  PASSWORDS_INVALIDAS,
  LINEA_LOG_CON_EMAIL,
} from "../data/samples";

console.log("\n===== 🚩 Reto 5: Política y enmascarado =====");

// ------------------------------------------------------------
// PARTE A — Política de contraseñas
// ------------------------------------------------------------
// TODO: define la política real apilando lookahead anclados.
//   Requisitos: ≥8 caracteres, ≥1 dígito, ≥1 mayúscula, ≥1 símbolo.
//   Sugerencia de forma: /^(?=.*\d)(?=.*[A-Z])(?=.*[ ... ]).{8,}$/
const rePassword = /CAMBIAME/; // TODO: completar la regex de política

console.log("--- Contraseñas que DEBEN pasar ---");
for (const p of PASSWORDS_VALIDAS) checkMatch(rePassword, p, true);
console.log("--- Contraseñas que DEBEN rechazarse ---");
for (const p of PASSWORDS_INVALIDAS) checkMatch(rePassword, p, false);

// ------------------------------------------------------------
// PARTE B — Enmascarar el email de una línea de log
// ------------------------------------------------------------
// TODO: reemplaza el email incrustado en LINEA_LOG_CON_EMAIL por un texto
//   enmascarado para que el log no filtre PII. Define tu regex y tu
//   reemplazo.
const reEmail = /CAMBIAME/; // TODO: regex que detecte el email (usa flag g)
const logEnmascarado = LINEA_LOG_CON_EMAIL.replace(reEmail, "$&"); // TODO: cambia "$&" por tu reemplazo

// El log enmascarado NO debe contener el usuario ni el dominio reales.
check("el log ya no expone el usuario real", logEnmascarado.includes("ana.tester"), false);
check("el log ya no expone el dominio real", logEnmascarado.includes("omnipizza.test"), false);
// ...pero SÍ debe conservar el resto del contexto del log.
check("el log conserva su contexto", logEnmascarado.includes("[INFO]") && logEnmascarado.includes("from MX"), true);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-lookaround/reto.ts
```

Cuando termines, **todas** las filas deben mostrar ✅: las contraseñas correctamente clasificadas y el email del log enmascarado.

---

## Checklist de auto-corrección

- [ ] **Parte A:** `rePassword` apila lookahead `(?=.*X)` anclados con `^ ... $`.
- [ ] **Parte A:** cubre las 4 reglas: ≥8 caracteres, al menos un dígito, una mayúscula y un símbolo.
- [ ] **Parte A:** todas las de `PASSWORDS_VALIDAS` pasan y todas las de `PASSWORDS_INVALIDAS` se rechazan.
- [ ] **Parte B:** `reEmail` usa el flag `g` y detecta el correo incrustado en la línea.
- [ ] **Parte B:** el reemplazo elimina `ana.tester` y `omnipizza.test`, pero conserva `[INFO]` y `from MX`.
- [ ] Al correrlo, **no** aparece ningún ❌.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- **Política:** apila lookahead `(?=.*X)` anclados con `^ ... $`. La forma general es `/^(?=.*\d)(?=.*[A-Z])(?=.*[<símbolo>]).{8,}$/`. Recuerda que un símbolo es "no-alfanumérico": `[^A-Za-z0-9]`.
- **Política:** el orden de los lookahead no importa (son de ancho cero e independientes), pero `.{8,}$` debe ir al final para exigir la longitud.
- **Enmascarado:** la opción más simple es una regex de email global y reemplazarla por `"<EMAIL>"`. Para armarla, piensa en su estructura: una clase tipo `[^\s@]+` a ambos lados de la `@`, y un `\.` antes del TLD (que es otra clase tipo `[^\s@]+`), todo con flag `g`. Ensambla esas piezas tú.
- **Enmascarado (avanzado):** si te animas, conserva la inicial con un lookbehind `(?<=\S)` y un `replacer` que devuelva `"***@***"` (revisa la clase 5.5).

</details>

---

⬅️ Anterior: [5.5 Enmascarar PII](/docs/regex/m5-enmascarar-pii) · ➡️ Siguiente: [Síntesis del Módulo 5](/docs/regex/m5-sintesis)
