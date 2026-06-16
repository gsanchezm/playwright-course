# 6.1 — Validar datos de prueba del mundo real

> **Módulo 6 · Regex en pruebas**

> **Analogía QA:** eres el **guardia de la puerta** de tu suite. Antes de que un dato entre a un test (un email, un teléfono, un UUID), lo revisas con una regex igual que un validador de formulario revisa la entrada del usuario. Si el formato es basura, lo rechazas **antes** de que rompa algo.

---

## ¿Qué aprendes?

- La **regla de oro** de toda validación: anclar con `^ ... $`.
- A construir validadores realistas para **emails, teléfonos por mercado, fechas ISO, UUID v4, JWT y URLs**.
- Por qué un validador "casi válido" sin anclas es un test que pasa por las razones equivocadas.
- A preferir **un regex específico por caso** en vez de un mega-regex frágil.

---

## La regla de oro: SIEMPRE anclar con `^ ... $`

`.test()` busca una **subcadena**: si encuentra una porción del texto que cumple el patrón, devuelve `true` aunque haya basura alrededor. Casi todos los datos inválidos del mundo real son "casi válidos": contienen dentro de sí algo que sí cumple. Por ejemplo, `"++52 ..."` **contiene** `"+52 ..."`. Solo `^...$` lo rechaza.

En QA: un validador sin anclas es un **falso positivo** esperando a pasar. Anclar = afirmar sobre **todo** el dato, no sobre un pedazo.

---

## 1) Emails

La trampa clásica es usar `\S+` para las partes. `\S` incluye `@`, así que `"ana@@x.com"` pasaría (el `\S+` se traga el segundo `@`). Usamos `[^@\s]+` ("uno o más caracteres que **no** sean `@` ni espacio"), y exigimos al menos un punto seguido de TLD con `(\.[^@\s]+)+`.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
const reEmail = /^[^@\s]+@[^@\s]+(\.[^@\s]+)+$/;

console.log("--- Emails válidos ---");
for (const email of EMAILS_VALIDOS) checkMatch(reEmail, email, true);
console.log("--- Emails inválidos ---");
for (const email of EMAILS_INVALIDOS) checkMatch(reEmail, email, false);
```

Por qué cada inválido cae:

| Dato | Razón |
|------|-------|
| `ana@` | no hay dominio tras `@` |
| `@example.com` | no hay parte local antes de `@` |
| `ana@@x.com` | `[^@\s]+` no admite el 2.º `@` |
| `plainaddress` | no hay `@` |
| `ana@dominio` | falta `\.` + TLD |
| `ana .tester@x.com` | el espacio en la parte local rompe |

---

## 2) Teléfonos por mercado

Los 4 formatos son **muy** distintos: `"+1 (415) 555-0123"` no se parece a `"+81 3-1234-5678"`. En vez de un mega-regex frágil, construimos **un regex por mercado**, anclado y específico a su forma real. Es más legible y más honesto: cada mercado tiene su contrato.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
const RE_TELEFONO_POR_MERCADO: Record<Mercado, RegExp> = {
  // +52 55 1234 5678
  MX: /^\+52 \d{2} \d{4} \d{4}$/,
  // +1 (415) 555-0123
  US: /^\+1 \(\d{3}\) \d{3}-\d{4}$/,
  // +41 44 668 18 00
  CH: /^\+41 \d{2} \d{3} \d{2} \d{2}$/,
  // +81 3-1234-5678
  JP: /^\+81 \d-\d{4}-\d{4}$/,
};
```

Para los **inválidos** usamos un validador "internacional general": debe empezar con **un solo** `+`, un prefijo de 1–3 dígitos, y luego al menos 6 caracteres de "relleno telefónico" (dígitos, espacios, guiones y paréntesis). El mínimo `{6,}` descarta un prefijo suelto como `"+52"`.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
const reTelInternacional = /^\+\d{1,3}[\d ()-]{6,}$/;
for (const tel of TELEFONOS_INVALIDOS) checkMatch(reTelInternacional, tel, false);
//  "55 1234 5678"        → no empieza con +        → falla
//  "+52"                 → solo prefijo, sin grupos → falla
//  "++52 55 1234 5678"   → doble +, ^\+\d exige 1   → falla
//  "tel: 5512345678"     → empieza con 'tel:'       → falla
```

> 💡 `\d` en JavaScript es **ASCII** por defecto (no incluye dígitos de otros alfabetos). Aquí los teléfonos son ASCII, así que `\d` está bien.

---

## 3) Fechas ISO 8601

La trampa: `\d{2}-\d{2}` aceptaría mes 13 y día 40. Validamos **rangos** reales:

- mes = `0[1-9] | 1[0-2]`
- día = `0[1-9] | [12]\d | 3[01]`

La parte de hora es **opcional** (`(...)?`), con segundos fraccionarios opcionales `(\.\d+)?` y zona `Z` o `±hh:mm`.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
const reFechaISO =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-](0\d|1[0-4]):[0-5]\d))?$/;

for (const f of FECHAS_ISO_VALIDAS) checkMatch(reFechaISO, f, true);
for (const f of FECHAS_ISO_INVALIDAS) checkMatch(reFechaISO, f, false);
//  "2026-13-40"       → mes 13 y día 40 fuera de rango       → falla
//  "16/06/2026"       → separador '/' y orden D/M/Y          → falla
//  "2026-6-1"         → mes y día sin cero a la izquierda     → falla
//  "2026-06-16 14:30" → espacio en vez de 'T' + sin segundos → falla
```

---

## 4) UUID v4

La clave de "v4" está en **dos nibbles fijos**:

- el 1.er dígito del 3.er bloque debe ser `4` (versión),
- el 1.er dígito del 4.º bloque debe ser `[89ab]` (variante RFC 4122).

Un regex flojo `[0-9a-f-]{36}` aceptaría una v1 o una variante mala. Usamos la flag `i` para tolerar mayúsculas.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
const reUuidV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

for (const u of UUIDS_V4_VALIDOS) checkMatch(reUuidV4, u, true);
for (const u of UUIDS_V4_INVALIDOS) checkMatch(reUuidV4, u, false);
//  "...-11d4-..."   → versión '1' donde exigimos '4' → falla
//  "...-c567-..."   → variante 'c' fuera de [89ab]    → falla
//  "not-a-uuid"     → no es hex con esa estructura     → falla
//  sin guiones       → faltan los '-' separadores       → falla
```

---

## 5) Estructura de JWT

No validamos la **firma criptográfica** (eso no es trabajo de regex), solo la **estructura**: tres segmentos base64url separados por punto. El alfabeto base64url es `[A-Za-z0-9_-]` (guion y guion-bajo en vez de `+` y `/`). Cada segmento debe tener al menos un carácter.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
const reJwt = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

checkMatch(reJwt, JWT_VALIDO, true);
for (const j of JWTS_INVALIDOS) checkMatch(reJwt, j, false);
//  "abc.def"      → solo 2 partes               → falla
//  "eyJ....J9.payload" → solo 2 partes (falta firma) → falla
//  "no-es-un-jwt" → 0 puntos, una sola parte      → falla
```

---

## 6) URLs

Esquema `http`/`https`, `"://"`, un host con al menos un punto (o `localhost`), puerto opcional y un resto opcional (path/query/fragment). Trampa: `"http://"` sin host debe fallar, así que exigimos al menos un host.

```ts
// @file regex-qa-course/modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
const reUrl =
  /^https?:\/\/(localhost|[A-Za-z0-9.-]+\.[A-Za-z]{2,})(:\d+)?(\/[^\s]*)?$/;

for (const u of URLS_VALIDAS) checkMatch(reUrl, u, true);
for (const u of URLS_INVALIDAS) checkMatch(reUrl, u, false);
//  "htp:/bad"      → esquema mal escrito y un solo '/' → falla
//  "justtext"      → no hay esquema ni '://'           → falla
//  "://nohost.com" → falta el esquema antes de '://'   → falla
//  "http://"       → no hay host tras '://'             → falla
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-regex-en-pruebas/01-validar-datos-de-prueba.ts
```

---

## Qué observar

- **Anclar siempre.** Sin `^...$`, un dato "casi válido" cuela y tu test pasa por la razón equivocada.
- Para formatos muy distintos (teléfonos), **un regex por caso** gana al mega-regex: más legible y honesto.
- Validar **rangos** (mes 01–12, día 01–31) atrapa basura que un `\d{2}` deja pasar.
- En UUID y JWT, los **caracteres fijos** (la versión `4`, los dos puntos) son los que dan rigor.

➡️ Siguiente: [6.2 Parsear logs y traces](/docs/regex/m6-parsear-logs-y-traces)
