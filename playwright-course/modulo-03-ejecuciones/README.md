# Módulo 3: Ejecuciones

> **Objetivo:** Dominar las múltiples formas de ejecutar tests en Playwright según el momento del día: mientras desarrollas, cuando debuggeas, en CI, etc.

> **Referencia oficial:** [running-tests](https://playwright.dev/docs/running-tests) · [debug](https://playwright.dev/docs/debug) · [test-ui-mode](https://playwright.dev/docs/test-ui-mode)

---

## 🎯 Analogía principal

> **Las distintas formas de ejecutar tests son como los distintos "modos" de una prueba manual:**
> - **Headless** = ejecutar en tu cabeza (rápido, sin distracción).
> - **Headed** = hacer la prueba mirando la pantalla (lento pero puedes ver).
> - **Debug mode** = hacer la prueba con un compañero mirando por encima de tu hombro, pausando en cada paso.
> - **UI mode** = hacer la prueba con una interfaz gráfica que te muestra cada click y el estado del DOM.
> - **Por tag (`--grep`)** = ejecutar solo los casos marcados como "smoke" o "críticos".
> - **Por proyecto** = correr la misma suite en Chrome, Firefox y Safari.

---

## 1. Modos de ejecución: headless vs headed

### Headless (default)
Playwright ejecuta el navegador **sin mostrar la ventana**. Es más rápido y se usa en CI y en ejecuciones regulares.

```bash
$ pnpm test                                    # todos los tests en headless
$ pnpm test modulo-02-anotaciones               # solo un módulo
```

### Headed
Abre el navegador visible. Útil cuando quieres **ver** qué está haciendo el robot.

```bash
$ pnpm test:headed
$ pnpm test --headed modulo-02-anotaciones/01-test-basico.spec.ts
```

> 💡 **Tip:** usa `--headed` con `--workers=1 --project=chromium` para ver una sola ventana, un test a la vez, sin caos visual.

```bash
$ pnpm test --headed --workers=1 --project=chromium modulo-02-anotaciones
```

---

## 2. Ejecutar UN solo test

```bash
# Todo un archivo
$ pnpm test modulo-02-anotaciones/01-test-basico.spec.ts

# Un test específico por nombre (match de texto)
$ pnpm test -g "caso simple"

# Test en una línea específica del archivo
$ pnpm test modulo-02-anotaciones/01-test-basico.spec.ts:15
```

**Analogía QA:** Es como decirle al robot: "ignora el resto del plan, hoy solo me importa el caso de login válido".

---

## 3. Ejecutar por tag (`--grep`)

Tu `06-tags-smoke-regression.spec.ts` del módulo 2 ya etiqueta tests con `@smoke`, `@regression`, etc.

```bash
$ pnpm test --grep @smoke            # solo los @smoke
$ pnpm test --grep @regression       # solo los @regression
$ pnpm test --grep "@smoke|@critical" # @smoke O @critical
$ pnpm test --grep-invert @slow       # TODOS menos los @slow
```

Equivalente con scripts pre-configurados:
```bash
$ pnpm test:smoke       # alias para --grep @smoke
$ pnpm test:regression  # alias para --grep @regression
```

---

## 4. Debug Mode (`--debug`)

Abre el **Playwright Inspector**: una ventana lateral que te permite pausar, avanzar paso a paso y explorar el DOM.

```bash
$ pnpm test:debug modulo-02-anotaciones/01-test-basico.spec.ts
```

**Qué te permite el Inspector:**
- ⏸ **Pausar** en cualquier momento con `await page.pause()`.
- ⏭ **Step over** línea por línea.
- ▶️ **Resume** hasta el próximo breakpoint.
- 🎯 **Pick locator**: seleccionas visualmente un elemento y te da el selector exacto.
- 📋 **Explore DOM**: inspeccionas el árbol HTML actual.

### Poner un breakpoint en el código

```typescript
test('ejemplo con pausa', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.pause(); // ⏸ el test se detiene aquí y abre el Inspector
  await page.getByRole('link', { name: 'Get started' }).click();
});
```

**Analogía QA:** `page.pause()` es como decir "alto, déjame revisar manualmente qué pasa antes de continuar". Como cuando en una prueba manual dices "espera, voy a verificar la consola del navegador".

---

## 5. UI Mode (el favorito para aprender y desarrollar)

**El modo más poderoso de Playwright.** Abre una interfaz gráfica donde ves:
- Lista de todos tus tests.
- Timeline de cada paso (como un video).
- Screenshot del DOM en cada paso.
- Logs, red, consola.
- Watch mode: re-corre automáticamente al guardar cambios.

```bash
$ pnpm test:ui
```

**Cosas que puedes hacer en UI Mode:**
1. Hacer click en un test → lo corre y muestra la grabación paso a paso.
2. Hover sobre un paso → te muestra cómo se veía el DOM en ese momento.
3. Activar "watch mode" 👁 → cada vez que guardas el archivo, re-corre automáticamente el test.
4. Usar el "pick locator" para copiar el selector de cualquier elemento.

> 💡 **Recomendación del instructor:** cuando estés desarrollando un nuevo test, usa SIEMPRE `pnpm test:ui`. No hay nada más productivo.

---

## 6. Proyectos: correr en varios navegadores

En tu `playwright.config.ts` hay 4 proyectos definidos: `chromium`, `firefox`, `webkit`, `mobile-chrome`.

```bash
# Todos los proyectos (default)
$ pnpm test

# Solo uno
$ pnpm test --project=chromium
$ pnpm test --project=firefox
$ pnpm test --project=webkit
$ pnpm test --project=mobile-chrome

# Varios específicos
$ pnpm test --project=chromium --project=webkit
```

**Analogía QA:** Es como repetir la misma prueba manual en Chrome, Firefox y Safari. La diferencia es que el robot lo hace en paralelo y en 10 segundos.

---

## 7. Reintentos (`--retries`)

```bash
# Reintentar hasta 2 veces los tests que fallen
$ pnpm test --retries=2
```

En `playwright.config.ts` ya está configurado: en CI hace 2 reintentos, local 0.

> ⚠️ **Cuidado con los reintentos:** son una curita, no una cura. Si un test necesita reintentos para pasar, es **flaky** y debes arreglarlo, no esconderlo.

---

## 8. Workers y paralelismo

```bash
# Forzar 1 worker (útil para debug y ver ventanas headed)
$ pnpm test --workers=1

# Forzar 4 workers
$ pnpm test --workers=4
```

Por defecto Playwright usa tantos workers como núcleos tengas.

---

## 📋 Pasos explícitos para explicar en clase

1. **Explica headless vs headed** con la analogía de "prueba mental vs mirando la pantalla".
2. **Corre los mismos tests en headless**, luego en headed, para que el grupo vea la diferencia visual.
3. **Muestra `pnpm test -g "caso simple"`** para correr por nombre.
4. **Demuestra los tags:** `pnpm test --grep @smoke`. Explica por qué esto es crucial en un pipeline de CI de empresa.
5. **Debug mode:** añade un `await page.pause()` a un test y corre con `pnpm test:debug`. Muestra el Inspector y el "Pick locator".
6. **UI Mode:** ⭐ **esta es la parte más impresionante del módulo.** Abre `pnpm test:ui`, corre un test, muestra el timeline, activa watch mode, modifica el test guardando y ven cómo se re-ejecuta solo.
7. **Proyectos:** corre `pnpm test --project=firefox` y muestra que es el mismo test en otro navegador.
8. **Envía al reto.**

---

## 🗒 Cheatsheet de comandos

| Comando | Uso |
|---------|-----|
| `pnpm test` | Todos los tests, headless, todos los proyectos |
| `pnpm test:ui` | ⭐ Modo UI interactivo (recomendado para desarrollo) |
| `pnpm test:headed` | Con ventanas de navegador visibles |
| `pnpm test:debug` | Abre el Inspector con breakpoints |
| `pnpm test --grep @smoke` | Solo tests con tag @smoke |
| `pnpm test --project=firefox` | Solo en Firefox |
| `pnpm test -g "nombre"` | Por nombre (match de texto) |
| `pnpm test archivo.spec.ts:15` | Test de la línea 15 del archivo |
| `pnpm test --workers=1` | Un solo worker (útil para headed) |
| `pnpm test --retries=2` | 2 reintentos por test |
| `pnpm report` | Abre el último reporte HTML |

➡️ Siguiente: [reto.md](./reto.md)
