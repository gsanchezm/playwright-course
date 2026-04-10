# 07 — Playwright y sus navegadores

> **Solo necesario si vas a hacer el [curso de Playwright](../playwright-course/).**

> **Sitio oficial:** https://playwright.dev/
> **Docs de instalación:** https://playwright.dev/docs/intro

---

## ¿Qué se instala?

Playwright tiene 2 partes:

1. **`@playwright/test`** — la librería de testing (TypeScript). Se instala con `pnpm install` desde el `package.json` del curso.
2. **Los navegadores reales** — Chromium, Firefox y WebKit. Son binarios pesados (~300 MB) y se descargan con un comando aparte.

> 💡 Playwright **NO usa los navegadores que ya tienes instalados** en tu sistema. Descarga los suyos propios. Esto garantiza que el test corra **igual en tu laptop, en la de tu compañero y en CI**, sin diferencias de versión.

---

## 1. Instalar la librería (parte automática)

Desde la carpeta `playwright-course/`:

```bash
$ cd playwright-course
$ pnpm install
```

Esto lee `package.json` e instala `@playwright/test` y `typescript`.

---

## 2. Instalar los navegadores

```bash
$ pnpm exec playwright install
```

Salida esperada (la primera vez):
```
Downloading Chromium 130.0.6723.31 (playwright build v1140)...
Chromium 130.0.6723.31 (playwright build v1140) downloaded
Downloading Firefox 131.0 (playwright build v1466)...
Firefox 131.0 (playwright build v1466) downloaded
Downloading Webkit 18.0 (playwright build v2104)...
Webkit 18.0 (playwright build v2104) downloaded
```

Esto baja **~300 MB** la primera vez y los guarda en `~/Library/Caches/ms-playwright/` (macOS) o equivalente.

### Solo un navegador específico
Si tu disco está corto:
```bash
$ pnpm exec playwright install chromium
$ pnpm exec playwright install firefox
$ pnpm exec playwright install webkit
```

### Con dependencias del sistema (Linux / CI)
En Linux puede que falten libs nativas (fuentes, codecs, etc.). Usa `--with-deps`:

```bash
$ pnpm exec playwright install --with-deps
```

⚠️ Esto requiere `sudo` en Linux porque instala paquetes del sistema.

---

## ✅ Verificación

```bash
$ pnpm exec playwright --version
Version 1.47.0    # ← debe ser 1.40+
```

Y corre el test "hello world" del módulo 1:
```bash
$ pnpm test modulo-01-vision-general/hello.spec.ts
```

**Resultado esperado:** 6 tests verdes (2 tests × 3 navegadores).

---

## 3. Visual Studio Code: extensión oficial

Si no la instalaste en [05-vscode.md](./05-vscode.md), instálala ahora:

- **Extensión:** [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- **ID:** `ms-playwright.playwright`
- **Comando:**
  ```bash
  $ code --install-extension ms-playwright.playwright
  ```

### ¿Qué te da esta extensión?

- ✅ Botón **▶ Run** y **🐞 Debug** al lado de cada `test(...)` en el editor.
- ✅ Vista lateral con todos los tests del proyecto, agrupados.
- ✅ Generador de selectores con un click (Pick locator).
- ✅ Trace viewer integrado.
- ✅ Watch mode visual.

---

## ⚠️ Problemas comunes

### "Failed to install browsers" en Linux
- Faltan libs del sistema. Corre:
  ```bash
  $ pnpm exec playwright install --with-deps
  ```

### "Disk full" durante la instalación
- Los 3 navegadores ocupan ~300 MB. Libera espacio o instala solo Chromium:
  ```bash
  $ pnpm exec playwright install chromium
  ```

### "EACCES" en macOS al primer test
- macOS bloquea binarios no firmados. Ve a **System Preferences → Security & Privacy** y permite el binario que aparece bloqueado.

### Los tests fallan con `Error: page.goto: net::ERR_PROXY_CONNECTION_FAILED`
- Tu corporativo tiene proxy. Configura la variable:
  ```bash
  $ HTTPS_PROXY=http://tu-proxy:8080 pnpm test
  ```

### ¿Necesito instalar Chrome/Firefox normales en mi sistema?
- **No.** Playwright usa los suyos propios. Puedes tener cero navegadores instalados y los tests corren igual.

### ¿Cuánto espacio ocupa todo?
- Librerías de npm: ~200 MB
- 3 navegadores de Playwright: ~300 MB
- **Total: ~500 MB**

---

## 🔗 Enlaces útiles

- [Instalación oficial de Playwright](https://playwright.dev/docs/intro)
- [System requirements](https://playwright.dev/docs/intro#system-requirements)
- [Lista de navegadores soportados](https://playwright.dev/docs/browsers)
- [VS Code extension docs](https://playwright.dev/docs/getting-started-vscode)

➡️ Siguiente: [08-herramientas-ia.md](./08-herramientas-ia.md) (opcional)
