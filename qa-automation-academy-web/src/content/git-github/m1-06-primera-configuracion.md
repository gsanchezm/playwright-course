# 6. Primera configuración de Git (First-Time Setup)

Git guarda configuración en **3 niveles** (de menor a mayor precedencia):

| Nivel | Archivo | Flag | Aplica a |
|-------|---------|------|----------|
| System | `/etc/gitconfig` | `--system` | Todos los usuarios del equipo |
| Global | `~/.gitconfig` | `--global` | Tu usuario en todos los repos |
| Local | `.git/config` | `--local` (default) | Solo el repo actual |

## Configuración mínima obligatoria

Cada commit queda firmado con tu nombre y tu correo. Configúralos **ANTES** de tu primer commit:

```bash
$ git config --global user.name "Gilberto Sánchez"
$ git config --global user.email "gil@miempresa.com"
```

> ⚠️ **Importante:** Usa el mismo correo con el que tienes cuenta en GitHub. De lo contrario, tus commits aparecerán como "autor desconocido" en los PRs.

## Editor por defecto

Cuando Git necesita que escribas un mensaje de commit largo o un rebase interactivo, abre un editor. Configúralo a VS Code:

```bash
$ git config --global core.editor "code --wait"
```

O a nano (más simple si no tienes VS Code):
```bash
$ git config --global core.editor "nano"
```

## Nombre de la rama principal

Por convención moderna, la rama principal se llama `main` (antes era `master`). Configúralo para que los nuevos repos empiecen con `main`:

```bash
$ git config --global init.defaultBranch main
```

## Colorear la salida

```bash
$ git config --global color.ui auto
```

## Verificar tu configuración

```bash
$ git config --list --global
user.name=Gilberto Sánchez
user.email=gil@miempresa.com
core.editor=code --wait
init.defaultBranch=main
color.ui=auto
```
