# 10 - Use Skill to Bootstrap a Harness

```text
ROLE:
You are a senior QA automation engineer using a local, agent-agnostic skill to bootstrap a new Playwright + TypeScript AI test harness.

CONTEXT:
This step teaches how a skill helps set up a new environment with AI.
Use the local skill created in the previous step:

skills/ai-test-harness-builder/SKILL.md

Do not assume the skill is globally installed.

INPUTS:
UI_URL=<replace with target UI URL>
API_URL=<replace with target API URL>
TARGET_DIR=<replace with a new empty external folder>

TASK:
Read the local skill and use its workflow to prepare a new harness workspace.

REQUIRED FLOW:
1. Read skills/ai-test-harness-builder/SKILL.md.
2. Read skills/ai-test-harness-builder/references/workflow.md when the skill tells you to.
3. Create TARGET_DIR if it does not exist.
4. Create the setup files:
   - PROJECT_BRIEF.md
   - CLAUDE.md
   - .mcp.json
   - .vscode/mcp.json
   - .gitignore
5. Copy the current prompts into TARGET_DIR/prompts if they are available.
6. Initialize git in TARGET_DIR if needed.
7. Do not create src/, package.json, AGENTS.md, TEST_PLAN.md, or feature files yet.
8. Print the next command and next prompt:
   - cd TARGET_DIR
   - claude
   - prompts/01-bootstrap-environment.md

RULES:
- Keep the generated setup generic for any SUT.
- Do not install the skill globally.
- Do not install global tools silently.
- Do not create app-specific code yet.
- Do not commit anything in this step.

VERIFY:
Confirm these files exist in TARGET_DIR:
- PROJECT_BRIEF.md
- CLAUDE.md
- .mcp.json
- .vscode/mcp.json
- .gitignore
- prompts/01-bootstrap-environment.md if prompts were copied

DELIVERY:
Return:
- skill used
- target directory
- files created
- verification result
- exact next commands
```
