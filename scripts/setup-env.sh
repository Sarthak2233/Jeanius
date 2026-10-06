#!/usr/bin/env bash
# ==============================================================================
# JEANIUS MONOREPO — ENVIRONMENT UNIFICATION SETUP SCRIPT
# ==============================================================================
# This script ensures that all apps and packages in the monorepo reference a
# single source of truth: the root `.env.local` file.
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔧 Setting up Jeanius Monorepo environment configuration..."

# 1. Ensure root .env.local exists
if [ ! -f "$ROOT_DIR/.env.local" ]; then
  if [ -f "$ROOT_DIR/.env" ]; then
    echo "📄 Creating .env.local from .env at repository root..."
    cp "$ROOT_DIR/.env" "$ROOT_DIR/.env.local"
  elif [ -f "$ROOT_DIR/.env.example" ]; then
    echo "📄 Creating .env.local from .env.example at repository root..."
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"
  else
    echo "❌ Error: Neither .env nor .env.example found at repository root!" >&2
    exit 1
  fi
fi

# 2. Helper to create relative symlink
link_env() {
  local target_dir="$1"
  local target_file="$2"
  local relative_path="$3"

  mkdir -p "$ROOT_DIR/$target_dir"
  rm -f "$ROOT_DIR/$target_dir/$target_file"
  (cd "$ROOT_DIR/$target_dir" && ln -sf "$relative_path" "$target_file")
  echo "🔗 Linked $target_dir/$target_file -> $relative_path"
}

# 3. Create relative symlinks so apps and database read directly from root
link_env "apps/storefront" ".env.local" "../../.env.local"
link_env "apps/admin" ".env.local" "../../.env.local"
link_env "packages/database" ".env" "../../.env.local"

echo "✅ Environment unified! All apps read from: $ROOT_DIR/.env.local"
echo "💡 You now only need to maintain one file: .env.local at the root of the project."
