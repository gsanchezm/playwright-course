# Módulo 02 — Locators + Data tipada

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** `types/omnipizza.d.ts` + `data/users.json` + `data/markets.json`. El smoke de M01 se parametriza con `test.each()` contra los 4 mercados.

---

## Analogía de apertura

Un tester manual siempre trae consigo una **hoja de datos de prueba** (usuarios, ambientes, mercados). En este módulo construimos esa hoja como **JSON tipado** y la conectamos al TC con `test.each()` — un mismo caso ejecutado con N sets de datos distintos, como una matriz de regresión.

---

## ¿Qué aprenderás?

1. **Jerarquía de locators** con criterios de cuándo bajar nivel.
2. **Filtros y combinadores:** `.filter()`, `.nth()`, `locator.all()`.
3. **Iterar locators** con `for...of` para recorrer listas reales (pizzas del catálogo).
4. **`interface` como contrato:** User, Market, Pizza — fallan en compile-time si el JSON no cumple.
5. **`test.each<T>()`** para data-driven.
6. **`import type`** — traer sólo la forma, no el código.

---

## Jerarquía de locators (regla del curso)

Escríbelo como escribirías un **bug report bien hecho**:

| Prioridad | Locator | Cuándo usarlo | Ejemplo |
|---|---|---|---|
| 1️⃣ | `getByRole` | Casi siempre. Es accesible y semántico. | `page.getByRole('button', { name: 'Pagar' })` |
| 2️⃣ | `getByLabel` / `getByText` | Formularios y contenido visible. | `page.getByLabel('Email')` |
| 3️⃣ | `getByTestId` | Cuando el DOM no coopera y el dev cooperó. | `page.getByTestId('pizza-card-123')` |
| 4️⃣ | CSS selectors | Cuando los testids son dinámicos o no existen. | `page.locator('[data-testid^="pizza-card-"]')` |
| 5️⃣ | XPath | Último recurso. Frágil. | `page.locator('//button[@data-ready]')` |

**Importante:** CSS y XPath **no están prohibidos**. Están al final porque son frágiles, no porque sean inválidos. En OmniPizza usamos CSS con prefijo (`[data-testid^="pizza-card-"]`) para los testids dinámicos — es legítimo.

---

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| `interface User` | Contrato Swagger: un User DEBE tener username, password, role |
| `test.each<Market>(markets)('...', ...)` | Matriz de regresión: 1 TC × 4 mercados = 4 ejecuciones |
| `import type { User }` | Sólo traigo la forma, no el código |
| `locator.all()` | Obtener el array de locators — como pedir todas las filas de una tabla |
| `.filter({ hasText: 'Spicy' })` | Filtrar por componente en Jira |
| `.nth(0)` | La primera fila de resultados |

---

## Paso a paso

1. Revisa `types/omnipizza.d.ts` — ahí viven los contratos.
2. Revisa `data/markets.json` y `data/users.json`.
3. Ejecuta el ejemplo:
   ```bash
   pnpm m2
   ```
4. Observa: **un solo test** corre 4 veces, una por mercado.
5. Resuelve el reto: añadir un 5º mercado sin tocar código del spec.

---

## Comandos útiles

```bash
pnpm m2
pnpm exec playwright test modulo-02-locators-data --headed
pnpm typecheck                                   # verifica tipos sin correr tests
pnpm exec playwright test --grep "@smoke"        # filtrar por tag
```

---

## Outcome esperado

- [ ] Entiendes la jerarquía de locators y **por qué** no todo es `getByRole`.
- [ ] Puedes leer `markets.json` y explicar cómo el test lo consume.
- [ ] Sabes añadir un 5º mercado **sin tocar el spec**.
- [ ] Reconoces cuándo un CSS selector es legítimo.
