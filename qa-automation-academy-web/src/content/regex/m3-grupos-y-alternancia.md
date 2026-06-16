# 3.1 — Grupos `(...)` y alternancia `|`

> **Módulo 3 · Grupos, captura y alternancia**

> **Analogía QA:** en una suite decides "corre en QA **o** en UAT **o** en PROD". El paréntesis es como los corchetes de un criterio de aceptación: marca EXACTAMENTE qué parte abarca el "o". Sin paréntesis, el `|` se desborda y tu validador acepta ambientes que jamás debió aceptar (un falso positivo que en producción se traduce en "se desplegó en el server equivocado").

---

## ¿Qué aprendes?

- Que el `|` (alternancia) tiene la precedencia **más baja** de toda la regex.
- Cómo el paréntesis `(...)` **acota** el alcance del `|`.
- Que un grupo, además de agrupar, **captura** lo que matcheó.
- Cómo usar un grupo para repetir un **bloque** completo con un cuantificador.

---

## 1) El `|` divide TODA la regex

El `|` tiene la precedencia más baja, así que `/^QA|UAT|PROD$/` se lee como **tres alternativas completas**:

```
(^QA)  |  (UAT)  |  (PROD$)
```

O sea: "empieza con QA" **o** "contiene UAT en cualquier parte" **o** "termina con PROD". NO está anclada de punta a punta. Por eso cuela basura.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/01-grupos-y-alternancia.ts
const reSinGrupo = /^QA|UAT|PROD$/;
checkMatch(reSinGrupo, "QA", true); // ✅ por "^QA"
checkMatch(reSinGrupo, "QA-staging", true); // ⚠️ cuela: cumple "^QA"
checkMatch(reSinGrupo, "mi PROD", true); // ⚠️ cuela: cumple "PROD$"
checkMatch(reSinGrupo, "UAT también aquí", true); // ⚠️ cuela: contiene "UAT"
```

---

## 2) El paréntesis ACOTA el alcance del `|`

`/^(QA|UAT|PROD)$/` se lee: "del inicio al fin, una de estas tres EXACTA". Los anclajes `^` y `$` envuelven al grupo entero, no solo a una alternativa.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/01-grupos-y-alternancia.ts
const reConGrupo = /^(QA|UAT|PROD)$/;
checkMatch(reConGrupo, "QA", true);
checkMatch(reConGrupo, "UAT", true);
checkMatch(reConGrupo, "PROD", true);
checkMatch(reConGrupo, "QA-staging", false); // ahora SÍ rechaza
checkMatch(reConGrupo, "mi PROD", false); // ahora SÍ rechaza
checkMatch(reConGrupo, "qa", false); // case-sensitive: minúsculas fuera
```

---

## 3) El grupo CAPTURA: además de agrupar, guarda lo que matcheó

Como agrupamos con `(...)`, el **grupo 1** contiene el ambiente reconocido. `match()` devuelve `RegExpMatchArray | null`, así que en TypeScript estricto hay que guardar antes de leer.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/01-grupos-y-alternancia.ts
const m = "PROD".match(reConGrupo);
const ambiente = m ? m[1] : null; // m[0] = match completo; m[1] = grupo 1
check("ambiente capturado en grupo 1", ambiente, "PROD");
```

---

## 4) Agrupar para repetir un BLOQUE completo

Sin grupo, `ab+` repite SOLO la `b` (`a`, `ab`, `abb`, `abbb`…). Para repetir el par `ab` completo necesitamos `(ab)+`.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/01-grupos-y-alternancia.ts
const reBloqueRepetido = /^(ab)+$/;
checkMatch(reBloqueRepetido, "ab", true);
checkMatch(reBloqueRepetido, "ababab", true);
checkMatch(reBloqueRepetido, "aba", false); // sobra una 'a' suelta
checkMatch(reBloqueRepetido, "abb", false); // "ab" + "b" no es bloque "ab"
```

---

## 5) Alternancia ANIDADA dentro de un patrón mayor

Etiquetas de severidad de un log: `[INFO]` | `[WARN]` | `[ERROR]`, envueltas en corchetes literales. El grupo deja que el `|` elija solo la palabra.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/01-grupos-y-alternancia.ts
const reSeveridad = /^\[(INFO|WARN|ERROR)\]$/;
checkMatch(reSeveridad, "[INFO]", true);
checkMatch(reSeveridad, "[ERROR]", true);
checkMatch(reSeveridad, "[DEBUG]", false); // no está en la lista
checkMatch(reSeveridad, "INFO", false); // faltan los corchetes

const mSev = "[WARN]".match(reSeveridad);
const severidad = mSev ? mSev[1] : null;
check("severidad capturada", severidad, "WARN");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-grupos-captura/01-grupos-y-alternancia.ts
```

---

## Qué observar

- El `|` es "glotón de alcance": sin paréntesis abarca toda la regex. **Casi siempre** querrás acotarlo con `(...)`.
- Agrupar y capturar son la misma operación con `(...)`: si agrupas, ya estás llenando `m[1]`.
- `m[0]` es el match completo; `m[1]`, `m[2]`… son los grupos en orden de aparición de su paréntesis de apertura.

➡️ Siguiente: [3.2 Captura vs no-captura](/docs/regex/m3-captura-vs-no-captura)
