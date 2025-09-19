# 🔧 Automatic Debug Loop Setup

This project includes an automatic feedback loop for continuous debugging and development monitoring.

## 🚀 Quick Start

### Run the Auto Debug Loop
```bash
# One-time check
npm run debug:loop

# Continuous monitoring (watches for file changes)
npm run debug:watch
```

### Quick Fix Common Issues
```bash
# Auto-fix common linting and import issues
npm run quick-fix
```

### Health Check
```bash
# Run all checks (typecheck, lint, build)
npm run health-check
```

## 🔍 What the Debug Loop Monitors

1. **Linting** - ESLint checks for code quality
2. **Type Checking** - TypeScript compilation errors
3. **Build Process** - Next.js build success
4. **Tests** - Automated test execution (if configured)

## 📁 Debug Scripts Location

- `scripts/auto-debug-loop.sh` - Main monitoring script
- `scripts/quick-fix.sh` - Auto-fix common issues

## 🛠️ VS Code Integration

The project includes VS Code tasks for easy debugging:

1. **Auto Debug Loop** - Continuous monitoring
2. **Quick Fix** - One-click issue resolution
3. **Health Check** - Complete system check

Access via: `Cmd+Shift+P` → "Tasks: Run Task"

## 🔄 Continuous Integration

The debug loop automatically:

- ✅ Detects file changes
- 🔍 Runs comprehensive checks
- 📊 Reports issues immediately
- 🔧 Suggests fixes when possible

## 💡 Tips

- Run `npm run debug:watch` in a dedicated terminal
- Use `npm run quick-fix` after making bulk changes
- Check `npm run health-check` before committing
- Install `fswatch` for better file monitoring: `brew install fswatch`

## 🚨 Common Issues & Auto-Fixes

The system automatically handles:

- Import path corrections
- Missing component imports
- ESLint auto-fixable issues
- Code formatting with Prettier

## 📈 Performance Monitoring

The debug loop tracks:
- Build times
- Error frequency
- Fix success rate
- Development velocity

---

**Happy debugging! 🎉**
