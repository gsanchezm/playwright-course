# 1. Configuración inicial + los 3 estados

## 1.1 Identidad para tus commits

Cada commit queda firmado con tu nombre y correo. Configúralos **antes** del primer commit:

```bash
$ git config --global user.name "Tu Nombre"
$ git config --global user.email "tu@correo.com"
$ git config --global init.defaultBranch main
```

> ⚠️ Usa el mismo correo de tu cuenta de GitHub. De lo contrario, tus commits aparecen como "autor desconocido" en los Pull Requests.

## 1.2 Verificar configuración

```bash
$ git config --list --global
user.name=Tu Nombre
user.email=tu@correo.com
init.defaultBranch=main
```

Lo que pones con `--global` queda en `~/.gitconfig` y aplica a todos tus repos. Si trabajas con múltiples identidades (laboral / personal), puedes sobreescribir por repo con `--local` dentro de cada carpeta.

## 1.3 Los 3 estados de un archivo

Git mueve tus archivos por **3 áreas**:

```
  Working Directory   ───>   Staging Area   ───>   Repository (.git)
   (lo que editas)             (sala de espera)         (historial)
```

| Estado | Qué es | Cómo se llega |
|---|---|---|
| **Working** | El archivo en tu editor | (editas) |
| **Staging** | "Lo que SÍ va al próximo commit" | `git add` |
| **Repository** | Historial permanente, ya commiteado | `git commit` |

### Por qué importa el staging

El staging es la **sala de espera** donde decides exactamente qué cambios entran al próximo commit. Si tocas 5 archivos pero sólo dos pertenecen a la misma feature, agregas sólo esos dos al staging y los commiteas juntos. Los otros tres quedan en working dir para un commit aparte.

> 💡 **Analogía QA:** preparas un reporte de bugs.
> - *Working* = bugs que detectas mientras pruebas.
> - *Staging* = bugs ya validados que sí van al reporte final.
> - *Repository* = reporte enviado al equipo de desarrollo (ya no se "des-envía" fácilmente).

---

> 📚 **Profundización opcional:** [Niveles de configuración (system / global / local)](../../git-github-course/modulo-01-introduccion-git/06-primera-configuracion.md) · [Snapshots vs deltas](../../git-github-course/modulo-01-introduccion-git/03-que-es-git.md)
