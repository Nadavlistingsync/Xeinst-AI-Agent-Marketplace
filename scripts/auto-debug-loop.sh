#!/bin/bash

# Automatic Debug Loop Script
# This script monitors for changes and automatically runs tests, linting, and builds

echo "🔧 Starting Automatic Debug Loop for Xeinst AI Agent Marketplace"
echo "📁 Monitoring: $(pwd)"
echo "⏰ Started at: $(date)"
echo ""

# Function to run all checks
run_checks() {
    echo "🔍 Running automated checks..."
    
    # 1. Lint check
    echo "📋 Running linter..."
    if npm run lint --silent; then
        echo "✅ Linting passed"
    else
        echo "❌ Linting failed - check output above"
    fi
    
    # 2. Type check
    echo "🔍 Running type check..."
    if npx tsc --noEmit; then
        echo "✅ Type checking passed"
    else
        echo "❌ Type checking failed - check output above"
    fi
    
    # 3. Build check
    echo "🏗️  Running build check..."
    if npm run build > /dev/null 2>&1; then
        echo "✅ Build passed"
    else
        echo "❌ Build failed - running detailed build..."
        npm run build
    fi
    
    # 4. Test check (if tests exist)
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        echo "🧪 Running tests..."
        if npm test -- --passWithNoTests; then
            echo "✅ Tests passed"
        else
            echo "❌ Tests failed - check output above"
        fi
    fi
    
    echo ""
    echo "📊 Check completed at: $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Function to monitor file changes (if fswatch is available)
monitor_changes() {
    if command -v fswatch >/dev/null 2>&1; then
        echo "👀 Monitoring file changes with fswatch..."
        fswatch -o src/ | while read num; do
            echo "📝 File changes detected, running checks..."
            run_checks
        done
    else
        echo "⚠️  fswatch not available. Install with: brew install fswatch"
        echo "🔄 Running checks every 30 seconds instead..."
        while true; do
            sleep 30
            run_checks
        done
    fi
}

# Initial check
run_checks

# Check if we should monitor continuously
if [ "$1" = "--watch" ] || [ "$1" = "-w" ]; then
    monitor_changes
else
    echo "💡 Run with --watch or -w to monitor file changes continuously"
    echo "💡 Or run manually anytime with: ./scripts/auto-debug-loop.sh"
fi
