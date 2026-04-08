# Reto — Módulo 10: Page Object Model

## Reto 10.1 — Extender el TodoMvcPage

Agrega estos métodos a `pages/TodoMvcPage.ts`:

1. `async getActiveCount(): Promise<number>` — devuelve el número que muestra "X items left" en el footer.
2. `async filterActive(): Promise<void>` — click en el filtro "Active".
3. `async filterCompleted(): Promise<void>` — click en el filtro "Completed".
4. `async filterAll(): Promise<void>` — click en el filtro "All".

Pista: los filtros son `getByRole('link', { name: 'Active' })`, etc.

---

## Reto 10.2 — Usar los nuevos métodos

Crea un nuevo archivo `tests/todomvc.filters.spec.ts` con 3 tests que:

1. Agreguen 3 todos y validen que `getActiveCount()` devuelve 3.
2. Marquen uno como completado y validen que `getActiveCount()` devuelve 2.
3. Click en "Completed" y validen que solo hay 1 todo visible.

---

## Reto 10.3 — Crear un Page Object para playwright.dev

Crea `pages/PlaywrightDevPage.ts` extendiendo `BasePage` con:

- Selectores privados para: link "Get started", link "Docs", link "API", heading principal.
- Métodos públicos:
  - `async clickGetStarted(): Promise<void>`
  - `async clickDocs(): Promise<void>`
  - `async clickApi(): Promise<void>`
  - `async isHeadingVisible(): Promise<boolean>`

Crea un archivo `tests/playwright-dev.spec.ts` con 2 tests que usen tu nuevo POM.

---

## Reto 10.4 — Refactorizar tests viejos

Toma el archivo `modulo-02-anotaciones/02-describe-agrupacion.spec.ts` y reescríbelo usando el POM del reto 10.3. Los tests deberían ser casi idénticos en comportamiento pero MUY diferentes en apariencia.

---

## Reto 10.5 — Preguntas

1. ¿Por qué los selectores del POM son `private` y no `public`?
2. ¿Por qué los métodos del POM NO deberían contener `expect(...)`?
3. ¿Cuál es la ventaja de heredar de `BasePage` en vez de copiar los métodos comunes en cada POM?
4. Tu compañera creó un POM con un método `getLoginButton(): Locator` que devuelve el locator. ¿Por qué es una mala práctica?

**Respuestas:**

1. Para ocultar los detalles de implementación (los `#login-btn`, `.css-1x2y3z`, etc.) del resto del código. Si un selector cambia, solo el POM se afecta, no los tests. Esto es **encapsulación** — un principio fundamental de POO.
2. Porque mezcla responsabilidades: el POM debe **hacer acciones** y el test debe **validar**. Si el POM tiene assertions, se vuelve más difícil reutilizarlo en tests con distintas expectativas. (Hay escuelas que discrepan, pero es la convención más común.)
3. Reutilización y mantenibilidad. Si mañana agregas un método `waitForToast()` a `BasePage`, TODOS los POMs lo tienen gratis. Y si hay un bug en `waitForLoad()`, lo arreglas en un solo lugar.
4. Porque expone los locators al test, rompiendo la encapsulación. Si el test puede obtener el locator, también puede hacer `.click()` o `.fill()` y el POM pierde control. Mejor: método público `clickLogin()` que hace el click internamente.

---

## ✅ Checklist

- [ ] Extendí TodoMvcPage con nuevos métodos.
- [ ] Creé un Page Object para playwright.dev.
- [ ] Refactoré un test viejo usando el POM.
- [ ] Entiendo la jerarquía BasePage → PageObjectEspecífico.
- [ ] Sé por qué los selectores deben ser privados.

➡️ Siguiente: [Módulo 11: IA en Testing](../modulo-11-ia/)
