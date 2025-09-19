#!/bin/bash

# Quick Fix Script - Automatically fix common issues

echo "🔧 Quick Fix Script for Xeinst AI Agent Marketplace"
echo "🚀 Attempting to fix common build and linting issues..."

# Fix import issues
echo "📦 Fixing import paths..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/@\/components/..\/..\/components/g' 2>/dev/null || true
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/@\/lib/..\/..\/lib/g' 2>/dev/null || true

# Fix missing imports
echo "🔍 Checking for missing UI component imports..."
if grep -r "PageHeader\|Section\|GlowInput" src/app --include="*.tsx" | grep -v "import.*PageHeader\|import.*Section\|import.*GlowInput"; then
    echo "⚠️  Found components without imports. Adding imports..."
    # This would need more sophisticated logic to fix automatically
    echo "💡 Manual fix required - check the files above"
fi

# Run linter with auto-fix
echo "🔧 Running ESLint with auto-fix..."
npm run lint -- --fix 2>/dev/null || echo "⚠️  Some linting issues couldn't be auto-fixed"

# Format code
echo "💅 Formatting code with Prettier..."
npx prettier --write "src/**/*.{ts,tsx,js,jsx}" 2>/dev/null || echo "⚠️  Prettier not configured"

# Check if build passes
echo "🏗️  Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build is working!"
else
    echo "❌ Build still has issues. Running detailed build..."
    npm run build
fi

echo ""
echo "✨ Quick fix completed!"
echo "💡 For continuous monitoring, run: ./scripts/auto-debug-loop.sh --watch"
