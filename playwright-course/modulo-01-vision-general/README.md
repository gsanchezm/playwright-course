# Módulo 1: Playwright — Visión General

> **Objetivo pedagógico:** Que el alumno sepa qué es Playwright, por qué existe, en qué se diferencia de Selenium/Cypress, y cómo se instala en su máquina.

> **Referencia oficial:** [playwright.dev/docs/intro](https://playwright.dev/docs/intro)

---

## 🎯 Analogía principal

> **Playwright es como tu "mano robótica" controlando un navegador.** Así como tú —tester manual— haces click, escribes, validas, y tomas captura en una sesión de pruebas exploratoria, Playwright hace lo mismo pero **mil veces más rápido**, sin cansarse, y produciendo evidencia (screenshots, videos, trazas) automáticamente.

Otras analogías útiles para la clase:

| Concepto | Analogía QA |
|----------|-------------|
| **Playwright** | Tu reemplazo robótico para el 80% de pruebas regresivas manuales aburridas |
| **`page`** | La pestaña del navegador que estás probando |
| **`browser`** | El navegador completo (como abrir Chrome) |
| **`context`** | Un perfil de navegador aislado (como abrir ventana incógnito) |
| **`locator`** | El selector que usa el robot para "apuntar" al elemento (como el dedo del tester) |
| **`expect`** | El "paso de validación" en tu caso de prueba manual |

---

## 1. ¿Qué es Playwright?

**Playwright** es un framework open source de Microsoft para automatizar navegadores web (Chromium, Firefox, WebKit) con **una sola API**. Nació en 2020 y hoy compite directamente con Cypress y Selenium como la opción más moderna para pruebas E2E.

Características clave:

- ✅ **Cross-browser real:** Chromium, Firefox y WebKit (el motor de Safari).
- ✅ **Cross-platform:** Windows, macOS, Linux, CI.
- ✅ **Cross-language:** TypeScript/JavaScript, Python, Java, .NET.
- ✅ **Auto-waiting:** espera automáticamente a que los elementos estén listos antes de interactuar.
- ✅ **Network interception:** puedes mockear APIs desde el mismo test.
- ✅ **Trace Viewer:** herramienta visual para depurar tests fallidos con video + DOM + red.
- ✅ **Mobile emulation:** emula dispositivos móviles (iPhone, Pixel, etc.).
- ✅ **Codegen:** graba tus acciones manuales y genera código TypeScript.

---

## 2. Playwright vs Selenium vs Cypress

| Característica | Playwright | Cypress | Selenium |
|----------------|:---------:|:-------:|:--------:|
| Multi-navegador real | ✅ Chromium, Firefox, WebKit | ⚠️ Limitado (sin WebKit real) | ✅ Todos |
| Multi-tab / multi-origen | ✅ | ❌ | ✅ |
| Auto-wait | ✅ | ✅ | ❌ |
| Velocidad | 🚀 Muy rápido | 🚀 Muy rápido | 🐌 Lento |
| Debugger integrado | ✅ Trace Viewer | ✅ | ⚠️ Externo |
| API testing | ✅ | ⚠️ Limitado | ❌ |
| Mobile emulation | ✅ | ❌ | ⚠️ |
| Curva de aprendizaje | Media | Baja | Alta |
| Lenguajes | TS/JS, Py, Java, .NET | Solo JS/TS | Muchos |

> 💡 **Cuándo elegir Playwright:** proyectos nuevos, equipos modernos, pruebas cross-browser, equipos que ya usan TypeScript, proyectos que combinan UI + API testing.

---

## 3. Arquitectura básica de un test

Cada test de Playwright sigue esta estructura:

```typescript
import { test, expect } from '@playwright/test';

test('nombre descriptivo del caso de prueba', async ({ page }) => {
  // 1. Arrange — navegar y preparar
  await page.goto('https://playwright.dev');

  // 2. Act — interactuar
  await page.getByRole('link', { name: 'Get started' }).click();

  // 3. Assert — validar
  await expect(page).toHaveTitle(/Installation/);
});
```

**Analogía QA:** Esto es el patrón **AAA** (Arrange-Act-Assert) que ya conoces de casos de prueba manuales:

1. **Arrange** (preparar): "abre el navegador y ve a la página X".
2. **Act** (actuar): "haz click en el botón Y".
3. **Assert** (validar): "verifica que el título contenga Z".

---

## 4. Instalación

### 4.1 Prerrequisitos
- Node.js v18 o superior.
- pnpm instalado globalmente (`npm install -g pnpm`).

### 4.2 Instalar dependencias del curso

```bash
$ cd playwright-course
$ pnpm install
```

Esto lee el `package.json` e instala `@playwright/test`.

### 4.3 Instalar los navegadores

Playwright descarga sus propias versiones de Chromium, Firefox y WebKit (no usa los que tienes instalados). Es intencional: garantiza que el test corra igual en tu laptop y en el CI.

```bash
$ pnpm exec playwright install
```

Tamaño aproximado: ~300 MB la primera vez.

### 4.4 Verificar la instalación

```bash
$ pnpm exec playwright --version
Version 1.47.0
```

---

## 5. Estructura del proyecto del curso

```
playwright-course/
├── package.json              # dependencias y scripts
├── playwright.config.ts      # configuración global del suite
├── tsconfig.json             # compilador TypeScript
├── .gitignore                # ignora node_modules, reports, etc.
├── README.md                 # guía del curso
├── modulo-01-vision-general/
├── modulo-02-anotaciones/
├── modulo-03-ejecuciones/
└── ...
```

**Analogía QA:** `playwright.config.ts` es el "archivo maestro" del suite. Como si tuvieras un archivo central donde dices: "mis pruebas corren contra `https://qa.miapp.com`, con 2 reintentos en CI, guardando screenshots solo cuando fallan". Antes lo hacías con Excel o JIRA — ahora lo declaras en código versionado.

---

## 6. Primer test: "Hello Playwright"

Crea un archivo `modulo-01-vision-general/hello.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('homepage de Playwright tiene el título correcto', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
```

**Ejecutarlo:**

```bash
$ pnpm test modulo-01-vision-general/hello.spec.ts
```

**Resultado esperado:**
```
Running 3 tests using 3 workers
  ✓  [chromium] › modulo-01-vision-general/hello.spec.ts:3:5 › homepage... (1.2s)
  ✓  [firefox]  › modulo-01-vision-general/hello.spec.ts:3:5 › homepage... (1.5s)
  ✓  [webkit]   › modulo-01-vision-general/hello.spec.ts:3:5 › homepage... (1.8s)

  3 passed (3.8s)
```

> 💡 El mismo test corre automáticamente en los 3 navegadores porque así está configurado en `playwright.config.ts`.

---

## 📋 Pasos explícitos para explicar en clase

1. **Abre la diapositiva de la analogía principal.** Habla 2 minutos sobre "Playwright es tu mano robótica".
2. **Muestra la tabla comparativa** Playwright vs Cypress vs Selenium. Pregunta: "¿cuál usan en su empresa hoy?".
3. **Muestra el patrón AAA** en código. Recuérdales del curso de TypeScript que ya vieron `async/await`.
4. **Corre `pnpm install` en vivo.** Aprovecha el tiempo de descarga para hablar de las ventajas de tener navegadores empaquetados.
5. **Corre `pnpm exec playwright install`.** Explica por qué son ~300 MB (3 navegadores × 100 MB cada uno).
6. **Crea `hello.spec.ts` desde cero en vivo.** No lo pegues — escríbelo línea por línea explicando cada parte.
7. **Corre el test.** Muestra que corre en 3 navegadores.
8. **Rompe el test a propósito** (cambia el `toHaveTitle` a `/Cypress/`) y muéstrale al grupo cómo se ve un fallo.
9. **Arregla y cierra** mostrando el reporte HTML con `pnpm report`.
10. **Envía a reto.md.**

---

## Resumen

- Playwright es un framework E2E moderno, rápido y cross-browser.
- Tiene API unificada para Chromium, Firefox y WebKit.
- Un test sigue el patrón **Arrange-Act-Assert**.
- `playwright.config.ts` centraliza la configuración del suite.
- El comando `pnpm exec playwright install` descarga los navegadores.

➡️ Siguiente: [reto.md](./reto.md)
