# 🧠 Síntesis — Módulo 6: Regex en pruebas

> **Módulo 6 · Regex en pruebas**

> **Analogía QA:** terminaste de armar tu cinturón de herramientas para QA. Ya sabes **validar** la entrada, **leer** los logs cuando algo revienta, **estabilizar** los snapshots y **transformar** texto a tu antojo. Esto es el día a día de quien automatiza pruebas en serio.

---

## Lo que construiste en este módulo

- **Validar datos de prueba** (6.1): un guardia de la puerta con regex ancladas para email, teléfono, fecha ISO, UUID v4, JWT y URL.
- **Parsear logs y traces** (6.2): extraer el test fallido, contar warnings y descomponer el stack trace en `archivo:línea:columna`.
- **Scrubbing de snapshots** (6.3): reemplazar datos volátiles por placeholders estables para matar los tests intermitentes.
- **Validación data-driven** (6.4): una tabla de casos + un bucle = una matriz de regresión que crece con cada bug.
- **Replace avanzado** (6.5): `$<nombre>`, función replacer, `matchAll` y `replaceAll`.

---

## 🌉 Puente a otros lenguajes

Lo que aprendiste en JavaScript/TypeScript se traduce casi directo a otros stacks de automatización:

- **`String.replaceAll` vs flag `g`:** en JS, `replaceAll` reemplaza **todas** las ocurrencias; si le pasas una regex, esta **debe** llevar la flag `g` (de lo contrario lanza `TypeError`). Con `replace` y `g`, el efecto es el mismo. Es el equivalente de "global" en cualquier motor de regex.

- **Java — `Matcher.replaceAll` con `${nombre}`:** Java soporta grupos nombrados en el reemplazo con la sintaxis `${nombre}` (en JS es `$<nombre>`). Reordenar una fecha ISO sería `matcher.replaceAll("${dia}/${mes}/${anio}")`.

- **Python — `re.sub` con función de reemplazo:** igual que la **función replacer** de JS, `re.sub(patron, funcion, texto)` deja que una función calcule cada reemplazo. Recibe el objeto `match` y devuelve el string a insertar — el mismo patrón que usaste para aplicar el IVA del 16 %.

> 💡 La sintaxis cambia entre lenguajes, pero los **conceptos** (anclar, grupos nombrados, replacer, global) son universales. Aprendiste el modelo mental, no solo la sintaxis de JS.

---

## 🧠 Síntesis e insights clave — Módulo 6

- **Regex + data-driven = matriz de regresión de validación.** La regla vive una vez; los casos viven en una tabla que crece cada vez que cazas un bug.
- **El scrubbing estabiliza snapshots** (mata los intermitentes). Mides estructura, no ruido.
- **Un replacer-función desbloquea transformaciones complejas.** Cuando un string fijo no alcanza (calcular, numerar, transformar), la función es la salida.

---

⬅️ Anterior: [🚩 Reto M6](/docs/regex/m6-reto)
