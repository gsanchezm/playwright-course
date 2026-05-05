# Módulo 00 — Git esencial para automatizadores

**Duración estimada:** 30-45 min
**Pieza que suma al framework:** habilidad mínima de Git para versionar tu suite — `config`, `init`, `status`, `add`, `commit`, `.gitignore`, `log`. Lo justo para empezar M01 sin miedo.

> ⚠️ **¿Ya manejas Git con fluidez?** Salta a M01. Este módulo es la **versión condensada** de lo esencial. Para profundización (rebase interactivo, workflows de equipo, tags, aliases) ver el [curso completo](../../git-github-course/).

---

## Analogía de apertura

Tu suite de tests es código vivo: **siempre va a cambiar**. Sin Git eres un tester manual sin control de versiones de tus casos de prueba — un día borras un step, otro día sobreescribes una regresión, y nadie sabe quién rompió qué. Git es la **bitácora obligatoria** del automatizador.

---

## ¿Qué aprenderás?

1. **`git config --global`** — firmar tus commits con identidad real.
2. **Los 3 estados de Git** — working / staging / repository.
3. **`git init` y el ciclo `status → add → commit`** — el 90% del día.
4. **`.gitignore` específico de Playwright** — qué nunca debe entrar al repo.
5. **`git log` básico** — leer la historia de la suite.

Branches, push, Pull Requests y deshacer cambios entran *just-in-time* en M03 y M04, cuando el problema los pide.

---

## Contenido

| # | Archivo | Tema |
|---|---|---|
| 1 | [`01-config-y-3-estados.md`](./01-config-y-3-estados.md) | Configuración inicial + los 3 estados |
| 2 | [`02-init-add-commit.md`](./02-init-add-commit.md) | Inicializar repo, registrar cambios |
| 3 | [`03-gitignore-playwright.md`](./03-gitignore-playwright.md) | `.gitignore` listo para este curso |
| 4 | [`04-log-basico.md`](./04-log-basico.md) | Ver el historial |
| 5 | [`reto.md`](./reto.md) | Práctica activa |

---

## Outcome esperado

- [ ] `git config --list --global` muestra tu nombre y correo.
- [ ] Puedes explicar working dir / staging / repository.
- [ ] Hiciste tu primer commit en una carpeta sandbox.
- [ ] Tu `.gitignore` excluye `node_modules/`, `.env`, `.auth/`, `playwright-report/`, `test-results/`.
- [ ] Puedes leer `git log --oneline` y entender qué pasó.

---

> 📚 **Profundización opcional:** [Curso completo Git/GitHub](../../git-github-course/) — historia de Git, snapshots vs deltas, glosario, workflows de equipo, rebase interactivo, tags, aliases, branch protection.
