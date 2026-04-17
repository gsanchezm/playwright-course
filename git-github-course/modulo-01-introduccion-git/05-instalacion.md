# 5. Instalación de Git

## macOS

**Opción 1 (recomendada):** con Homebrew.
```bash
$ brew install git
```

**Opción 2:** con Xcode Command Line Tools (viene con macOS).
```bash
$ xcode-select --install
```

## Windows

Descarga el instalador oficial de [git-scm.com/download/win](https://git-scm.com/download/win) y ejecuta el `.exe`. Acepta los valores por defecto excepto:
- **"Use Visual Studio Code as Git's default editor"** (si tienes VS Code instalado).
- **"Git from the command line and also from 3rd-party software"**.
- **"Checkout as-is, commit Unix-style line endings"**.

## Linux (Debian/Ubuntu)

```bash
$ sudo apt update
$ sudo apt install git
```

## Linux (Fedora/RHEL)

```bash
$ sudo dnf install git
```

## Verificar la instalación

```bash
$ git --version
git version 2.45.2
```

Si ves un número de versión 2.x o superior, estás listo.
