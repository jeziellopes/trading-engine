#!/usr/bin/env bash
# sync-skills.sh — Sync .claude/skills/ → .agents/skills/ symlinks
#
# clinit installs external skills into .agents/skills/ and back-links them
# into .claude/skills/. Locally-created skills (.claude/skills/) don't get
# the reverse link automatically. Run this anytime skills go missing.
#
# Usage: pnpm sync-skills  OR  bash scripts/sync-skills.sh

set -euo pipefail

CLAUDE_SKILLS=".claude/skills"
AGENTS_SKILLS=".agents/skills"

if [ ! -d "$CLAUDE_SKILLS" ] || [ ! -d "$AGENTS_SKILLS" ]; then
  echo "✗ Run from project root (expected $CLAUDE_SKILLS and $AGENTS_SKILLS)"
  exit 1
fi

created=0
skipped=0

for skill_path in "$CLAUDE_SKILLS"/*/; do
  skill=$(basename "$skill_path")
  target="$AGENTS_SKILLS/$skill"

  if [ -e "$target" ] || [ -L "$target" ]; then
    skipped=$((skipped + 1))
  else
    ln -s "../../$CLAUDE_SKILLS/$skill" "$target"
    echo "  ✓ linked $skill"
    created=$((created + 1))
  fi
done

echo ""
echo "sync-skills: $created linked, $skipped already present"
