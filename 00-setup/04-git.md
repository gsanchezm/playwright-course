# 04 — Git

> **¿Qué es?** Git es el sistema de control de versiones que usaremos durante los 3 cursos. El [curso de Git/GitHub](../git-github-course/) lo cubre a fondo — aquí solo lo **instalamos** y hacemos la **configuración mínima inicial**.

> **Sitio oficial:** https://git-scm.com/

> **Versión recomendada:** **2.40 o superior**.

---

## 🍎 macOS

### Opción A (recomendada): Homebrew
```bash
$ brew install git
```

### Opción B: Xcode Command Line Tools (viene con macOS)
```bash
$ xcode-select --install
```

> **Sitio de descarga oficial:** https://git-scm.com/download/mac

---

## 🪟 Windows

### Opción A (recomendada): instalador oficial

1. Descarga desde https://git-scm.com/download/win
2. Ejecuta el `.exe`.
3. **Acepta los valores por defecto** EXCEPTO en estas pantallas:
   - **"Choosing the default editor"** → selecciona **"Use Visual Studio Code"** (si lo tendrás).
   - **"Adjusting the name of the initial branch"** → selecciona **"Override the default branch name"** y escribe `main`.
   - **"Adjusting your PATH environment"** → **"Git from the command line and also from 3rd-party software"**.
   - **"Configuring the line ending conversions"** → **"Checkout as-is, commit Unix-style line endings"**.

### Opción B: con winget
```powershell
> winget install --id Git.Git -e
```

> 💡 **Bonus de Windows:** el instalador de Git incluye **Git Bash**, una terminal estilo Linux. Configúrala como default en Windows Terminal (ver [01-terminal.md](./01-terminal.md)) para que todos los comandos `bash` del curso funcionen.

---

## 🐧 Linux

### Ubuntu / Debian
```bash
$ sudo apt update
$ sudo apt install git
```

### Fedora / RHEL
```bash
$ sudo dnf install git
```

### Arch
```bash
$ sudo pacman -S git
```

---

## ✅ Verificación

```bash
$ git --version
git version 2.45.2    # ← debe ser 2.40 o superior
```

---

## ⚙️ Configuración mínima inicial (OBLIGATORIA)

**Esto debes hacerlo SIEMPRE después de instalar Git por primera vez.** Cada commit que hagas quedará firmado con estos datos.

> ⚠️ **Importante:** usa el **mismo correo** con el que abrirás tu cuenta de GitHub en el archivo [06-github.md](./06-github.md). Si no, tus commits aparecerán como "autor desconocido" en los PRs.

```bash
# 1. Tu identidad
$ git config --global user.name "Tu Nombre Real"
$ git config --global user.email "tu-correo@ejemplo.com"

# 2. Editor por defecto (VS Code)
$ git config --global core.editor "code --wait"

# 3. Rama por defecto al crear repos
$ git config --global init.defaultBranch main

# 4. Colorear la salida
$ git config --global color.ui auto

# 5. (Recomendado) usar rebase en pull en vez de merge commits automáticos
$ git config --global pull.rebase true
```

### Verificar la configuración
```bash
$ git config --list --global
user.name=Tu Nombre Real
user.email=tu-correo@ejemplo.com
core.editor=code --wait
init.defaultBranch=main
color.ui=auto
pull.rebase=true
```

Si ves estas líneas, **Git está listo** y configurado profesionalmente.

---

## ⚠️ Problemas comunes

### "git: command not found" después de instalar en Windows
- No marcaste **"Git from the command line..."** durante la instalación. Reinstala con los pasos de arriba.
- Reinicia Windows Terminal después de instalar.

### Mis commits aparecen como "user@hostname" en vez de mi nombre
- No configuraste `user.name` y `user.email`. Hazlo ahora con los comandos de arriba.

### `code --wait` no funciona como editor
- VS Code no está instalado, o el comando `code` no está en tu PATH. Ver [05-vscode.md](./05-vscode.md), sección "Instalación del comando `code` en macOS".

### Quiero ver toda mi config de Git, no solo la global
```bash
$ git config --list --show-origin
```
Te muestra de qué archivo viene cada valor (system, global, local).

➡️ Siguiente: [05-vscode.md](./05-vscode.md)
