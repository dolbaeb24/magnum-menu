#!/bin/bash
set -euo pipefail

REPO_NAME="${1:-magnum-menu}"
BRANCH="${2:-cursor/family-meal-planner-4714}"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: GITHUB_TOKEN is not set"
  exit 1
fi

USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])")

echo "Creating repository $USER/$REPO_NAME..."
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Планировщик меню для семьи с ценами Magnum Алматы\",\"private\":false,\"auto_init\":false}" \
  https://api.github.com/user/repos > /dev/null

cd /agent
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${USER}/${REPO_NAME}.git"
git push -u origin "$BRANCH"
git branch -M main 2>/dev/null || true
git push -u origin main 2>/dev/null || git push -u origin "$BRANCH:main"

echo "Done! https://github.com/${USER}/${REPO_NAME}"
