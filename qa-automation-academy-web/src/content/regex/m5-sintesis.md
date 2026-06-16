# 5.6 — Síntesis del Módulo 5: Lookaround

> **Módulo 5 · Lookaround**

> **Analogía QA:** el lookaround es el `expect(...).toBeVisible()` de las regex: **aseveras** algo sobre el contexto sin interactuar con él. Confirmas que la condición se cumple y sigues adelante, sin "consumir" lo que verificaste.

---

## Lo que cubrimos

| Mini-clase | Herramienta | Para qué |
|---|---|---|
| 5.1 | Lookahead positivo `(?=...)` | afirmar "viene seguido de X" sin consumir X |
| 5.2 | Lookahead negativo `(?!...)` | afirmar "NO viene seguido de X" (lista negra) |
| 5.3 | Lookbehind `(?<=...)` / `(?<!...)` | afirmar lo que va justo antes; extraer tras una etiqueta |
| 5.4 | Múltiples lookahead | validaciones compuestas (AND), como la política de contraseñas |
| 5.5 | Lookaround + `replace` | enmascarar PII conservando la estructura |

---

## 🌉 Puente a otros lenguajes

- **Lookbehind:** Python `re` exige **ancho fijo**; Java permite **ancho acotado**; JavaScript permite **ancho variable**. El mismo `(?<=Precio:\s*)\d+` que funciona en Node fallaría en Python `re`.
- El módulo **`regex`** de Python (paquete externo, no el estándar `re`) sí admite lookbehind de ancho variable: es la alternativa más flexible cuando necesitas portar estos patrones a Python.

---

## 🧠 Síntesis e insights clave — Módulo 5

- El lookaround **asevera sobre el contexto sin consumirlo**.
- Ideal para **validaciones compuestas** (p.ej. política de contraseñas).
- Ojo con la **portabilidad del lookbehind** entre motores.

---

## Errores comunes que ya sabes evitar

- Pensar que el lookahead "se lleva" lo que verifica: es de **ancho cero**, no entra en el match.
- Olvidar el backtracking: `\d+(?!px)` no basta; necesitas `\d+(?!\d*px)` para cerrar las posiciones intermedias.
- Asumir que tu lookbehind variable es portable: en motores de ancho fijo, **no** lo es.
- Enmascarar y dar por hecho que la PII desapareció: añade siempre aserciones de seguridad (`includes(...) === false`).

---

⬅️ Anterior: [🚩 Reto del Módulo 5](/docs/regex/m5-reto)
