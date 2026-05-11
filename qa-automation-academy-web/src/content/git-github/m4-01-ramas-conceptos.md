# 1. Ramas en pocas palabras

Una **rama (branch)** es una línea de desarrollo independiente. Técnicamente es solo un "puntero móvil" a un commit. Cuando haces un commit nuevo en una rama, el puntero avanza automáticamente.

```
         main → C1 ── C2 ── C3
```

Si creas una rama `feature/mobile-tests` a partir de `main` y haces un commit:

```
         main            → C3
                          \
         feature/mobile-tests → C4
```

Ambas ramas comparten la historia C1 → C2 → C3, pero ahora divergen. Esto permite que tú trabajes en `feature/mobile-tests` sin afectar a `main`.

## ¿Por qué son baratas las ramas en Git?

Porque son **solo un archivo de 41 bytes** con el hash del commit al que apuntan. Crear una rama es instantáneo (literalmente milisegundos), a diferencia de otros VCS donde una rama era una copia completa de archivos.

**Moraleja:** crea ramas sin miedo. Una por feature, una por bugfix, una por experimento. Es la filosofía de Git.
