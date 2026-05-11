#!/usr/bin/env bash
# Dump the security_and_analysis block for every Renovate-enrolled
# teqbench repo to a text file. Useful for verifying that org-level
# security config changes (e.g. disabling Dependabot security updates)
# have propagated everywhere.
#
# Usage: ./audit-security-settings.sh [output-file]
# Default output file: security-audit.txt (in current directory).
#
# Requires: gh (authenticated), jq, node (to parse renovate-config.js).

set -euo pipefail

OUTPUT="${1:-security-audit.txt}"
CONFIG="$(dirname "$0")/renovate-config.js"

if [[ ! -f "$CONFIG" ]]; then
  echo "error: cannot find renovate-config.js at $CONFIG" >&2
  exit 1
fi

{
  echo "===================================================================="
  echo "Security audit run: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Source: $CONFIG"
  echo "===================================================================="
  echo ""
} >> "$OUTPUT"

repos=$(node -p "require('$CONFIG').repositories.join('\n')")

while IFS= read -r repo; do
  [[ -z "$repo" ]] && continue
  {
    echo "----- ${repo} -----"
    if ! gh api "/repos/${repo}" 2>/dev/null | jq '.security_and_analysis'; then
      echo "(failed to fetch — check repo name, permissions, or network)"
    fi
    echo ""
  } >> "$OUTPUT"
  echo "✓ ${repo}" >&2
done <<< "$repos"

echo "" >&2
echo "Wrote results to ${OUTPUT}" >&2
