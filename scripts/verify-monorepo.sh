#!/usr/bin/env bash
set -euo pipefail

echo "=== Jeanius Monorepo Verification ==="

echo "1. Checking pnpm workspaces..."
pnpm ls -r --depth -1

echo "2. Running build across all workspaces..."
pnpm turbo run build

echo "3. Running typecheck across all workspaces..."
pnpm turbo run typecheck

echo "4. Monorepo verified successfully!"
