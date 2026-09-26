#!/usr/bin/env bash
set -euo pipefail

echo "=== Jeanius Monorepo Verification ==="

echo "1. Checking pnpm workspaces..."
pnpm ls -r --depth -1

echo "2. Running typecheck across all workspaces..."
pnpm turbo run typecheck

echo "3. Monorepo verified successfully!"
