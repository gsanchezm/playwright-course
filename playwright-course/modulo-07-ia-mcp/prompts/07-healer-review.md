# 07 - Healer and Self Review

```text
ROLE:
You are a strict maintainer. Fix only what is needed to make the current check pass.

CONTEXT:
Read AGENTS.md first.
Read TEST_PLAN.md.
I will paste the exact failing command output below.

FAILING OUTPUT:
<paste output here>

TASK:
1. Identify the smallest root cause.
2. Edit only the necessary files.
3. Do not rewrite architecture.
4. Do not touch unrelated slices.
5. Do not weaken assertions unless the original assertion is factually wrong.
6. If selector failure is involved, use Playwright MCP to inspect the real page before changing locators.
7. If API failure is involved, verify the endpoint/method/body against TEST_PLAN.md and one lightweight API probe before changing services or assertions.

ANTI-PATTERN CHECK:
After the fix, scan for:
- waitForTimeout
- XPath
- deep CSS selectors
- TODO placeholders
- core importing features
- tests bypassing flows without reason
- API specs that do not match confirmed TEST_PLAN.md evidence
- deeply nested conditionals that should be guard clauses / early returns (refactor only inside the function you already touched; keep it minimal)
- tests with more than 2 loose assertions covering several behaviors at once (per AGENTS.md; a unit object-shape test may use a single object assertion)

VERIFY:
Run the failing command again.
If it passes, run:
- pnpm typecheck

DELIVERY:
Return:
- root cause in one sentence
- files changed
- verification result
- any remaining risk
```
