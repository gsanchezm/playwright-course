# 2.6 — Síntesis del Módulo 2

> **Módulo 2 · CSS Atributos y combinadores**

> **Analogía QA:** cerramos el módulo igual que cierras un test run: con un resumen de lo verificado. Ya sabes enganchar elementos por sus **datos** (atributos) y por su **vecindad** (combinadores), y distinguir un hook estable de uno frágil.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 2.1 Selectores de atributo | `[attr]` presencia vs `[attr="v"]` exacto; el atributo como dato limpio. |
| 2.2 Operadores de atributo | `^= $= *= ~= \|=` y flag `i`; `*=` subcadena ≠ `~=` palabra; `\|=` es idioma, no "empieza con". |
| 2.3 Descendiente vs hijo | Espacio (cualquier nivel) vs `>` (un nivel); el `>` es frágil ante wrappers. |
| 2.4 Hermanos | `+` adyacente vs `~` general; solo hacia adelante; N del mismo tipo → N−1 con `~`. |
| 2.5 Selectores estables | Testid dinámico con `^=`; el contrato del testid vs la clase hash `css-*`. |
| 🚩 Reto | Capturar 2 sociales (`data-social`) y 4 add-to-cart (`^=`) con conteo exacto. |

---

> 🌉 **Puente a Playwright**
> - **`page.locator('[data-testid^="pizza-card-"]')`** — los operadores de atributo viven igual dentro del `locator`.
> - **`page.getByTestId('...')`** — azúcar sobre `data-testid`, el contrato estable de este módulo.

Todos estos selectores son **CSS estándar**: Playwright los delega al motor del navegador sin traducción. Lo que aprendiste offline con jsdom transfiere 1:1 a la app live.

---

## 🧠 Síntesis e insights clave — Módulo 2

- Engánchate a **datos** (`data-testid`, `data-category`, `data-sold-out`), no a clases visuales ni a posiciones: el atributo es un contrato; la clase de estilo es andamiaje.
- Para valores **dinámicos** usa operadores: `^=` (prefijo), `$=` (sufijo), `*=` (subcadena), `~=` (palabra), `|=` (idioma). El `=` exacto solo sirve cuando el valor es fijo.
- Cuidado con `*=` (subcadena cruda: `badge` ⊂ `cart-badge`) y con `|=` (es "exacto `v` o `v-`", **no** "empieza con": para eso está `^=`).
- Los combinadores describen **estructura**: el espacio (descendiente) resiste remaquetados; el `>` (hijo directo) es frágil. Los hermanos (`+`, `~`) solo miran **hacia adelante**.

---

⬅️ Anterior: [🚩 Reto M2](/docs/css-xpath/m2-reto)
