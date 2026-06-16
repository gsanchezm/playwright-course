# 7.2 — Mitigar ReDoS (cómo escribir regex que NO se cuelguen)

> **Módulo 7 · Avanzado y seguro**

> **Analogía QA:** en testing no esperas a que el bug llegue a producción para reaccionar; pones **guardas** antes (validación de entrada, límites, timeouts). Con ReDoS es igual: en vez de arriesgarte al backtracking catastrófico, **diseñas** el patrón para que no exista esa ambigüedad y pones una guarda de **longitud** antes de siquiera ejecutar la regex.

---

## ¿Qué aprendes?

- Las cuatro estrategias para escribir regex **a prueba de ReDoS** en JavaScript.
- Por qué **eliminar el anidamiento** suele ser suficiente.
- Por qué **anclar, ser específico y acotar** recorta el espacio de búsqueda.
- La guarda más barata y robusta: **validar la longitud** antes de la regex.

> ⚠️ Igual que en 7.1, aquí el input máximo es 12 caracteres. Demostramos versiones **seguras**; no reproducimos cuelgues.

---

## Estrategia 1 — Eliminar el cuantificador anidado solapado

`/(a+)+$/` es vulnerable. Pero "una o más `'a'`" se expresa **sin anidar**: simplemente `/^a+$/`. Mismo lenguaje aceptado, **cero** ambigüedad → cero backtracking exponencial. Esta es la mitigación #1 y casi siempre basta: si ves `(X+)+`, pregúntate si `X+` solo hace lo mismo (casi siempre sí).

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/02-mitigar-redos.ts
const REGEX_INSEGURA = /^(a+)+$/; // NO la corras contra texto largo.
const REGEX_SEGURA = /^a+$/; // equivalente, lineal, a prueba de ReDoS.

// Confirmamos (en input corto y seguro) que dan el MISMO veredicto:
check("insegura y segura coinciden en el caso válido",
  REGEX_INSEGURA.test(REDOS_INPUT_CORTO), REGEX_SEGURA.test(REDOS_INPUT_CORTO));
check("insegura y segura coinciden en el caso inválido",
  REGEX_INSEGURA.test(REDOS_INPUT_CORTO + "!"), REGEX_SEGURA.test(REDOS_INPUT_CORTO + "!"));
```

---

## Estrategia 2 — Anclar (`^ ... $`) y ser específico

Una regex sin anclas busca **subcadenas**, lo que multiplica los puntos de inicio que el motor prueba. Anclar reduce el espacio de búsqueda y, de paso, evita falsos positivos (lección de M04/M06). Especificar **clases estrechas** (`[0-9]` en vez de `.`) también recorta caminos que el motor exploraría.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/02-mitigar-redos.ts
// Validar un código "letra + dígitos", anclado y específico.
const reCodigo = /^[A-Z]\d{1,6}$/; // 1 letra + 1..6 dígitos, acotado.
checkMatch(reCodigo, "A123", true);
checkMatch(reCodigo, "A1234567", false); // 7 dígitos: el {1,6} lo corta.
checkMatch(reCodigo, "a123", false); // minúscula: rechazada por anclaje.
```

---

## Estrategia 3 — Acotar los cuantificadores (`{0,n}` en vez de `*` o `+`)

Un `*` o `+` abierto invita a reintentos **sin techo**. Si conoces el máximo real del dominio, ponlo: `{0,n}`. No solo es más seguro, también **documenta la regla de negocio**.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/02-mitigar-redos.ts
const reUsernameAbierto = /^[a-z0-9_]+$/; // sin techo
const reUsernameAcotado = /^[a-z0-9_]{1,20}$/; // techo explícito: máx. 20
checkMatch(reUsernameAcotado, "ana_qa_2026", true);
checkMatch(reUsernameAcotado, "aaaaaaaaaaaaaaaaaaaaa", false); // 21 chars → excede {1,20}
```

---

## Estrategia 4 — Validar la longitud ANTES de ejecutar la regex

La guarda más barata y robusta: si el input excede un máximo razonable, recházalo **sin pasar la regex**. Aunque el patrón fuera vulnerable, nunca le das un input suficientemente largo para que explote. Es **defensa en profundidad**: primero la longitud, luego el formato.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/02-mitigar-redos.ts
function validarConGuardaDeLongitud(re: RegExp, input: string, maxLen: number): boolean {
  if (input.length > maxLen) return false; // corto-circuito: ni ejecuta la regex
  return re.test(input);
}
// 10 chars pasan la guarda y la regex segura los acepta:
check("guarda longitud: 10 chars pasan y matchean",
  validarConGuardaDeLongitud(REGEX_SEGURA, REDOS_INPUT_CORTO, 12), true);
// 13 chars se rechazan por la GUARDA, sin ejecutar la regex:
check("guarda longitud: 13 chars se rechazan antes de la regex",
  validarConGuardaDeLongitud(REGEX_SEGURA, "a".repeat(13), 12), false);
```

---

## 🌉 Lo que otros lenguajes ofrecen (y JS no)

Algunos motores (PCRE, Java, .NET, Ruby) eliminan el backtracking de raíz con dos herramientas que **JavaScript no soporta**:

- **Grupos atómicos:** `(?>a+)` → una vez que matchean, **no** retroceden.
- **Cuantificadores posesivos:** `a++`, `a*+`, `(a+)++` → tampoco retroceden.

El motor de Node (V8) **no** tiene `a++` ni `(?>...)`. Por eso en JS la mitigación es **diseño** (sin anidar + anclar + acotar) **más guarda de longitud**. Saberlo te hace mejor QA cuando revises regex escritas para back-ends en otro stack.

---

## Qué observar

- La mejor mitigación es **no escribir la ambigüedad**: `(X+)+` casi siempre es `X+`.
- Anclar y acotar no solo es seguro: también **documenta** el dominio.
- La guarda de longitud protege **incluso** patrones que no controlas tú.

➡️ Siguiente: [7.3 Unicode y propiedades](/docs/regex/m7-unicode-y-propiedades)
