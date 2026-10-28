#!/usr/bin/env bash
# Adaptador Claude Code: COPIA agents/ y skills/ a .claude/ (copias, no symlinks).
# Idempotente. Nunca pisa .claude/settings.local.json ni un CLAUDE.md existente.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p .claude/agents .claude/skills/qa-flow
n=0
for f in agents/*.md; do
  cp -f "$f" ".claude/agents/$(basename "$f")"
  n=$((n + 1))
done
cp -f skills/qa-flow/SKILL.md .claude/skills/qa-flow/SKILL.md
echo "OK: $n agentes copiados a .claude/agents/ y 1 skill (qa-flow) a .claude/skills/"

if [ -f CLAUDE.md ]; then
  echo "AVISO: CLAUDE.md ya existe, no se toca. Asegurate de que incluya la linea: @AGENTS.md"
else
  printf '@AGENTS.md\n' > CLAUDE.md
  echo "OK: CLAUDE.md creado con @AGENTS.md"
fi

if [ -f .claude/settings.local.json ]; then
  echo "AVISO: .claude/settings.local.json ya existe, no se toca."
else
  echo "INFO: opcional, copia settings.local.json.example a .claude/settings.local.json (ver docs-adaptadores.md)."
fi
