# 01 - Bootstrap Environment

```text
ROLE:
You are a senior QA automation engineer. Bootstrap a Playwright + TypeScript E2E harness environment. Be concise and operational.

CONTEXT:
This is a NEW empty project folder for an AI-generated test harness.
Read PROJECT_BRIEF.md first.
If PROJECT_BRIEF.md is missing, stop and tell me to run the setup script first.
Primary toolchain:
- Claude Code
- VS Code
- pnpm
- Playwright
- Playwright MCP

TASK:
Verify the local environment and prepare the project without generating the framework yet.

CHECKS:
1. Print the current working directory and confirm it is not inside the training course repo.
2. Confirm these setup files exist:
   - PROJECT_BRIEF.md
   - CLAUDE.md
3. Check:
   - node --version
   - pnpm --version
   - claude --version
   - git --version
   - gh --version if available; GitHub CLI is optional and only needed for the final commit + GitHub push step (prompts/08)
4. If CLAUDE.md is missing, create a minimal one that tells Claude Code to read PROJECT_BRIEF.md first, AGENTS.md when it exists, and TEST_PLAN.md before implementing slices.
5. If pnpm is missing and corepack exists, enable pnpm through corepack.
6. Verify Playwright MCP by using the browser tool:
   - navigate to https://example.com
   - call browser_snapshot
   - report the visible link count
   Do not answer from memory.
7. Create no production framework files yet.

OUTPUT:
- A short readiness checklist.
- Exact commands I should run if something is missing.
- Do not explain MCP theory.
```
