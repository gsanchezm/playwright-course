# Reto — Módulo 1: Visión General

## Reto 1.1 — Instalación completa

1. Ejecuta `pnpm install` desde `playwright-course/`.
2. Ejecuta `pnpm exec playwright install`.
3. Verifica con `pnpm exec playwright --version`.

**✅ Resultado esperado:** ves una versión `1.47.x` o superior.

---

## Reto 1.2 — Tu primer test

Corre el test del `ejemplo.md`:

```bash
$ pnpm test modulo-01-vision-general/hello.spec.ts
```

**✅ Resultado esperado:** 6 tests verdes (2 tests × 3 navegadores).

---

## Reto 1.3 — Rompe y arregla

1. Abre `hello.spec.ts`.
2. Cambia `/Playwright/` por `/Cypress/` y guarda.
3. Corre el test.
4. Observa el error.
5. Restaura el valor original y corre de nuevo.

**✅ Resultado esperado:** primero fallan 3 tests con un mensaje claro del assertion; luego pasan los 3.

---

## Reto 1.4 — Abre el reporte HTML

Después del reto anterior:

```bash
$ pnpm report
```

Explora el reporte en tu navegador. Encuentra:
- El tiempo que tardó cada test.
- La captura del error del test que fallaste.
- El botón "Show trace" del test fallido.

---

## Reto 1.5 — Preguntas teóricas

1. ¿Por qué Playwright descarga sus propios navegadores en vez de usar los que ya tienes instalados?
2. ¿Qué significa "fullyParallel: true" en el `playwright.config.ts`?
3. ¿En cuántos navegadores corrió tu test del Reto 1.2 y por qué?
4. ¿Cuál es la diferencia conceptual entre `browser`, `context` y `page`?

**Respuestas:**

1. Para garantizar que los tests corran **exactamente igual** en tu laptop, en la de un compañero y en CI. Evita bugs del tipo "a mí me pasa pero a ti no".
2. Que los archivos de test se ejecutan en paralelo usando varios workers, lo que acelera el suite completo.
3. En 3 (Chromium, Firefox, WebKit) porque `playwright.config.ts` tiene 3 proyectos definidos en `projects:`.
4. `browser` es el navegador completo; `context` es un perfil aislado (cookies, storage) dentro de ese navegador — como abrir una ventana incógnito; `page` es una pestaña dentro del context.

---

## ✅ Checklist

- [ ] Playwright y los 3 navegadores están instalados.
- [ ] Corrí mi primer test con éxito.
- [ ] Exploré el reporte HTML.
- [ ] Entiendo la diferencia entre `browser`, `context` y `page`.
- [ ] Sé qué es Playwright y por qué lo usaríamos en vez de Selenium.

➡️ Siguiente: [Módulo 2: Anotaciones Básicas](../modulo-02-anotaciones/)
