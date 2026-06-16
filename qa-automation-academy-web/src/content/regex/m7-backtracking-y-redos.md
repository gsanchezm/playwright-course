# 7.1 — Backtracking y ReDoS (la regex que tumba el servidor)

> **Módulo 7 · Avanzado y seguro**

> **Analogía QA:** imagina un tester manual que, para encontrar un caso que "encaje", prueba **todas** las combinaciones posibles de un formulario. Si las combinaciones crecen de forma exponencial, nunca termina. Eso es el **backtracking catastrófico**: el motor de regex reintenta tantas particiones del texto que un input de ~30 caracteres puede colgar el proceso. Y si ese input viene de un usuario (un email, un nombre), acabas de regalar un **DoS**.

---

## ¿Qué aprendes?

- Qué es el **backtracking** y cuándo deja de ser inofensivo.
- Cómo un cuantificador **anidado y solapado** convierte una regex en un arma: **ReDoS** (Regex Denial of Service).
- Cómo **reconocer** un patrón vulnerable a simple vista (checklist QA).
- Por qué esto es un **bug de seguridad**, no un detalle de rendimiento.

> ⚠️ **Seguridad:** en toda esta lección demostramos el peligro de forma **segura**, con inputs cortos (≤ 11 caracteres). **Nunca** corras un patrón vulnerable contra un texto largo: a partir de ~30 `'a'` el motor entra en backtracking exponencial y **cuelga el proceso**. Reconocer el peligro NO requiere reproducir el cuelgue.

---

## ¿Qué es el backtracking? El motor "se arrepiente" y reintenta

Un cuantificador *greedy* como `\d+` primero se traga **todo** lo que puede, y si el resto del patrón no calza, "devuelve" caracteres uno a uno y reintenta. En patrones sanos eso son unos pocos reintentos: lineal, sin drama.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/01-backtracking-y-redos.ts
// Ejemplo SANO: /^\d+$/ sobre "123a5" falla rápido. \d+ se come "123",
// ve la 'a', no calza, retrocede una vez, sigue fallando y se rinde. Lineal.
checkMatch(/^\d+$/, "12345", true);
checkMatch(/^\d+$/, "123a5", false);
```

El problema aparece cuando hay **ambigüedad**: muchas formas distintas de repartir el mismo texto entre cuantificadores anidados.

---

## El patrón VULNERABLE clásico: `/(a+)+$/`

`(a+)+` tiene **dos** cuantificadores apilados sobre la misma `'a'`. Para una cadena de `N` letras `'a'` hay ~`2^N` maneras de repartir esas `'a'` entre el grupo interno `(a+)` y el externo `(...)+`.

- Si el input **termina bien** (puras `'a'` seguidas de `$`), el motor toma el primer reparto greedy y para de inmediato. Instantáneo.
- Si el input **falla al final** (una `'a'` seguida de un carácter que no es `'a'`), el motor se ve **obligado** a probar **todas** las ~`2^N` particiones antes de rendirse. Eso es el backtracking catastrófico → **ReDoS**.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/01-backtracking-y-redos.ts
const REGEX_VULNERABLE = /^(a+)+$/;

// "aaaaaaaaaa" (10 'a') SÍ matchea: primer reparto greedy y para. Instantáneo.
checkMatch(REGEX_VULNERABLE, REDOS_INPUT_CORTO, true);

// El caso PELIGROSO es el que FALLA: añadimos un caracter que no es 'a' al
// final. Con solo 11 caracteres son ~2^10 ≈ 1024 pasos: aún instantáneo y SEGURO.
const INPUT_QUE_FALLA = REDOS_INPUT_CORTO + "!"; // "aaaaaaaaaa!" = 11 chars
checkMatch(REGEX_VULNERABLE, INPUT_QUE_FALLA, false);
```

---

## Medir el tiempo SIN colgar

Medimos el **caso peor** (el que falla y fuerza backtracking) pero **acotado a 11 caracteres**. A este tamaño tarda menos de 1 ms. La aserción es honesta: no afirmamos "el vulnerable es más lento que el seguro" (a 11 chars ambos son instantáneos), afirmamos lo único deterministamente cierto: **en input corto sigue siendo rápido**.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/01-backtracking-y-redos.ts
const t0 = process.hrtime.bigint();
REGEX_VULNERABLE.test(INPUT_QUE_FALLA);
const t1 = process.hrtime.bigint();
const msVulnerableCorto = Number(t1 - t0) / 1e6;
// Umbral GENEROSO (< 100 ms) para que la aserción no sea "flaky" en CI.
check("backtracking en 11 chars es rápido (< 100 ms)", msVulnerableCorto < 100, true);
```

> 🔷 **Lo que NO hacemos (y por qué):** el coste crece como ~`2^N`. Empíricamente, ~24 `'a'` que fallan ya tardan ~100 ms, y cada 2 caracteres **más** lo cuadruplican. Con ~35 `'a'` que fallan, el proceso se cuelga durante segundos o minutos. Por eso este archivo **jamás** construye un input largo (nada de `"a".repeat(40)`). Reconocer el peligro no requiere reproducir el cuelgue.

---

## Cómo RECONOCER una regex potencialmente vulnerable (checklist QA)

La señal #1 es un **cuantificador aplicado a algo que ya tiene otro cuantificador**, sobre clases de caracteres que **se solapan**. Patrones de alarma (todos del mismo ADN que `/(a+)+$/`):

| Patrón sospechoso | Por qué |
| --- | --- |
| `(a+)+` `(a*)*` `(a+)*` | cuantificador anidado sobre la misma letra |
| `([a-z]+)+` `(\d+)+` `(\w*)*` | grupo cuantificado dentro de otro cuantificador |
| `(.*)*` `(\s+)*` | el `.`/`\s` se solapa consigo mismo |
| `(a\|aa)+` `(a\|a?)+` | alternancia que se solapa |

**Regla de bolsillo:** si **dos** cuantificadores pueden "pelearse" por los mismos caracteres, hay riesgo de backtracking exponencial.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/01-backtracking-y-redos.ts
// Heurística DIDÁCTICA (no un analizador real): ¿hay un grupo que termina en
// cuantificador y va seguido de otro cuantificador? p.ej. "+)+", "*)*".
function pareceVulnerable(fuente: string): boolean {
  return /[+*]\)[+*]/.test(fuente);
}
check("detecta (a+)+ como sospechoso", pareceVulnerable("^(a+)+$"), true);
check("detecta (a*)* como sospechoso", pareceVulnerable("(a*)*"), true);
// Una regex SANA equivalente (ver 7.2) NO dispara la heurística:
check("una regex anclada y simple NO es sospechosa", pareceVulnerable("^a+$"), false);
```

---

## Por qué esto te importa como QA

Si una regex vulnerable valida input de usuario en un endpoint (email, teléfono, `username`), un atacante manda una cadena diseñada para **fallar al final** y el hilo se queda atascado en backtracking. Un solo request puede consumir 100% de CPU durante minutos → **denegación de servicio**.

Como QA, cualquier regex que toque input externo debe:

1. Estar **anclada** (`^ ... $`).
2. **No** tener cuantificadores anidados solapados.
3. Validarse contra un **límite de longitud** antes de ejecutarse.

Eso es exactamente lo que veremos en 7.2.

---

## Qué observar

- El backtracking es normal y barato; solo es peligroso cuando el patrón **es ambiguo**.
- El caso que **cuelga** no es el que matchea, sino el que **falla al final**.
- Una regex insegura es un **bug de seguridad**, no un tema de microoptimización.

➡️ Siguiente: [7.2 Mitigar ReDoS](/docs/regex/m7-mitigar-redos)
