# 3. ¿Qué es Git exactamente?

Git es un **VCS distribuido** que trabaja con **snapshots** (fotografías), no con diferencias.

## Snapshots vs Diferencias

La mayoría de VCS antiguos (CVS, Subversion) guardaban **diferencias** entre archivos. Git no: cada vez que haces `commit`, toma una **foto completa** del estado de todos tus archivos. Si un archivo no cambió, Git guarda un "puntero" a la versión anterior (no duplica datos).

```
Commit 1: [testA.ts v1] [testB.ts v1] [config.ts v1]
Commit 2: [testA.ts v2] [testB.ts →v1] [config.ts →v1]
Commit 3: [testA.ts →v2] [testB.ts v2] [config.ts v2]
```

### Almacenamiento basado en Deltas vs Snapshots

| Almacenamiento basado en deltas (Diferencias) | Almacenamiento basado en Snapshots (Git) |
| :---: | :---: |
| ![Deltas](https://git-scm.com/book/en/v2/images/deltas.png) | ![Snapshots](https://git-scm.com/book/en/v2/images/snapshots.png) |
| *Fuente: [git-scm.com](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)* | *Fuente: [git-scm.com](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)* |

---

## Los 3 estados de un archivo en Git

A diferencia de otros sistemas, Git gestiona tus archivos a través de tres áreas principales:

```
  Working Directory   ───>   Staging Area   ───>   Git Directory
   (Área de trabajo)         (Index / Staging)       (Repository)
      "Modificado"             "Preparado"          "Confirmado"
```

![Los 3 estados de Git](https://git-scm.com/book/en/v2/images/areas.png)
*Fuente: [git-scm.com - The Three States](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)*



1. **Working directory (working tree):** Los archivos que ves en tu editor. Aquí editas tu test.
2. **Staging area (index):** Una "sala de espera" donde pones los cambios que SÍ quieres incluir en el próximo commit.
3. **Repository (.git):** El historial permanente. Lo que está aquí ya está guardado para siempre.

> 💡 **Analogía QA:** Es como preparar un reporte de bugs:
> - `working directory` = los bugs que detectas durante tu sesión de pruebas.
> - `staging area` = los bugs que ya validaste y quieres incluir en el reporte final.
> - `repository` = el reporte enviado al equipo de desarrollo (ya no puedes "des-enviarlo" fácilmente).
