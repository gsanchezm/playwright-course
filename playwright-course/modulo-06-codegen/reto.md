# Reto — Módulo 6: Codegen

## Reto 6.1 — Tu primer test grabado

1. Ejecuta: `pnpm exec playwright codegen https://demo.playwright.dev/todomvc`
2. En el navegador que se abre:
   - Agrega 3 todos: "Aprender codegen", "Practicar selectores", "Revisar resultados".
   - Marca el segundo como completado (check).
   - Haz click en el filtro "Completed".
3. Observa el código generado en el Inspector.
4. Copia el código a un archivo `modulo-06-codegen/grabado.spec.ts`.
5. Corre el test: `pnpm test modulo-06-codegen/grabado.spec.ts`.

**✅ Resultado esperado:** el test pasa en los 3 navegadores.

---

## Reto 6.2 — Refactorización

Después del reto 6.1, toma tu `grabado.spec.ts` y refactorízalo:

1. Dale un nombre descriptivo al test (no "test").
2. Agrega un `test.describe('Suite TodoMVC grabado', () => { ... })` envolviendo el test.
3. Al final del flujo, agrega una assertion explícita: `await expect(page.getByTestId('todo-title')).toHaveCount(1)` (porque filtraste solo los completados).
4. Corre de nuevo y verifica que sigue pasando.

---

## Reto 6.3 — Assertions generadas

1. Ejecuta `pnpm codegen` apuntando a `https://playwright.dev`.
2. En el Inspector, busca los 3 botones de assertions:
   - **Assert visibility** 👁
   - **Assert text** 📝
   - **Assert value** 📥
3. Haz click en "Assert visibility" y luego click en el logo de Playwright.
4. Haz click en "Assert text" y luego click en el heading principal. Escribe el texto esperado.
5. Copia el código generado y observa cómo Playwright creó los `expect(...).toBeVisible()` y `expect(...).toHaveText(...)` automáticamente.

---

## Reto 6.4 — Codegen en otro dispositivo

```bash
$ pnpm exec playwright codegen --device="iPhone 13" https://playwright.dev
```

1. Graba un flujo de navegación corto.
2. Observa cómo el navegador emula el tamaño y touch events de un iPhone.
3. Guarda el código en `modulo-06-codegen/mobile.spec.ts`.

---

## Reto 6.5 — Preguntas

1. ¿Por qué codegen no es un reemplazo completo del trabajo del automatizador?
2. ¿Qué es el botón "Pick locator" y cuándo lo usarías?
3. Generaste un test con codegen que tiene `page.locator('.btn-primary').click()`. ¿Qué harías con ese selector antes de commitearlo?
4. ¿En qué situación usarías codegen en tu trabajo real?

**Respuestas:**

1. Porque genera código bruto sin semántica, sin assertions significativas, con datos hardcoded y sin estructura POM. Siempre necesitas **revisar, refactorizar y parametrizar** lo generado.
2. Es una herramienta que te permite apuntar visualmente a cualquier elemento de la página y te da el locator recomendado de Playwright. Lo usarías cuando quieres saber **"cómo localizo este elemento"** sin tener que inspeccionar el HTML manualmente.
3. Reemplazarlo con un locator semántico como `getByRole('button', { name: '...' })` o pedirle al dev que agregue `data-testid`. Las clases CSS como `.btn-primary` cambian mucho entre deploys.
4. Cuando tengo que **prototipar rápidamente** un test nuevo en una página que no conozco bien, para luego refactorizar. También cuando estoy explorando el DOM de una app nueva y quiero "descubrir" los locators correctos.

---

## ✅ Checklist

- [ ] Grabé mi primer test con `pnpm codegen`.
- [ ] Refactoré el test grabado para que sea profesional.
- [ ] Usé el botón "Pick locator" para obtener selectores.
- [ ] Usé los botones de assertions para generar `expect(...)` automáticamente.
- [ ] Entiendo cuándo codegen es útil y cuándo NO.

➡️ Siguiente: [Módulo 7: Reports](../modulo-07-reports/)
