# Módulo 6: Generador de Código (Codegen)

> **Objetivo:** Usar la herramienta `playwright codegen` para grabar tus acciones manuales en un navegador y obtener código TypeScript generado automáticamente, listo para pegar en un test.

> **Referencia oficial:** [codegen-intro](https://playwright.dev/docs/codegen-intro) · [codegen](https://playwright.dev/docs/codegen)

---

## 🎯 Analogía principal

> **Codegen es como grabar un "video" de tu sesión de pruebas manuales, pero en vez de un video, obtienes el código TypeScript del test equivalente.**
>
> Antes (pruebas manuales):
> 1. Abres el navegador.
> 2. Haces click.
> 3. Escribes.
> 4. Documentas los pasos en Word/Excel.
>
> Con codegen:
> 1. Abres `pnpm codegen`.
> 2. Haces click.
> 3. Escribes.
> 4. **Playwright te genera el código automáticamente en una ventana lateral.**

---

## 1. Comando básico

```bash
$ pnpm codegen
```

Esto ejecuta: `playwright codegen https://playwright.dev`.

Abre 2 ventanas:
- **Izquierda:** un navegador Chromium con la URL.
- **Derecha:** el **Inspector** con el código TypeScript que se va generando en tiempo real mientras tú interactúas con la página.

## 2. Iniciar en una URL específica

```bash
$ pnpm exec playwright codegen https://demo.playwright.dev/todomvc
```

## 3. Grabar en un navegador específico

```bash
$ pnpm exec playwright codegen --browser=firefox https://playwright.dev
$ pnpm exec playwright codegen --browser=webkit https://playwright.dev
```

## 4. Grabar emulando un dispositivo móvil

```bash
$ pnpm exec playwright codegen --device="iPhone 13" https://playwright.dev
```

## 5. Grabar con viewport custom

```bash
$ pnpm exec playwright codegen --viewport-size=1920,1080 https://playwright.dev
```

## 6. Guardar el código en un archivo

```bash
$ pnpm exec playwright codegen --output=mi-test.spec.ts https://playwright.dev
```

## 7. Modo "target-language"

Codegen puede generar código en varios lenguajes:

```bash
$ pnpm exec playwright codegen --target=javascript
$ pnpm exec playwright codegen --target=python
$ pnpm exec playwright codegen --target=java
$ pnpm exec playwright codegen --target=csharp
```

---

## 📋 Pasos explícitos para explicar en clase

1. **Corre `pnpm codegen`** en vivo.
2. **Haz click en "Get started"** en playwright.dev. Muestra el código generado: `await page.getByRole('link', { name: 'Get started' }).click()`.
3. **Haz click en varios lugares** y muestra cómo el código se va acumulando.
4. **Punto clave:** codegen **usa preferentemente `getByRole`, `getByLabel`, etc.** (los locators recomendados del Módulo 4). Señala esto al grupo.
5. **Usa el botón "Pick locator"** (icono de mira 🎯 arriba del Inspector). Haz click en cualquier elemento de la página y muestra cómo te da el selector exacto.
6. **Usa el botón "Record"** para pausar/reanudar la grabación.
7. **Usa el botón "Assert visibility"** para generar un `expect(...).toBeVisible()` automáticamente.
8. **Usa el botón "Assert text"** para generar un `expect(...).toHaveText(...)`.
9. **Copia el código completo** con el botón de copiar y pégalo en un archivo `.spec.ts` del curso.
10. **Corre el test generado** y muestra que funciona.

---

## ⚠️ Advertencias importantes

1. **Codegen NO reemplaza pensar.** Genera código bruto. Siempre debes:
   - Revisar que los locators sean los más apropiados.
   - Agregar assertions significativas (no solo `toBeVisible`).
   - Refactorizar en Page Objects si el test es complejo.
   - Parametrizar los datos hardcoded.

2. **Los selectores generados por codegen son "buenos, no perfectos".** A veces genera un `getByText('Submit')` cuando debería ser un `getByRole('button', { name: 'Submit' })`. Revisa siempre.

3. **No uses codegen para tests repetitivos.** Para data-driven, usa el módulo 5. Codegen es para **prototipar** un test nuevo rápido.

4. **No pegues el código sin entender.** Si copias sin leer, cuando algo falle no sabrás por qué.

---

## 💡 Workflow recomendado en la vida real

1. Abres `pnpm codegen https://tu-app.com` y haces el flujo manual.
2. Copias el código generado a un nuevo archivo `.spec.ts`.
3. **Refactorizas:**
   - Renombras el test con un nombre descriptivo.
   - Sustituyes datos hardcoded por fixtures o JSON.
   - Extraes selectores repetidos en variables o Page Objects (Módulo 10).
   - Agregas assertions específicas al final.
4. Corres el test en UI mode (`pnpm test:ui`) para verificar que funciona.
5. Lo commiteas.

---

➡️ Siguiente: [reto.md](./reto.md)
