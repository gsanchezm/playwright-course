# 4. La línea de comandos

En este curso usaremos **exclusivamente la terminal**. Aunque existen GUIs (GitHub Desktop, SourceTree, GitKraken, la pestaña Git de VS Code), un automatizador profesional necesita dominar la CLI por 3 razones:

1. **CI/CD:** Los pipelines de GitHub Actions, Jenkins, GitLab CI ejecutan comandos Git crudos. Si no los entiendes, no puedes depurar un build roto.
2. **Todos los comandos existen en CLI; no todos existen en la GUI.** Cosas como `git reflog`, `git bisect`, o un `rebase -i` complejo son mucho más claras en terminal.
3. **Es universal:** Cualquier máquina Linux remota, contenedor Docker, o servidor CI tiene `git` pero no necesariamente una GUI.

## Terminal recomendada por sistema operativo

| Sistema | Terminal recomendada |
|---------|----------------------|
| macOS | Terminal.app o iTerm2 |
| Windows | Windows Terminal + Git Bash (viene con Git) |
| Linux | Cualquiera (gnome-terminal, konsole, alacritty...) |
