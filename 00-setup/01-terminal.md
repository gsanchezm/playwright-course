# 01 — Terminal moderna

> **¿Por qué importa?** Vas a vivir en la terminal durante los 3 cursos. La terminal "default" de Windows (CMD) es vieja y limitada — la cambiamos por algo decente. macOS y Linux ya vienen bien por default.

---

## 🍎 macOS

Tu Terminal.app ya es buena. **No necesitas instalar nada.**

### Opcional pero recomendado: iTerm2

iTerm2 es una mejora gratuita de la terminal nativa con tabs, búsqueda, splits y mejores temas.

- **Sitio oficial:** https://iterm2.com/
- **Instalación con Homebrew:**
  ```bash
  $ brew install --cask iterm2
  ```

### Verificación
```bash
$ echo $SHELL
/bin/zsh
```

Si ves `/bin/zsh` (o `/bin/bash`), estás listo.

---

## 🪟 Windows

**No uses CMD ni PowerShell viejo.** Instala **Windows Terminal** + **Git Bash** (este último viene con Git, lo instalas en el archivo 04).

### Windows Terminal

- **Sitio oficial:** https://aka.ms/terminal
- **Microsoft Store:** [enlace directo](https://www.microsoft.com/store/productId/9N0DX20HK701)
- **Instalación con winget:**
  ```powershell
  > winget install --id Microsoft.WindowsTerminal -e
  ```

### Verificación

1. Abre el menú de inicio.
2. Busca "Terminal" o "Windows Terminal".
3. Debe abrirse una ventana moderna con tabs.

> 💡 Después de instalar Git Bash (paso 04), configúralo como terminal default: en Windows Terminal abre **Settings → Default profile → Git Bash**. Así todos los comandos `bash` del curso funcionarán igual que en macOS/Linux.

---

## 🐧 Linux

Cualquier terminal moderna funciona: GNOME Terminal, Konsole, Alacritty, Kitty, etc.

### Verificación
```bash
$ echo $SHELL
/bin/bash
```

Suficiente.

---

## 🎓 Comandos básicos que asumimos que conoces

Si no sabes estos, dedica 15 min a aprenderlos antes de seguir:

| Comando | Qué hace |
|---------|----------|
| `pwd` | Muestra la carpeta actual |
| `ls` | Lista archivos de la carpeta actual |
| `cd nombre` | Entra a una carpeta |
| `cd ..` | Sube un nivel |
| `cd ~` | Va a tu carpeta de usuario |
| `mkdir nombre` | Crea una carpeta |
| `rm archivo` | Borra un archivo |
| `clear` | Limpia la pantalla |

> **Tutorial recomendado** para repasar: [Linux Command Line for Beginners (Ubuntu)](https://ubuntu.com/tutorials/command-line-for-beginners)

---

## ⚠️ Problemas comunes

- **"Mi terminal se ve fea / sin colores":** instala [Oh My Zsh](https://ohmyz.sh/) (macOS/Linux) o cambia el color scheme en Windows Terminal Settings.
- **"Los comandos `bash` no funcionan en Windows":** estás usando CMD o PowerShell. Cambia a Git Bash dentro de Windows Terminal.

➡️ Siguiente: [02-nodejs.md](./02-nodejs.md)
