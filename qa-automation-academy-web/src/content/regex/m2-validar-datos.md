# 2.5 — Validar datos: clases + cuantificadores + anclas

> **Módulo 2 · Clases y cuantificadores**

> **Analogía QA:** aquí dejas de jugar con piezas sueltas y armas el "guardia de la puerta" real de tu suite. Un validador = **clase** (QUÉ caracteres) + **cuantificador** (CUÁNTOS) + **anclas** `^...$` (sobre TODO el dato). Si falta el anclaje, es un test que pasa por la razón equivocada (falso positivo).

---

## ¿Qué aprendes?

- A combinar lo de 2.1–2.4 en validadores reales (IDs, SKU, status HTTP, versiones).
- La **regla de oro**: SIEMPRE anclar con `^ ... $`.
- A verificar un validador como propiedad, sobre datasets de válidos e inválidos.

> **Regla de oro:** `checkMatch` usa `.test()`, que busca una **subcadena**. Casi todo dato inválido "casi válido" contiene dentro una porción correcta. Solo `^...$` afirma sobre el dato COMPLETO. Por eso TODOS los validadores aquí van anclados.

---

## 1) ID numérico — solo dígitos, al menos uno

`[0-9]+` anclado = "uno o más dígitos y NADA más". Equivale a `\d+` (ASCII).

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/05-validar-datos.ts
const reIdNumerico = /^[0-9]+$/;
checkMatch(reIdNumerico, "42", true);
checkMatch(reIdNumerico, "0", true);
checkMatch(reIdNumerico, "00123", true); // ceros a la izquierda permitidos
checkMatch(reIdNumerico, "", false);     // vacío → '+' exige al menos uno
checkMatch(reIdNumerico, "12a", false);  // la 'a' rompe (gracias al $)
checkMatch(reIdNumerico, "-5", false);   // el signo no es dígito
```

---

## 2) SKU alfanumérico — `PZ-####`

2 letras MAYÚSCULAS + guion + 4 dígitos. Desglose del patrón `^[A-Z]{2}-\d{4}$`:

| Pieza      | Significado                       |
|------------|-----------------------------------|
| `^`        | ancla el inicio                   |
| `[A-Z]{2}` | exactamente 2 letras MAYÚSCULAS   |
| `-`        | un guion literal                  |
| `\d{4}`    | exactamente 4 dígitos             |
| `$`        | ancla el fin                      |

Usamos los datos compartidos del contrato (`SKUS_VALIDOS` / `SKUS_INVALIDOS`):

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/05-validar-datos.ts
const reSku = /^[A-Z]{2}-\d{4}$/;

console.log("--- SKU válidos (data/samples) ---");
for (const sku of SKUS_VALIDOS) checkMatch(reSku, sku, true);
console.log("--- SKU inválidos (data/samples) ---");
for (const sku of SKUS_INVALIDOS) checkMatch(reSku, sku, false);
```

Por qué cae cada inválido:

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/05-validar-datos.ts
//  "pz-1234"   → minúsculas, [A-Z] exige mayúsculas        → falla
//  "PZ-12"     → 2 dígitos, \d{4} exige 4                   → falla
//  "PZA-1234"  → 3 letras, [A-Z]{2} exige exactamente 2     → falla
//  "PZ-12345"  → 5 dígitos, \d{4}$ no admite el 5.º         → falla
//  "PZ1234"    → falta el guion separador                   → falla
//  "P-1234"    → 1 letra, [A-Z]{2} exige 2                  → falla
```

---

## 3) Código de estado HTTP — rango 100–599

Un status válido tiene 3 dígitos y empieza en `1..5` (1xx info, 2xx ok, 3xx redirect, 4xx error cliente, 5xx error servidor). Patrón `^[1-5]\d{2}$`: `[1-5]` acota el primer dígito (descarta 0xx y 6xx+), `\d{2}` son los otros dos.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/05-validar-datos.ts
const reHttpStatus = /^[1-5]\d{2}$/;
checkMatch(reHttpStatus, "200", true);
checkMatch(reHttpStatus, "404", true);
checkMatch(reHttpStatus, "503", true);
checkMatch(reHttpStatus, "099", false);  // empieza en 0 → no es familia válida
checkMatch(reHttpStatus, "600", false);  // 6xx no existe como familia estándar
checkMatch(reHttpStatus, "20", false);   // solo 2 dígitos
checkMatch(reHttpStatus, "2000", false); // 4 dígitos (el $ lo atrapa)
```

---

## 4) Mini-caso combinado: etiqueta de versión `vN.N`

Combina literal + clase + cuantificador + **escape del punto**. `^v\d+\.\d+$`: una `v`, uno o más dígitos, un punto LITERAL (`\.`), más dígitos.

> ⚠️ El `\.` es clave: un punto sin escapar sería "cualquier caracter".

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/05-validar-datos.ts
const reVersion = /^v\d+\.\d+$/;
checkMatch(reVersion, "v1.0", true);
checkMatch(reVersion, "v12.34", true);
checkMatch(reVersion, "v1", false);    // falta ".N"
checkMatch(reVersion, "v1x0", false);  // 'x' no es el punto literal exigido
checkMatch(reVersion, "1.0", false);   // falta la 'v' inicial
```

---

## 5) Verificación de propiedad: TODOS los válidos pasan, NINGÚN inválido

Cierre estilo QA: en vez de confiar en la vista, lo afirmamos como dato.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/05-validar-datos.ts
const todosValidosPasan = SKUS_VALIDOS.every((s) => reSku.test(s));
const ningunInvalidoPasa = SKUS_INVALIDOS.every((s) => !reSku.test(s));
check("todos los SKU válidos pasan reSku", todosValidosPasan, true);
check("ningún SKU inválido pasa reSku", ningunInvalidoPasa, true);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-clases-cuantificadores/05-validar-datos.ts
```

---

## Qué observar

- Un validador serio es siempre clase + cuantificador + `^...$`.
- Cada caracter especial fuera de `[]` (como el `.`) debe escaparse (`\.`) si lo quieres literal.
- Probar contra un dataset de inválidos es lo que evita el falso positivo: no basta con que pasen los válidos.

⬅️ Anterior: [2.4 Greedy vs Lazy](/docs/regex/m2-greedy-vs-lazy) · ➡️ Siguiente: [🚩 Reto M2](/docs/regex/m2-reto)
