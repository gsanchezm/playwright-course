# 5.5 — Enmascarar PII con lookaround + `replace`

> **Módulo 5 · Lookaround**

> **Analogía QA:** es el **marcador negro sobre el documento** antes de mandarlo a un log. En QA jamás debes filtrar datos personales (PII) a un reporte, un screenshot o un snapshot. El lookaround te deja tapar todo MENOS la pista mínima útil (los últimos 4 dígitos de la tarjeta, la inicial del correo), sin borrar la estructura que necesitas para depurar.

---

## ¿Qué aprendes?

- Cómo enmascarar un número de tarjeta dejando solo los últimos 4 dígitos (el clásico PCI-DSS).
- Cómo combinar un **lookbehind** con una función `replacer` para tapar un email conservando su inicial.
- La variante de "scrubbing total": sustituir toda la PII por un placeholder cuando ni la inicial debe filtrarse.

---

## Concepto

El lookaround brilla con `replace` porque, al ser de **ancho cero**, te permite decidir **qué** sustituir basándote en el contexto, sin tocar los caracteres del contexto. Así puedes enmascarar dígitos pero conservar los espacios, o tapar un correo dejando intacta su primera letra.

---

## Código

```ts
// @file regex-qa-course/modulo-05-lookaround/05-enmascarar-pii.ts
// 1) TARJETAS: dejar SOLO los últimos 4 dígitos (PCI-DSS clásico)
// El patrón: /\d(?=(?:\D*\d){4})/g
//   \d                un dígito (el candidato a enmascarar)
//   (?=            )   lookahead: "mirando adelante..."
//     (?:\D*\d){4}     ...todavía quedan AL MENOS 4 dígitos por delante
//                      (\D* salta espacios/separadores entre cada dígito)
// Traducción QA: "tapa este dígito SOLO si aún hay 4 o más dígitos después
// de él". Los últimos 4 NO cumplen → se quedan visibles.
const reEnmascararTarjeta = /\d(?=(?:\D*\d){4})/g;

const tarjeta0 = TARJETAS[0].replace(reEnmascararTarjeta, "*");
const tarjeta1 = TARJETAS[1].replace(reEnmascararTarjeta, "*");
// "4111 1111 1111 1111" → conserva los 4 últimos ("1111").
check("tarjeta 0 deja últimos 4", tarjeta0, "**** **** **** 1111");
// "5500 0000 0000 0004" → conserva "0004".
check("tarjeta 1 deja últimos 4", tarjeta1, "**** **** **** 0004");

// Y NO debe quedar ningún dígito "de más" visible: deben ser exactamente 4.
const digitosVisibles = (tarjeta0.match(/\d/g) ?? []).length;
check("solo 4 dígitos quedan visibles", digitosVisibles, 4);
```

> 💡 Como el lookahead es de ancho cero, los **espacios nunca se tocan**: solo sustituimos dígitos por `*`. Por eso la forma `**** **** **** 1111` sigue siendo legible.

```ts
// @file regex-qa-course/modulo-05-lookaround/05-enmascarar-pii.ts
// 2) EMAIL en una línea de log: tapar el dominio, dejar la inicial
// Queremos enmascarar "ana.tester@omnipizza.test" a "a***@***" para que el
// log siga siendo útil (sabes que HUBO un correo y su inicial) sin exponer
// el resto.
//
// Patrón del email: /(?<=\S)([^\s@]*)@(\S+)/
//   (?<=\S)   lookbehind: el correo empieza tras un caracter no-espacio
//             (la inicial), que dejamos FUERA del match para conservarla.
//   ([^\s@]*) resto de la parte local (lo que va después de la inicial).
//   @         la arroba literal.
//   (\S+)     el dominio completo (no-espacios).
const reEmailEnLog = /(?<=\S)([^\s@]*)@(\S+)/;
const logEnmascarado = LINEA_LOG_CON_EMAIL.replace(
  reEmailEnLog,
  // El replacer recibe (match, restoLocal, dominio). Tapamos resto local
  // y dominio; la inicial ya quedó intacta gracias al lookbehind.
  (_match, _restoLocal: string, _dominio: string) => "***@***"
);
check(
  "email enmascarado en la línea de log",
  logEnmascarado,
  "2026-06-16T14:30:05Z [INFO] user a***@*** logged in from MX"
);
// Aserciones de seguridad: el resultado NO debe contener PII del correo.
check("ya no aparece el dominio real", logEnmascarado.includes("omnipizza.test"), false);
check("ya no aparece el usuario completo", logEnmascarado.includes("ana.tester"), false);
```

```ts
// @file regex-qa-course/modulo-05-lookaround/05-enmascarar-pii.ts
// 3) Variante simple: enmascarar el correo COMPLETO con un placeholder
// A veces ni la inicial debe filtrarse. Aquí no hace falta lookaround:
// detectamos el correo y lo sustituimos entero por "<EMAIL>".
const reEmailCompleto = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const logTotal = LINEA_LOG_CON_EMAIL.replace(reEmailCompleto, "<EMAIL>");
check(
  "email reemplazado por placeholder total",
  logTotal,
  "2026-06-16T14:30:05Z [INFO] user <EMAIL> logged in from MX"
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-lookaround/05-enmascarar-pii.ts
```

---

## Qué observar

- El patrón de tarjeta `\d(?=(?:\D*\d){4})` enmascara cada dígito que **todavía tiene 4 dígitos por delante**. Por definición, los últimos 4 no cumplen, así que sobreviven. El `\D*` salta los espacios sin tocarlos.
- El lookbehind `(?<=\S)` deja la **primera letra** del correo fuera del match para conservarla; el `replacer` solo sustituye el resto local y el dominio.
- Las aserciones de seguridad (`includes(...) === false`) son tan importantes como el resultado: confirman que la PII **realmente** desapareció, no solo que el formato quedó bonito.
- Cuando ni la inicial puede filtrarse, no necesitas lookaround: una regex de email global + `<EMAIL>` hace el scrubbing total.

---

⬅️ Anterior: [5.4 Política de contraseñas](/docs/regex/m5-password-policy) · ➡️ Siguiente: [🚩 Reto del Módulo 5](/docs/regex/m5-reto)
