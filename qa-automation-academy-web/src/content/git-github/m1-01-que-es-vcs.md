# 1. ¿Qué es un Sistema de Control de Versiones (VCS)?

Un **Sistema de Control de Versiones** (VCS, del inglés _Version Control System_) guarda el historial completo de cambios de un conjunto de archivos a lo largo del tiempo, de modo que puedes:

- Volver a una versión anterior si algo se rompe.
- Saber quién hizo qué cambio y cuándo.
- Trabajar en paralelo con otros sin pisarse los cambios.
- Experimentar con nuevas ideas sin miedo.

![Sistema de Control de Versiones Distribuido](https://git-scm.com/book/en/v2/images/distributed.png)
*Fuente: [git-scm.com - About Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)*


## ¿Por qué lo necesita un automatizador QA?

Imagina este escenario real:

> Hoy es lunes. Escribiste 15 tests nuevos para el flujo de checkout el viernes pasado. Hoy actualizas un localizador y **de repente 8 tests fallan**. No recuerdas qué cambiaste. Tu compañera también tocó ese archivo. ¿Cómo saber qué pasó?

Sin Git:
- Copias y pegas carpetas con nombres como `tests_v1/`, `tests_v2_FINAL/`, `tests_BUENO_NO_TOCAR/`.
- Pierdes horas comparando archivos manualmente.
- Terminas restaurando desde una "copia de seguridad" que no está actualizada.

Con Git:
```bash
$ git log --oneline tests/checkout.spec.ts    # ver qué cambió en ese archivo
$ git diff HEAD~5 HEAD tests/checkout.spec.ts # comparar la versión actual vs hace 5 commits
$ git checkout <commit-anterior> -- tests/checkout.spec.ts  # restaurar la versión anterior
```

**Moraleja:** Un automatizador sin Git es como un tester manual sin un sistema de gestión de bugs. Funciona, pero no escala.
