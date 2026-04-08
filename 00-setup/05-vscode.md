# 05 — Visual Studio Code

> **¿Qué es?** El editor de código que usaremos durante los 3 cursos. Es gratuito, ligero y tiene soporte excelente para TypeScript y Playwright.

> **Sitio oficial:** https://code.visualstudio.com/

---

## Instalación

### 🍎 macOS
- **Descarga directa:** https://code.visualstudio.com/download
- **Con Homebrew:**
  ```bash
  $ brew install --cask visual-studio-code
  ```

### 🪟 Windows
- **Descarga directa:** https://code.visualstudio.com/download
- **Con winget:**
  ```powershell
  > winget install -e --id Microsoft.VisualStudioCode
  ```
- **Importante:** durante la instalación marca:
  - ✅ Add "Open with Code" action to file context menu
  - ✅ Add "Open with Code" action to directory context menu
  - ✅ Add to PATH

### 🐧 Linux
- **Sitio oficial con instrucciones por distro:** https://code.visualstudio.com/docs/setup/linux
- **Snap (Ubuntu):**
  ```bash
  $ sudo snap install code --classic
  ```
- **Fedora:**
  ```bash
  $ sudo dnf install code
  ```

---

## ⚙️ Habilitar el comando `code` en la terminal

Después de instalar, queremos poder abrir VS Code desde la terminal con `code .` (abre la carpeta actual).

### macOS

1. Abre VS Code.
2. Presiona `Cmd + Shift + P` (Command Palette).
3. Escribe **"Shell Command: Install 'code' command in PATH"** y presiona Enter.
4. Reinicia la terminal.

Verifica:
```bash
$ code --version
1.94.2
```

### Windows
Si marcaste "Add to PATH" durante la instalación, ya funciona. Verifica en Windows Terminal:
```bash
$ code --version
```

### Linux
Funciona automáticamente si instalaste con snap o el repositorio oficial.

---

## 🧩 Extensiones recomendadas

Las marcadas con ⭐ son **obligatorias** para los cursos. El resto son opcionales pero muy útiles.

### Para los 3 cursos

| Extensión | Para qué | Cómo instalar |
|-----------|----------|---------------|
| ⭐ **Spanish Language Pack** | Traduce VS Code al español (opcional) | Buscar "Spanish" en marketplace |
| ⭐ **GitLens** | Ver historia de Git inline en el editor | `eamodio.gitlens` |
| ⭐ **Git Graph** | Visualizar ramas y commits gráficamente | `mhutchie.git-graph` |
| ⭐ **EditorConfig** | Estilos consistentes entre máquinas | `editorconfig.editorconfig` |

### Para el curso de TypeScript / Playwright

| Extensión | Para qué |
|-----------|----------|
| ⭐ **Playwright Test for VSCode** (`ms-playwright.playwright`) | Run/debug tests desde el editor, generador de selectores integrado |
| ⭐ **ESLint** (`dbaeumer.vscode-eslint`) | Linter de TypeScript |
| ⭐ **Prettier** (`esbenp.prettier-vscode`) | Formateador automático de código |
| **Pretty TypeScript Errors** (`yoavbls.pretty-ts-errors`) | Hace los errores de TS legibles |
| **Path Intellisense** (`christian-kohler.path-intellisense`) | Autocompleta rutas de archivos |

### Cómo instalar una extensión

**Opción 1 (visual):** click en el icono de extensiones en la barra lateral (cuadrados) → buscar el nombre → Install.

**Opción 2 (terminal):** instala todas de una vez:

```bash
$ code --install-extension eamodio.gitlens
$ code --install-extension mhutchie.git-graph
$ code --install-extension editorconfig.editorconfig
$ code --install-extension ms-playwright.playwright
$ code --install-extension dbaeumer.vscode-eslint
$ code --install-extension esbenp.prettier-vscode
$ code --install-extension yoavbls.pretty-ts-errors
$ code --install-extension christian-kohler.path-intellisense
```

---

## ⚙️ Configuración recomendada

Abre **Settings** (`Cmd/Ctrl + ,`), busca "settings.json" arriba a la derecha y abre el archivo. Pega esto:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.rulers": [100],
  "editor.minimap.enabled": false,
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## ✅ Verificación

1. Abre una terminal **nueva**.
2. Crea una carpeta de prueba:
   ```bash
   $ mkdir ~/sandbox-vscode-test
   $ cd ~/sandbox-vscode-test
   $ code .
   ```
3. Debe abrirse VS Code con esa carpeta.
4. Ve a **Extensions** (icono de cuadrados) y verifica que las extensiones que instalaste aparecen como "Installed".

---

## ⚠️ Problemas comunes

### "code: command not found" en macOS
Sigue los pasos de "Habilitar el comando code en la terminal" arriba.

### VS Code abre, pero las extensiones no se instalan
Si tu organización tiene firewall corporativo, el marketplace puede estar bloqueado. Usa la red personal o pídele al admin que permita `marketplace.visualstudio.com`.

### Prettier no formatea al guardar
- Verifica que `editor.formatOnSave` está en `true`.
- Verifica que Prettier está instalado y activado: barra de estado abajo a la derecha debe decir "Prettier".
- En la Command Palette: **"Format Document With..."** → selecciona Prettier como default.

### Los íconos de Git no aparecen en la barra lateral
Tu carpeta no es un repo Git. Inicialízalo con `git init` (lo verás en el curso de Git).

➡️ Siguiente: [06-github.md](./06-github.md)
