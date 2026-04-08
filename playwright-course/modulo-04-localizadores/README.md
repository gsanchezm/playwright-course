# Módulo 4: Localizadores de Objetos

> **Objetivo:** Dominar las formas RECOMENDADAS de localizar elementos con Playwright (`getByRole`, `getByLabel`, `getByText`, `getByTestId`, `getByPlaceholder`), entender por qué son mejores que CSS/XPath, y aprender filtros y encadenamiento.

> **Referencia oficial:** [locators](https://playwright.dev/docs/locators) · [best practices](https://playwright.dev/docs/best-practices#use-locators)

---

## 🎯 Analogía principal

> **Un locator es tu "dedo apuntador".** En una prueba manual tú dices: "click en el botón _Agregar al carrito_". Un locator es exactamente eso: una forma de describirle al robot cuál es ese botón.
>
> La pregunta clave es: **¿cómo lo describes?**
> - ❌ "el tercer `<button>` de la segunda `<div>` con clase `.container`" → frágil, cambia mañana.
> - ✅ "el botón que se llama 'Add to cart'" → robusto, refleja lo que ve el usuario.

Los localizadores de Playwright están diseñados para reflejar **cómo un humano o un lector de pantalla** describiría el elemento. Si tu test puede romperse cuando un diseñador mueve una `div`, tu selector está mal.

---

## Jerarquía de preferencia (⭐ aprende esta lista de memoria)

Playwright recomienda usar los localizadores **en este orden de preferencia**:

| Prioridad | Locator | Cuándo usarlo | Ejemplo |
|:---------:|---------|---------------|---------|
| 🥇 1 | `getByRole` | **SIEMPRE que puedas.** Refleja lo que ven lectores de pantalla. | Botones, links, inputs, headings |
| 🥈 2 | `getByLabel` | Inputs de formulario con su `<label>`. | Campos de texto con etiqueta visible |
| 🥉 3 | `getByPlaceholder` | Inputs sin label pero con placeholder. | Cajas de búsqueda |
| 4 | `getByText` | Cuando lo único único es el texto visible. | Mensajes de error, texto descriptivo |
| 5 | `getByAltText` | Imágenes con alt. | Logos, iconos importantes |
| 6 | `getByTitle` | Elementos con `title` tooltip. | Iconos con tooltip |
| 7 | `getByTestId` | Último recurso recomendado. Requiere que devs agreguen `data-testid`. | Elementos sin semántica clara |
| 😬 8 | `locator(css)` | Úsalo cuando nada más funciona. | Selectores CSS tradicionales |
| 👻 9 | XPath | Último recurso absoluto. | Cuando Dios te ha abandonado |

---

## Archivos del módulo (modular)

| Archivo | Concepto | Sitio de pruebas |
|---------|----------|------------------|
| [01-get-by-role.spec.ts](./01-get-by-role.spec.ts) | `getByRole` — el mejor locator | playwright.dev |
| [02-get-by-text.spec.ts](./02-get-by-text.spec.ts) | `getByText` — match exacto y parcial | playwright.dev |
| [03-get-by-label.spec.ts](./03-get-by-label.spec.ts) | `getByLabel` — inputs con label | demo.playwright.dev/todomvc |
| [04-get-by-placeholder.spec.ts](./04-get-by-placeholder.spec.ts) | `getByPlaceholder` — inputs sin label | demo.playwright.dev/todomvc |
| [05-get-by-test-id.spec.ts](./05-get-by-test-id.spec.ts) | `getByTestId` — cuando no hay semántica | demo.playwright.dev/todomvc |
| [06-css-y-xpath.spec.ts](./06-css-y-xpath.spec.ts) | CSS y XPath — cuándo caer aquí | playwright.dev |
| [07-filtros-y-chaining.spec.ts](./07-filtros-y-chaining.spec.ts) | `filter`, `.nth()`, `.first()`, chaining | demo.playwright.dev/todomvc |
| [reto.spec.ts](./reto.spec.ts) | Retos del alumno | — |

---

## 📋 Pasos explícitos para explicar en clase

1. **Empieza con la tabla de prioridad.** Haz que el grupo la copie en su cuaderno.
2. **Abre `01-get-by-role.spec.ts`** y corre `pnpm test:ui modulo-04-localizadores/01-get-by-role.spec.ts`. Demuestra en vivo cómo el test encuentra el elemento.
3. **Usa el "Pick locator" del UI mode** para mostrar que cualquier elemento de una página tiene múltiples formas de ser localizado, y Playwright sugiere siempre la más semántica.
4. **Ve archivo por archivo** mostrando cada locator en acción.
5. **En `06-css-y-xpath`** haz énfasis: "esto existe, pero NUNCA es la primera opción".
6. **En `07-filtros-y-chaining`** usa el TodoMVC real: agrega 3 todos, muestra cómo seleccionar el "segundo" con `.nth(1)` o con `.filter({ hasText: 'X' })`.
7. **Envía al reto.**

---

## 🔑 Regla de oro

> Antes de escribir cualquier locator, pregúntate: **"¿cómo describiría un usuario ciego este elemento con un lector de pantalla?"**. Esa descripción es casi siempre tu mejor locator.

➡️ Empieza por [01-get-by-role.spec.ts](./01-get-by-role.spec.ts).
