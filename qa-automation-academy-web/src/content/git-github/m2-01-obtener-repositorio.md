# 1. Obtener un repositorio Git

Hay **dos formas** de empezar a trabajar con un repo:

## Opción A: Inicializar un repo nuevo desde cero (`git init`)

Se usa cuando **tú** estás creando el proyecto desde cero. Este será el caso cuando inicies el framework de automatización de tu empresa.

```bash
$ mkdir qa-automation-framework
$ cd qa-automation-framework
$ git init
Initialized empty Git repository in /Users/tu/qa-automation-framework/.git/
```

Lo que acaba de pasar:
- Git creó una subcarpeta oculta `.git/` dentro de tu proyecto.
- Esa carpeta contiene **todo** el historial del repo (commits, ramas, config local).
- Mientras esa carpeta exista, tu proyecto es un repo Git.

> ⚠️ **Nunca borres `.git/` a mano.** Si lo haces, pierdes todo el historial. Para "des-inicializar" un repo simplemente borras esa carpeta (a veces sirve si rompiste algo muy feo en un sandbox).

## Opción B: Clonar un repo existente (`git clone`)

Se usa cuando ya existe un repo en un servidor (típicamente GitHub) y tú te unes al equipo. Este será el caso cuando entres a una empresa y quieras descargar el framework existente.

```bash
$ git clone https://github.com/miempresa/qa-automation-framework.git
Cloning into 'qa-automation-framework'...
remote: Enumerating objects: 1523, done.
remote: Counting objects: 100% (1523/1523), done.
remote: Compressing objects: 100% (842/842), done.
Receiving objects: 100% (1523/1523), 2.14 MiB | 5.32 MiB/s, done.
Resolving deltas: 100% (710/710), done.

$ cd qa-automation-framework
$ ls
package.json  playwright.config.ts  tests/  README.md
```

`git clone` hace 3 cosas a la vez:
1. Descarga el repo completo (incluyendo todo el historial).
2. Crea una carpeta local con el nombre del repo.
3. Configura automáticamente un "remoto" llamado `origin` que apunta a la URL original.

Puedes clonar con un nombre de carpeta distinto:
```bash
$ git clone https://github.com/miempresa/qa-automation-framework.git mis-tests
```
