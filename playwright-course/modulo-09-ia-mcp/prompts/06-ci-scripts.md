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
   - test:ui        (project ui-chromium — fast feedback)
   - test:cross     (ui-chromium + ui-firefox + ui-webkit + ui-mobile-chrome + ui-mobile-safari)
   - test:firefox
   - test:webkit
   - test:mobile    (ui-mobile-chrome + ui-mobile-safari)
   - test:api
   - test:smoke     (playwright test --grep @smoke --project=ui-chromium)
   - test:headed
   - typecheck
   - report
   - install:browsers
2. .github/workflows/playwright.yml with THREE jobs, wired to make the test pyramid visible as a real pipeline (API gates UI):
   Job "api-tests" — runs on push + pull_request; the pyramid's base layer, no browser needed:
   - checkout
   - setup Node
   - setup pnpm (use actions/setup-node's built-in `cache: pnpm` so the duplicated installs across jobs stay cheap)
   - pnpm install --frozen-lockfile
   - pnpm typecheck
   - pnpm test:api
   - upload Playwright report on failure
   Job "ui-tests" — runs on push + pull_request; `needs: api-tests` so it only starts once the API layer is green; chromium-only for fast feedback:
   - checkout
   - setup Node
   - setup pnpm (same pnpm cache)
   - pnpm install --frozen-lockfile
   - pnpm exec playwright install --with-deps chromium
   - pnpm test:smoke
   - pnpm test:ui
   - upload Playwright report on failure
   Job "cross-browser" — opt-in only (on: workflow_dispatch and optionally a nightly schedule); full matrix, independent from the push path:
   - checkout / setup Node / setup pnpm / pnpm install --frozen-lockfile
   - pnpm exec playwright install --with-deps chromium firefox webkit
   - pnpm test:cross
   - upload Playwright report on failure
   Keep the cross-browser job OFF the per-push path so PRs stay fast; it runs on demand or on schedule.
3. Keep secrets/env explicit through .env.example and CI env vars.
4. Do not skip API tests when TEST_PLAN.md contains confirmed API cases.
5. The `needs: api-tests` dependency is the point of this design: it makes the pyramid a real gate, not just doc — if `api-tests` fails, `ui-tests` never runs, so PRs fail fast on the cheaper integration layer before paying for the slower E2E layer.

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
