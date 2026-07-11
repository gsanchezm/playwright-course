# 09 - Create Reusable Skill

```text
ROLE:
You are a senior QA automation engineer creating a reusable, agent-agnostic skill from this completed harness workflow. It must work with any coding agent (Claude Code, Codex, Antigravity, GitHub Copilot, ...) that can read AGENTS.md.

CONTEXT:
Read:
- PROJECT_BRIEF.md
- CLAUDE.md
- AGENTS.md
- TEST_PLAN.md
- package.json
- playwright.config.ts

This prompt runs only after the harness flow has been completed at least once.
Do not generate new tests in this step.

TASK:
Create a local, reusable, agent-agnostic skill that captures the generic AI test harness workflow. The portable core is references/workflow.md (tool-neutral); SKILL.md is only a thin wrapper.

OUTPUT LOCATION:
Create the skill under:

skills/ai-test-harness-builder/

Do not install it globally in any agent's skills location (e.g. ~/.claude/skills, ~/.codex/skills) unless I explicitly ask.

FILES TO CREATE:
1. skills/ai-test-harness-builder/SKILL.md
2. skills/ai-test-harness-builder/references/workflow.md

SKILL.md REQUIREMENTS:
- Include valid YAML frontmatter with:
  - name: ai-test-harness-builder
  - description: mention that this skill is used to bootstrap the environment and create or extend a generic Playwright + TypeScript AI test harness from UI/API URLs, including setup files, foundation, app discovery, TEST_PLAN.md, generated slices, healing, CI, and optional GitHub repo create + push to main.
- Keep the body concise.
- Explain when to read references/workflow.md.
- State that the skill is agent-agnostic: the portable process lives in references/workflow.md; SKILL.md is a thin wrapper for agents that support skills. Agents without a skill system can follow references/workflow.md + AGENTS.md directly.
- Do not mention the current SUT name unless it is part of an example clearly marked as replaceable.
- Do not hardcode feature names.

references/workflow.md REQUIREMENTS:
Document the reusable workflow:
1. Inputs:
   - UI_URL
   - API_URL
   - TARGET_DIR
2. Bootstrap:
   - create PROJECT_BRIEF.md
   - create CLAUDE.md
   - configure Playwright MCP
3. Foundation:
   - generate AGENTS.md — it MUST specify a vertical-slice layout (src/core, src/shared, src/features/<slice>/ with co-located <slice>.spec.ts / <slice>.api.spec.ts) and MUST forbid layer folders (src/pages, src/services, src/flows, src/data, src/tests). Never describe a layered pages/services/flows/tests structure.
   - package.json (test, test:ui, test:cross, test:firefox, test:webkit, test:mobile, test:api, test:smoke, test:headed, typecheck, report, install:browsers)
   - playwright.config.ts with fullyParallel: true and a cross-browser + responsive UI matrix (ui-chromium/ui-firefox/ui-webkit + ui-mobile-chrome/ui-mobile-safari, all sharing testIgnore for *.api.spec.ts) plus a single browserless `api` project
   - src/core
   - src/shared
4. Discovery:
   - explore UI with Playwright MCP
   - discover API with OpenAPI/docs/light probes
   - create TEST_PLAN.md
   - require MenuPage when shared navigation exists
5. Slices:
   - use slice names from TEST_PLAN.md
   - create UI specs and API specs only when confirmed
6. Verification:
   - pnpm typecheck
   - pnpm test:api
   - pnpm test:ui
7. Healing:
   - minimal fixes
   - no fake passing tests
8. Delivery:
   - optional GitHub CLI commit + repo create + push to main (CI check)

RULES:
- Keep the skill generic for any SUT.
- The workflow MUST describe the vertical-slice layout (src/features/<slice>/ with co-located specs) and MUST NOT describe or scaffold layer folders (src/pages, src/services, src/flows, src/data, src/tests). "Vertical slice" means one feature folder owns its page/service/flow/specs — not a spec spread across layer folders.
- Do not copy full source files into the skill.
- Do not include README.md, changelog, or extra docs.
- Do not include secrets, .env, reports, node_modules, or test artifacts.

VERIFY:
Run:
- test that SKILL.md exists
- test that references/workflow.md exists
- print the first 20 lines of SKILL.md

DELIVERY:
Return:
- skill path
- files created
- verification result
- how to install/use it later in Claude Code, Codex, Antigravity, or GitHub Copilot (or, for any other agent, follow references/workflow.md + AGENTS.md directly)
```
