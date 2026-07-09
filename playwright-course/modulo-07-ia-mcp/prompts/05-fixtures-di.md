# 05 - Fixtures and Dependency Injection

```text
ROLE:
You wire dependency injection for an existing Playwright harness.

CONTEXT:
Read AGENTS.md first.
Read TEST_PLAN.md.
Read src/shared/fixtures.ts.
Read all existing src/features/*/*.flow.ts, *.page.ts, and *.service.ts files.

TASK:
Refactor src/shared/fixtures.ts so tests receive ready-to-use flows/services through Playwright fixtures.
Run this only after at least one real UI or API spec exists.

RULES:
- Keep DI in src/shared/fixtures.ts.
- Do not move feature logic into shared.
- Do not create circular imports.
- Do not edit assertions unless required by changed fixture names.
- Keep fixture names short and domain-oriented.
- Add fixtures only for slices that already exist.
- Preserve existing tests' behavior.
- No unrelated refactors.

VERIFY:
Run:
- pnpm typecheck
- pnpm test:api
- pnpm test:ui

DELIVERY:
Return:
- fixtures added
- specs updated
- verification result
```
