# 1.6 — Síntesis del Módulo 1

> **Módulo 1 · Fundamentos**

> **Analogía QA:** cerramos el módulo igual que cierras un test run: con un resumen de lo verificado. Ya tienes la base para escribir reglas de texto reutilizables y hacerles las preguntas correctas.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 1.1 ¿Qué es una regex? | Una regla declarativa de texto; `.test()` da el sí/no; es case-sensitive. |
| 1.2 Crear una regex | Literal `/.../` (estático) vs `new RegExp("...")` (dinámico) y el doble escapado. |
| 1.3 Métodos básicos | `test`, `search`, `match`, `replace`, `split` — distintas preguntas a la misma regla. |
| 1.4 Literales y el punto | La mayoría es literal; `.` es comodín; escapa metacaracteres con `\`. |
| 1.5 Dónde aparece en QA | Locators, URLs, filtros de CI, validación y parseo de logs; anclas `^ $` y alternancia `|`. |
| 🚩 Reto | Validar ambiente exacto (`QA` / `UAT` / `PROD`) con anclas + alternancia. |

---

> 🌉 **Puente a otros lenguajes**
> - **Java:** `Pattern.compile(...).matcher(s).find()` / `.matches()`
> - **Python:** `re.search(...)` / `re.fullmatch(...)`

En todos los lenguajes la idea es la misma: defines un patrón y eliges entre "¿aparece en alguna parte?" (`find` / `search` / `.test`) o "¿el string completo cumple?" (`matches` / `fullmatch` / anclado con `^…$`).

---

## 🧠 Síntesis e insights clave — Módulo 1

- Una regex es una **regla declarativa** de texto: describes el *qué* (el patrón), no el *cómo* recorrer el string.
- `.test()` es el **check más barato** (sí/no): úsalo cuando solo necesitas un veredicto binario.
- Literal `/.../` vs `new RegExp("...")` según el **origen del patrón**: estático (lo escribes fijo) vs dinámico (lo construyes desde datos en runtime).

---

⬅️ Anterior: [Reto M1](/docs/regex/m1-reto)
