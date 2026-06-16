# Síntesis — Módulo 7: Avanzado y seguro

> **Módulo 7 · Avanzado y seguro**

> **Analogía QA:** este módulo es el salto de "saber escribir regex" a "saber escribir regex que aguanten producción". Igual que un tester junior valida el *happy path* y un senior piensa en seguridad, i18n y mantenibilidad, aquí cerraste el círculo: una regex no solo debe **funcionar**, debe ser **segura, internacional y revisable** — y a veces, lo correcto es **no usarla**.

---

## El recorrido del módulo

| Lección | Idea central |
| --- | --- |
| **7.1 Backtracking y ReDoS** | Un cuantificador anidado solapado (`(a+)+`) puede colgar el servidor: el ReDoS es un **bug de seguridad**. |
| **7.2 Mitigar ReDoS** | Sin anidar + anclar + acotar, más una **guarda de longitud** antes de ejecutar la regex. |
| **7.3 Unicode y propiedades** | `\w`/`\d` son ASCII; con datos internacionales usa `\p{L}`/`\p{N}` + flag `u`. `.length` miente con emojis. |
| **7.4 Regex mantenible** | JS no tiene flag `x`; arma el patrón por **piezas con nombre** (`new RegExp`) y hazlo **test-driven**. |
| **7.5 Cuándo NO usar regex** | HTML/JSON anidado → **parser**, no regex. Lo avanzado es saber cuándo soltarla. |

---

## 🌉 Puente a otros lenguajes

Lo que viste en JS tiene equivalentes (a veces más potentes) en otros motores. Conocerlos te hace mejor QA cuando revises regex de back-ends en otro stack:

- **Java:** grupos atómicos `(?>...)`, cuantificadores posesivos `++` (`a++`, `(a+)++`) y el modo de comentarios `(?x)`. Los grupos atómicos y posesivos **eliminan el backtracking de raíz**, así que el ReDoS de 7.1 ni siquiera existe ahí.
- **Python:** la flag `re.VERBOSE` / `re.X` (comentarios y espacios dentro del patrón, lo que JS **no** tiene) y el módulo de terceros `regex`, que sí soporta cuantificadores **posesivos**.
- **Lo que JavaScript NO tiene** de todo lo anterior: no hay `(?>...)`, no hay `a++`, no hay flag `x`/verbose. Por eso en JS la defensa anti-ReDoS es **diseño** (sin anidar + anclar + acotar) **más guarda de longitud**, y la mantenibilidad la logras con **piezas con nombre** en lugar del modo verbose.

---

## 🧠 Síntesis e insights clave — Módulo 7

- **Una regex insegura es un bug de seguridad (ReDoS).** Si toca input de usuario y tiene un cuantificador anidado solapado, es una puerta abierta a denegación de servicio.
- **`u` + `\p{...}` es obligatorio con datos internacionales.** `\w`/`\d` son ASCII; sin Unicode property escapes, rechazas clientes reales de México, Zürich o Tōkyō.
- **Lo verdaderamente avanzado es saber cuándo NO usar regex.** Para estructuras anidadas (HTML, JSON, código) la herramienta correcta es un parser; insistir con regex es la marca del junior.

---

➡️ Siguiente: [Síntesis global del curso](/docs/regex/sintesis-global)
