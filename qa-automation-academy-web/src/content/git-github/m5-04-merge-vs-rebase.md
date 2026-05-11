# 4. Merge vs Rebase: ¿cuándo uso cada uno?

| Usa merge cuando... | Usa rebase cuando... |
|----------------------|----------------------|
| La rama ya fue pusheada y otros la usan | Es una rama **local privada** tuya |
| Quieres preservar el historial exacto de "este commit vino de feature/X" | Quieres un historial **lineal limpio** |
| Tu equipo prefiere merge commits (política) | Vas a abrir un PR y quieres limpiar commits de WIP |
| No estás muy seguro de lo que haces | Sabes lo que estás haciendo |

**Regla práctica en equipos de automatización:**

1. Durante tu trabajo diario, haz todos los commits "WIP" que necesites.
2. Antes de pushear y abrir PR, usa `git rebase -i` para combinarlos en 1-3 commits limpios.
3. Usa `merge` (con `--no-ff`) cuando el PR se apruebe, para preservar el contexto del feature en `main`.
