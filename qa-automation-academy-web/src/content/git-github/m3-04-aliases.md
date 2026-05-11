# 4. Git Aliases: escribir menos, hacer más

Un alias es un atajo personalizado. Muy útil para los comandos que usas 50 veces al día.

## 4.1 Configurar aliases

```bash
$ git config --global alias.co checkout
$ git config --global alias.br branch
$ git config --global alias.ci commit
$ git config --global alias.st status
$ git config --global alias.last "log -1 HEAD"
$ git config --global alias.lg "log --oneline --graph --all --decorate"
$ git config --global alias.unstage "restore --staged"
```

## 4.2 Usarlos

```bash
$ git st                     # equivale a git status
$ git lg                     # vista gráfica del historial
$ git unstage tests/login.spec.ts
$ git last                   # ver el último commit
```

## 4.3 Aliases útiles para un automatizador

```bash
# Ver qué tests cambiaron en los últimos 3 commits
$ git config --global alias.recent-tests "log --oneline -3 --stat -- tests/"

# Listar todos los tests modificados en la rama actual pero no en main
$ git config --global alias.my-tests "diff --name-only main...HEAD -- tests/"

# Log de una sola línea con colores y autor
$ git config --global alias.hist "log --pretty=format:'%C(yellow)%h%Creset %C(cyan)%an%Creset %s %C(green)(%cr)%Creset'"
```

## 4.4 Ver todos tus aliases

```bash
$ git config --global --get-regexp alias
alias.co checkout
alias.br branch
alias.ci commit
alias.st status
alias.last log -1 HEAD
alias.lg log --oneline --graph --all --decorate
```
