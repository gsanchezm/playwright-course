# 7. Cómo pedir ayuda (`git help`)

Git viene con un manual completo integrado. Hay 3 formas equivalentes de abrirlo:

```bash
$ git help <comando>
$ git <comando> --help
$ man git-<comando>
```

Ejemplos:
```bash
$ git help commit      # manual completo de commit
$ git commit --help    # mismo resultado
$ git commit -h        # versión corta (una pantalla)
```

> 💡 **Tip para automatizadores:** Cuando estés escribiendo un script de CI que use Git, siempre empieza consultando `git <comando> -h` para ver las flags disponibles. Te ahorra buscar en Stack Overflow.

## Recursos oficiales

- **Libro oficial (gratuito y en español):** [git-scm.com/book/es/v2](https://git-scm.com/book/es/v2)
- **Referencia de comandos:** [git-scm.com/docs](https://git-scm.com/docs)
- **Tutorial interactivo:** [learngitbranching.js.org](https://learngitbranching.js.org) (muy recomendado para visualizar ramas)
