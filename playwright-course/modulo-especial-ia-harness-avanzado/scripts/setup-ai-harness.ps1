param(
  [Parameter(Mandatory = $true)]
  [string] $TargetDir,

  [string] $UiUrl = "https://omnipizza-frontend.onrender.com",
  [string] $ApiUrl = "https://omnipizza-backend.onrender.com",

  [switch] $Force,
  [switch] $NoOpenCode
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string] $Message)
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command {
  param([string] $Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  return $null -ne $cmd
}

function Invoke-Version {
  param(
    [string] $Name,
    [string[]] $CommandArgs = @("--version")
  )

  if (-not (Test-Command $Name)) {
    return $null
  }

  try {
    return (& $Name @CommandArgs 2>$null | Select-Object -First 1)
  } catch {
    return "installed, version check failed"
  }
}

$moduleRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$promptSource = Join-Path $moduleRoot "prompts"
$target = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($TargetDir)

Write-Step "Validando herramientas"
$nodeVersion = Invoke-Version "node"
$pnpmVersion = Invoke-Version "pnpm"
$claudeVersion = Invoke-Version "claude"
$gitVersion = Invoke-Version "git"
$ghVersion = Invoke-Version "gh"
$codeVersion = Invoke-Version "code" -CommandArgs @("--version")

if (-not $nodeVersion) {
  throw "Node.js no esta instalado o no esta en PATH. Instala Node 20+ y vuelve a ejecutar."
}

if (-not $pnpmVersion) {
  if (Test-Command "corepack") {
    Write-Step "pnpm no esta en PATH; habilitando pnpm con Corepack"
    corepack enable pnpm
    $pnpmVersion = Invoke-Version "pnpm"
  }
}

if (-not $pnpmVersion) {
  throw "pnpm no esta disponible. Ejecuta: npm install --global corepack@latest; corepack enable pnpm"
}

if (-not $claudeVersion) {
  throw "Claude Code no esta disponible. Instala/inicia sesion en Claude Code antes de continuar."
}

if (-not $gitVersion) {
  throw "git no esta disponible. Instala Git antes de continuar."
}

Write-Host "node:   $nodeVersion"
Write-Host "pnpm:   $pnpmVersion"
Write-Host "claude: $claudeVersion"
Write-Host "git:    $gitVersion"
if ($ghVersion) {
  Write-Host "gh:     $ghVersion"
} else {
  Write-Host "gh:     no encontrado; PRs con GitHub CLI seran opcionales"
}
if ($codeVersion) {
  Write-Host "code:   $($codeVersion -join ' ')"
} else {
  Write-Host "code:   no encontrado; se omite apertura automatica de VS Code"
}

Write-Step "Preparando carpeta destino"
if (Test-Path -LiteralPath $target) {
  $items = Get-ChildItem -LiteralPath $target -Force
  if ($items.Count -gt 0 -and -not $Force) {
    throw "La carpeta destino existe y no esta vacia: $target. Usa una carpeta vacia o agrega -Force."
  }
} else {
  New-Item -ItemType Directory -Path $target | Out-Null
}

New-Item -ItemType Directory -Force -Path (Join-Path $target ".vscode") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $target ".claude") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $target "prompts") | Out-Null

Write-Step "Escribiendo configuracion MCP"
$claudeMcp = @'
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
'@
Set-Content -LiteralPath (Join-Path $target ".mcp.json") -Value $claudeMcp -Encoding utf8

$vscodeMcp = @'
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
'@
Set-Content -LiteralPath (Join-Path $target ".vscode\mcp.json") -Value $vscodeMcp -Encoding utf8

Write-Step "Copiando prompts"
Copy-Item -Path (Join-Path $promptSource "*.md") -Destination (Join-Path $target "prompts") -Force

Write-Step "Creando PROJECT_BRIEF.md"
$projectBrief = @'
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
'@
$projectBrief = $projectBrief.Replace("__UI_URL__", $UiUrl).Replace("__API_URL__", $ApiUrl)
Set-Content -LiteralPath (Join-Path $target "PROJECT_BRIEF.md") -Value $projectBrief -Encoding utf8

Write-Step "Creando CLAUDE.md"
$claudeInstructions = @'
# CLAUDE.md

Project instructions for Claude Code.

- Read `PROJECT_BRIEF.md` first.
- Read `AGENTS.md` when it exists.
- Read `TEST_PLAN.md` before creating or changing feature slices.
- Do not create app-specific code before `TEST_PLAN.md`.
- Keep changes small and verified.
- Prefer reading existing files over asking the user to paste code.
- Do not commit secrets, `.env`, reports, `node_modules`, or test artifacts.
'@
Set-Content -LiteralPath (Join-Path $target "CLAUDE.md") -Value $claudeInstructions -Encoding utf8

Write-Step "Creando .gitignore"
$gitignore = @'
node_modules/
test-results/
playwright-report/
blob-report/
.env
.auth/
dist/
coverage/
.DS_Store
'@
Set-Content -LiteralPath (Join-Path $target ".gitignore") -Value $gitignore -Encoding utf8

Write-Step "Inicializando git si hace falta"
if (-not (Test-Path -LiteralPath (Join-Path $target ".git"))) {
  git -C $target init | Out-Null
}

if (-not $NoOpenCode -and $codeVersion) {
  Write-Step "Abriendo VS Code"
  code $target | Out-Null
}

Write-Step "Listo"
Write-Host ""
Write-Host "Siguientes comandos:" -ForegroundColor Green
Write-Host "cd `"$target`""
Write-Host "claude"
Write-Host ""
Write-Host "Dentro de Claude Code, pega: prompts/01-bootstrap-environment.md"
