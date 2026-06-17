# Síntesis — Módulo 7: CSS vs XPath y resiliencia

> **Módulo 7 · CSS vs XPath y resiliencia**

> **Analogía QA:** este módulo es el salto de "saber escribir selectores" a "saber escribir selectores que aguanten producción". Igual que un tester junior valida el *happy path* y un senior piensa en mantenibilidad, aquí cerraste el círculo: un selector no solo debe **encontrar** el elemento, debe seguir encontrándolo **después del próximo refactor**.

---

## El recorrido del módulo

| Lección | Idea central |
| --- | --- |
| **7.1 Tabla comparativa** | Solo XPath va por **texto** y hacia **arriba** (padre/ancestro/ejes); CSS gana en rendimiento, legibilidad y **multi-clase** nativa. |
| **7.2 Clase exacta en XPath** | `[@class="X"]` falla con multi-clase; el idioma correcto es la **clase acolchada** `contains(concat(' ', normalize-space(@class), ' '), ' X ')`. En CSS, `.X` ya es exacto. |
| **7.3 Rendimiento y fragilidad** | **Poda el eje** (ancla + descendiente corto); el XPath **absoluto** es frágil. `:nth-of-type(3)` **no** es "la 3ª pizza". |
| **7.4 La escalera de resiliencia** | **testid › rol+nombre › texto › estructura.** Excepción real: inputs sin label rompen `getByRole` → placeholder/testid. |
| **7.5 Depurar contando** | Cuenta antes de codificar: **0** = ancla mal, **1** = listo, **N>1** = ambiguo. Ojo con el whitespace (`text()` vs `normalize-space`). |
| **🚩 Reto** | Reescribir un selector frágil (clase hash `css-*`) a uno resiliente (testid) que apunte al mismo nodo. |

---

## 🌉 Puente a Playwright / Selenium

Todo lo que practicaste offline con jsdom transfiere a la herramienta real, donde el comportamiento es la **verdad**:

- **Playwright** tiene la escalera incorporada: `getByTestId`, `getByRole`, `getByText`. Su motor `xpath=` delega en el `document.evaluate` del **navegador real** — XPath 1.0, igual que aquí.
- **El *strict mode* de Playwright** convierte el "conteo N>1" de 7.5 en un **error** explícito: si tu locator matchea más de uno, la prueba falla en vez de tomar el primero en silencio. Contar antes te ahorra ese error.
- **Selenium** usa el mismo XPath 1.0 del navegador: la clase acolchada de 7.2 y los ejes de 7.1 funcionan idénticos.

> ⚠️ **jsdom = aproximador de sintaxis; navegador/Playwright = verdad del comportamiento.** La única divergencia conocida es la indexación con paréntesis `(//x)[n]`, que jsdom evalúa como `//x[n]` (por-padre). En el navegador, Playwright y Selenium es correcta. Por eso no comprobamos `(//x)[n]` con `check()` contra jsdom.

---

## 🧠 Síntesis e insights clave — Módulo 7

- **CSS y XPath no compiten: se reparten el trabajo.** Usa CSS por defecto (rápido, legible, multi-clase); baja a XPath solo cuando necesitas **texto**, **padre/ancestro** o **ejes** que CSS no tiene.
- **La resiliencia es una escalera, no un gusto.** testid › rol+nombre › texto › estructura. Baja un peldaño solo cuando el de arriba **de verdad** no aplica (inputs sin label, copy sin testid).
- **Lo verdaderamente avanzado es contar y dudar.** Antes de confiar en un selector, cuenta sus matches: 0 = ancla mal, N>1 = ambiguo. Y desconfía del **whitespace** y de las clases hash `css-*` que cambian en cada build.

---

⬅️ Anterior: [Reto M7](/docs/css-xpath/m7-reto)
