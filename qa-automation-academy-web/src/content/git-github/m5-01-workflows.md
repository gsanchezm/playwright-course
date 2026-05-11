# 1. Workflows de ramas

Un **workflow** es un conjunto de reglas que define cómo tu equipo usa Git. No hay uno "correcto" universal — depende del tamaño del equipo, la frecuencia de releases y cuán estrictos son los requisitos de calidad.

## 1.1 Workflow con ramas de larga vida (long-running branches)

Tienes varias ramas "estables" que siempre existen:

- **`main`** — siempre estable, lo que está en producción.
- **`develop`** — lo que va a entrar en el próximo release.
- **`feature/*`** — ramas cortas que salen de `develop`.

```
main      ●──────●──────●    (releases taggeados)
           \    /       \
develop     ●──●──●──●──●    (integración continua)
               \   /
feature/x       ●─●
```

**Cuándo usarlo:** equipos que tienen releases formales (por ejemplo, una suite de tests validada cada 2 semanas). Es una versión simplificada de **Gitflow**.

## 1.2 Workflow de topic branches (trunk-based)

Solo existe `main` + muchas ramas cortas de topic. Las topic branches viven pocas horas o días y se mergean rápido.

```
main    ●──●──●──●──●──●──●
         \     \    \
feat/a    ●─────●    \
feat/b               ●─●
```

**Reglas:**
- Cada feature branch vive 1-3 días máximo.
- Se mergea con PR + revisión.
- `main` siempre es deployable (en tests: siempre debe correr verde).

**Cuándo usarlo:** equipos ágiles con CI fuerte. **Es el workflow recomendado para equipos de automatización modernos** porque:
- El historial de `main` representa fielmente la evolución del framework.
- Evita ramas "zombie" que nadie recuerda mergear.
- Se integra perfectamente con GitHub PRs.

## 1.3 Integration-manager workflow

Usado en proyectos open source grandes. Existe un **mantenedor** con permisos de push a `main`. Los colaboradores trabajan en sus propios forks, abren PRs y el mantenedor decide qué mergear.

```
   oficial     ●──●──●──●
                 ↑  ↑
                 │  │
   tu fork       ●  │
                    │
   otro fork        ●
```

**Cuándo usarlo:** si tu empresa tiene un framework de automatización open source, o si contribuyes a Playwright/Cypress/Selenium.

## 1.4 Gitflow (mención breve)

Un workflow más estricto con ramas específicas para `release/`, `hotfix/`, `develop/`, `main/`, `feature/`. Popular en empresas grandes con releases mensuales. Suele ser **overkill** para un repo de tests. Menciónalo solo si tu empresa ya lo usa.

## 1.5 Comparación rápida

| Workflow | Complejidad | Recomendado para |
|----------|-------------|------------------|
| Trunk-based (topic branches) | Baja | **Equipos de automatización QA** ✅ |
| Long-running + feature branches | Media | Equipos con releases formales cada N semanas |
| Gitflow | Alta | Empresas grandes con múltiples versiones en paralelo |
| Integration-manager | Media | Open source o forks |
