# 08 - Git Commit, GitHub Repo and CI Check

```text
ROLE:
You are a careful release assistant. Create a clean git commit, publish the harness to a new GitHub repository, and confirm the CI workflow runs.

VARIABLES:
REPO_NAME=<replace with the repo name, default: the harness folder name>
VISIBILITY=private

CONTEXT:
Read PROJECT_BRIEF.md.
Read TEST_PLAN.md.
Read AGENTS.md.
This prompt runs only after the harness has real specs, prompts/06 has added .github/workflows/playwright.yml, and the final local checks pass or have a documented blocker.

TASK:
Commit the generated harness, create a new private GitHub repository with GitHub CLI, push main so the CI workflow runs, and report the Actions result.

CHECKS BEFORE COMMIT:
1. Run:
   - git status --short
   - pnpm typecheck
   - pnpm test:api
   - pnpm test:ui
2. If a test layer is blocked in TEST_PLAN.md, do not fake it. Mention the documented blocker in the commit body.
3. If checks fail for an undocumented reason, stop and tell me to use prompts/07-healer-review.md first.

GIT RULES:
- Do not commit secrets, .env, reports, node_modules, or test-results.
- Do not amend previous commits unless I explicitly ask.
- Use one conventional commit message:
  - test: add AI-generated Playwright harness
  - test: add initial SUT automation harness
  - test: add <domain> Playwright coverage
- Include TEST_PLAN.md in the commit.

GITHUB CLI:
1. Check:
   - gh --version
   - gh auth status
2. If `gh` is missing or not authenticated, stop after the local commit and print the exact commands I can run later:
   - gh auth login
   - gh repo create REPO_NAME --private --source=. --remote=origin --push
3. If `gh` is available and authenticated:
   - ensure the default branch is main: git branch -M main
   - if no `origin` remote exists yet, create the repo and push in one step:
     gh repo create REPO_NAME --private --source=. --remote=origin --push
   - if `origin` already exists, just: git push -u origin main
   - push to main directly; do NOT open a pull request for this first publish (a fresh repo starts from main). Only open a PR if I explicitly ask.

CI CHECK (after push):
1. The workflow added in prompts/06 (.github/workflows/playwright.yml) runs on GitHub now.
2. Observe it:
   - gh run list --limit 1
   - gh run watch    (or open the repository Actions tab)
3. If the run is red, capture the failing job log (gh run view --log-failed) and tell me to fix it with prompts/07-healer-review.md. Do not hide a red CI.

COMMIT BODY MUST MENTION:
- Summary of the harness
- Checks run locally
- UI/API coverage generated
- Known blockers or risks from TEST_PLAN.md

DELIVERY:
Return:
- commit hash
- repo URL (or the exact command to create it later if gh was unavailable)
- push result
- CI run status (green / red / not run) and its URL
- local checks result
- any skipped step and why
```
