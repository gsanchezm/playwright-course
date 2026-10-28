# Adaptador Claude Code: COPIA agents/ y skills/ a .claude/ (copias, no symlinks).
# Idempotente. Nunca pisa .claude/settings.local.json ni un CLAUDE.md existente.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

New-Item -ItemType Directory -Force -Path '.claude/agents', '.claude/skills/qa-flow' | Out-Null
$agentes = Get-ChildItem -Path 'agents' -Filter '*.md'
foreach ($f in $agentes) { Copy-Item -Force $f.FullName (Join-Path '.claude/agents' $f.Name) }
Copy-Item -Force 'skills/qa-flow/SKILL.md' '.claude/skills/qa-flow/SKILL.md'
Write-Host "OK: $($agentes.Count) agentes copiados a .claude/agents/ y 1 skill (qa-flow) a .claude/skills/"

if (Test-Path 'CLAUDE.md') {
  Write-Host 'AVISO: CLAUDE.md ya existe, no se toca. Asegurate de que incluya la linea: @AGENTS.md'
} else {
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) 'CLAUDE.md'), "@AGENTS.md`n")
  Write-Host 'OK: CLAUDE.md creado con @AGENTS.md'
}

if (Test-Path '.claude/settings.local.json') {
  Write-Host 'AVISO: .claude/settings.local.json ya existe, no se toca.'
} else {
  Write-Host 'INFO: opcional, copia settings.local.json.example a .claude/settings.local.json (ver docs-adaptadores.md).'
}
