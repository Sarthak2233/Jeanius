#!/usr/bin/env bash
set -euo pipefail

echo "=== Jeanius Monorepo Verification ==="

echo "1. Checking pnpm workspaces..."
pnpm ls -r --depth -1

echo "2. Running Prettier format check..."
pnpm run format:check

echo "3. Running ESLint across monorepo..."
pnpm run lint

echo "4. Running typecheck across all workspaces..."
pnpm turbo run typecheck

echo "5. Running build across all workspaces..."
pnpm turbo run build

echo "6. Monorepo verified successfully with 0 errors!"
