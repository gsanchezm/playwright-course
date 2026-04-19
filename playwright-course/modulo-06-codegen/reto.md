# Reto — Módulo 6: Codegen contra OmniPizza

## Reto 6.1 — Tu primer test grabado

1. Ejecuta: `pnpm codegen`
2. En la ventana del navegador:
   - Click en el quick-login `standard_user` (o llena username/password a mano).
   - Click en **Sign In**.
   - En `/catalog`: click en el primer botón **Add to Cart** de cualquier pizza.
3. Observa el código generado en el Inspector.
4. Copia el código a `modulo-06-codegen/grabado.spec.ts`.
5. Corre: `pnpm test modulo-06-codegen/grabado.spec.ts --project=chromium`.

**✅ Resultado esperado:** el test pasa en Chromium.

---

## Reto 6.2 — Refactorización

Toma tu `grabado.spec.ts` del reto 6.1 y refactorízalo:

1. Dale un **nombre descriptivo** al test (no "test").
2. Envuelvelo en `test.describe('Carrito de OmniPizza', () => { ... })`.
3. Agrega tags `@smoke @critical`.
4. Agrega una assertion final: `expect(page.getByTestId('nav-cart-count')).toContainText('1')`.
5. Reemplaza los locators de codegen por otros más robustos si aplica.
6. Corre de nuevo y verifica que siga pasando.

---

## Reto 6.3 — Assertions generadas por codegen

1. Arranca `pnpm codegen` contra OmniPizza.
2. En el Inspector, identifica los 3 botones de assertion:
   - **Assert visibility** 👁
   - **Assert text** 📝
   - **Assert value** 📥
3. Haz login y en `/catalog` usa:
   - **Assert visibility** sobre el logo del navbar.
   - **Assert text** sobre el texto de una categoría (ej. "Popular").
4. Copia el código y pégalo en otro spec. Obsérvalo: son `expect(...)` válidos.

---

## Reto 6.4 — Codegen en mobile

```bash
pnpm exec playwright codegen --device="iPhone 13" https://omnipizza-frontend.onrender.com
```

1. Graba el mismo flujo de login.
2. Observa cómo los **testids cambian a `-responsive`** — ese es el sufijo que el hook `tid()` aplica a viewport <768px.
3. Guarda en `modulo-06-codegen/mobile.spec.ts`.
4. Corre con `--project=mobile-chrome`.

---

## Reto 6.5 — Pick Locator

Arranca `pnpm codegen`. Usa el botón **🎯 Pick locator**:

1. Apunta al logo "OmniPizza Logo" del login. ¿Qué locator sugiere? (Debería ser `getByAltText(...)`).
2. Apunta a la bandera de México. ¿Qué locator sugiere?
3. Apunta al botón `performance_glitch_user`. ¿Qué locator sugiere?

**✅ Resultado esperado:** observas que codegen prefiere `getByRole`, `getByText`, `getByAltText`, `getByTestId` sobre selectores CSS crudos. Eso valida la "pirámide de prioridad" del M4.

---

## Reto 6.6 — Preguntas

1. ¿Por qué codegen no reemplaza el trabajo del automatizador?
2. Al grabar en mobile viewport, el testid de Sign In fue distinto. ¿Cómo lo harías viewport-agnóstico?
3. Si codegen generó `page.locator('.btn-primary').click()`, ¿qué harías antes de commitear?

**Respuestas:**

1. Porque genera código **bruto** sin structure (no fixtures, no POM), con datos hardcoded, sin assertions significativas y sin paramétrización. Siempre hay que **revisar y refactorizar**.
2. Creas un helper `tid(page, base)` como el de `modulo-04-localizadores/07-get-by-test-id.spec.ts` que calcula el sufijo `-desktop` o `-responsive` según el viewport.
3. Lo reemplazas por un locator semántico (`getByRole`, `getByTestId`) o pides al equipo front que agregue un `data-testid` estable. Las clases Tailwind como `.btn-primary` cambian con refactors.

---

## ✅ Checklist

- [ ] Grabé un test contra OmniPizza con `pnpm codegen`.
- [ ] Refactoré el test: nombre, tags, assertion.
- [ ] Usé los 3 botones de assertion del Inspector.
- [ ] Probé codegen en modo mobile y noté el cambio de testids.
- [ ] Usé **Pick Locator** para descubrir selectores.

➡️ Siguiente: [Módulo 7 — Reports](../modulo-07-reports/)
