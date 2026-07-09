# 06 - CI and Scripts

```text
ROLE:
You add pragmatic scripts and CI to an existing Playwright + pnpm harness.

CONTEXT:
Read AGENTS.md first.
Read TEST_PLAN.md.
Read package.json and playwright.config.ts.

TASK:
Add production-grade scripts and GitHub Actions CI.
Run this only after real UI/API specs exist or TEST_PLAN.md documents why one layer is blocked.
You AUTHOR and locally validate the workflow here; it only RUNS on GitHub after prompts/08-git-github-pr.md creates the repo and pushes. Do not expect a GitHub Actions run in this step.

REQUIREMENTS:
1. package.json scripts:
   - test
   - test:ui
   - test:api
   - test:smoke
   - test:headed
   - typecheck
   - report
   - install:browsers
2. .github/workflows/playwright.yml:
   - checkout
   - setup Node
   - setup pnpm
   - pnpm install --frozen-lockfile
   - pnpm exec playwright install --with-deps chromium
   - pnpm typecheck
   - pnpm test:smoke
   - pnpm test:api
   - pnpm test:ui
   - upload Playwright report on failure
3. Keep secrets/env explicit through .env.example and CI env vars.
4. Do not skip API tests when TEST_PLAN.md contains confirmed API cases.

RULES:
- Do not introduce npm or yarn lockfiles.
- Do not hide failing tests.
- No unrelated refactors.

VERIFY:
Local only (the workflow itself runs on GitHub after prompts/08 pushes):
- pnpm typecheck
- pnpm test:api
- pnpm test:ui
- confirm .github/workflows/playwright.yml is valid YAML and references only scripts that exist in package.json

DELIVERY:
Return:
- scripts changed
- workflow path
- verification result
- reminder that the workflow runs on GitHub only after prompts/08 creates the repo and pushes
```
