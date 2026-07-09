#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR=""
FORCE=0
NO_OPEN_CODE=0
UI_URL="https://omnipizza-frontend.onrender.com"
API_URL="https://omnipizza-backend.onrender.com"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/setup-ai-harness.sh <target-dir> [--ui-url <url>] [--api-url <url>] [--force] [--no-open-code]

Example:
  ./scripts/setup-ai-harness.sh "$HOME/tmp/omnipizza-ai-harness"
EOF
}

step() {
  printf '\033[36m==> %s\033[0m\n' "$1"
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

version_or_empty() {
  local name="$1"
  shift || true
  if ! has_command "$name"; then
    return 0
  fi

  "$name" "$@" 2>/dev/null | head -n 1 || printf 'installed, version check failed\n'
}

escape_sed_replacement() {
  printf '%s' "$1" | sed -e 's/[\/&|]/\\&/g'
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --force)
      FORCE=1
      shift
      ;;
    --no-open-code)
      NO_OPEN_CODE=1
      shift
      ;;
    --ui-url)
      if [ "$#" -lt 2 ]; then
        echo "--ui-url requires a value." >&2
        exit 1
      fi
      UI_URL="$2"
      shift 2
      ;;
    --api-url)
      if [ "$#" -lt 2 ]; then
        echo "--api-url requires a value." >&2
        exit 1
      fi
      API_URL="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
    *)
      if [ -n "$TARGET_DIR" ]; then
        echo "Only one target directory is allowed." >&2
        usage
        exit 1
      fi
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

if [ -z "$TARGET_DIR" ]; then
  echo "Target directory is required." >&2
  usage
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROMPT_SOURCE="$MODULE_ROOT/prompts"
TARGET="$(mkdir -p "$(dirname "$TARGET_DIR")" && cd "$(dirname "$TARGET_DIR")" && pwd)/$(basename "$TARGET_DIR")"

step "Validating tools"
NODE_VERSION="$(version_or_empty node --version)"
PNPM_VERSION="$(version_or_empty pnpm --version)"
CLAUDE_VERSION="$(version_or_empty claude --version)"
GIT_VERSION="$(version_or_empty git --version)"
GH_VERSION="$(version_or_empty gh --version)"
CODE_VERSION="$(version_or_empty code --version)"

if [ -z "$NODE_VERSION" ]; then
  echo "Node.js is not installed or is not in PATH. Install Node 20+ and run this script again." >&2
  exit 1
fi

if [ -z "$PNPM_VERSION" ] && has_command corepack; then
  step "pnpm is not in PATH; enabling pnpm with Corepack"
  corepack enable pnpm
  PNPM_VERSION="$(version_or_empty pnpm --version)"
fi

if [ -z "$PNPM_VERSION" ]; then
  echo "pnpm is not available. Run: npm install --global corepack@latest && corepack enable pnpm" >&2
  exit 1
fi

if [ -z "$CLAUDE_VERSION" ]; then
  echo "Claude Code is not available. Install it and sign in before continuing." >&2
  exit 1
fi

if [ -z "$GIT_VERSION" ]; then
  echo "git is not available. Install Git before continuing." >&2
  exit 1
fi

printf 'node:   %s\n' "$NODE_VERSION"
printf 'pnpm:   %s\n' "$PNPM_VERSION"
printf 'claude: %s\n' "$CLAUDE_VERSION"
printf 'git:    %s\n' "$GIT_VERSION"
if [ -n "$GH_VERSION" ]; then
  printf 'gh:     %s\n' "$GH_VERSION"
else
  printf 'gh:     not found; GitHub CLI PRs are optional\n'
fi
if [ -n "$CODE_VERSION" ]; then
  printf 'code:   %s\n' "$CODE_VERSION"
else
  printf 'code:   not found; automatic VS Code opening will be skipped\n'
fi

step "Preparing target folder"
if [ -d "$TARGET" ] && [ -n "$(find "$TARGET" -mindepth 1 -maxdepth 1 2>/dev/null)" ] && [ "$FORCE" -ne 1 ]; then
  echo "Target directory exists and is not empty: $TARGET. Use an empty folder or add --force." >&2
  exit 1
fi

mkdir -p "$TARGET/.vscode" "$TARGET/.claude" "$TARGET/prompts"

step "Writing MCP configuration"
cat > "$TARGET/.mcp.json" <<'EOF'
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
EOF

cat > "$TARGET/.vscode/mcp.json" <<'EOF'
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
EOF

step "Copying prompts"
cp "$PROMPT_SOURCE"/*.md "$TARGET/prompts/"

step "Creating PROJECT_BRIEF.md"
cat > "$TARGET/PROJECT_BRIEF.md" <<'EOF'
# PROJECT_BRIEF - AI Test Harness

## Mission

Create a new Playwright + TypeScript E2E framework for the target system using Claude Code.
The project must be generated incrementally, verified after each step, and optimized for maintainability.

## Target App

- UI: __UI_URL__
- API: __API_URL__

## Toolchain

- Claude Code as the primary agent.
- VS Code as the IDE.
- pnpm as package manager.
- Playwright for UI/API tests.
- Playwright MCP for real browser exploration before generating UI locators.

## Architecture Goals

- Create `TEST_PLAN.md` after the foundation and before feature implementation.
- Vertical slicing under `src/features/<feature>/`.
- Clean `src/core/` with no feature imports.
- Shared fixtures and test data under `src/shared/`.
- Design patterns with one clear home:
  - POM in feature pages.
  - Service/Adapter in feature services.
  - Template Method in BasePage/BaseService.
  - Factory/Builder only when useful.
  - Facade in feature flows.
  - Singleton in env.
  - Observer in reporter.
  - Strategy only when a discovered workflow needs interchangeable behavior.
  - DI in shared fixtures.

## Quality Rules

- No `waitForTimeout`.
- No XPath.
- No deep CSS selectors.
- Prefer `getByRole`, `getByLabel`, and `getByTestId`.
- Identifiers in English.
- Comments in Spanish only when they add context.
- No TODO placeholders.
- Keep prompts and changes small.
- Discover UI selectors and API endpoints before implementing tests.
- Run `pnpm typecheck` after structural changes.
- Run the relevant Playwright test after each slice.

## Token Efficiency Rules

- Persist architecture in `AGENTS.md`.
- Persist planned UI/API cases and confirmed endpoints in `TEST_PLAN.md`.
- Read files instead of pasting code.
- Generate one slice at a time.
- Fix one failing command at a time.
- Do not refactor unrelated files.
EOF
UI_URL_ESCAPED="$(escape_sed_replacement "$UI_URL")"
API_URL_ESCAPED="$(escape_sed_replacement "$API_URL")"
sed -i.bak \
  -e "s|__UI_URL__|$UI_URL_ESCAPED|g" \
  -e "s|__API_URL__|$API_URL_ESCAPED|g" \
  "$TARGET/PROJECT_BRIEF.md"
rm -f "$TARGET/PROJECT_BRIEF.md.bak"

step "Creating CLAUDE.md"
cat > "$TARGET/CLAUDE.md" <<'EOF'
# CLAUDE.md

Project instructions for Claude Code.

- Read `PROJECT_BRIEF.md` first.
- Read `AGENTS.md` when it exists.
- Read `TEST_PLAN.md` before creating or changing feature slices.
- Do not create app-specific code before `TEST_PLAN.md`.
- Keep changes small and verified.
- Prefer reading existing files over asking the user to paste code.
- Do not commit secrets, `.env`, reports, `node_modules`, or test artifacts.
EOF

step "Creating .gitignore"
cat > "$TARGET/.gitignore" <<'EOF'
node_modules/
test-results/
playwright-report/
blob-report/
.env
.auth/
dist/
coverage/
.DS_Store
EOF

step "Initializing git if needed"
if [ ! -d "$TARGET/.git" ]; then
  git -C "$TARGET" init >/dev/null
fi

if [ "$NO_OPEN_CODE" -ne 1 ] && [ -n "$CODE_VERSION" ]; then
  step "Opening VS Code"
  code "$TARGET" >/dev/null 2>&1 || true
fi

step "Done"
printf '\n\033[32mNext commands:\033[0m\n'
printf 'cd "%s"\n' "$TARGET"
printf 'claude\n\n'
printf 'Inside Claude Code, paste: prompts/01-bootstrap-environment.md\n'
