#!/bin/bash
set -e

BRANCH_NAME="updated-theme-readme"

git config --global user.email "no-reply@githubreadmestats.com"
git config --global user.name "GitHub Readme Stats Bot"
git config --global --add safe.directory "${GITHUB_WORKSPACE:-$(git rev-parse --show-toplevel)}"

# Exit early if there are no changes to push
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit, skipping push."
  exit 0
fi

# Delete local branch if it exists (suppress the "not found" error)
git branch -D "$BRANCH_NAME" 2>/dev/null || true

git checkout -b "$BRANCH_NAME"
git add --all
git commit --no-verify --message "docs(theme): auto update theme readme"
git push --force --quiet "https://${PERSONAL_TOKEN}@github.com/${GH_REPO}.git" "$BRANCH_NAME"
