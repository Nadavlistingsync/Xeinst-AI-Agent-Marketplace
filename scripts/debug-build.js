#!/usr/bin/env node

/**
 * Debug Build Script
 * Enhanced logging for Vercel deployment debugging
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting build debug analysis...');

// Check critical files
const criticalFiles = [
  'src/components/EditAgentForm.tsx',
  'src/components/ui/GlowButton.tsx',
  'src/components/ui/GlassCard.tsx',
  'src/components/ui/GlowInput.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/badge.tsx',
  'src/app/agent/[id]/edit/page.tsx',
  'src/app/auth/signin/page.tsx',
  'src/app/changelog/page.tsx'
];

console.log('\n📁 Checking critical files:');
criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - EXISTS`);
    
    // Check for syntax issues
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic syntax checks
      if (content.includes('import') && content.includes('from')) {
        console.log(`   📦 Has imports`);
      }
      
      if (content.includes('export')) {
        console.log(`   📤 Has exports`);
      }
      
      // Check for common issues
      if (content.includes('EnhancedAppError') && !content.includes('// import')) {
        console.log(`   ⚠️  Uses EnhancedAppError (may cause issues)`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error reading file: ${error.message}`);
    }
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check package.json
console.log('\n📦 Checking package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package name: ${packageJson.name}`);
  console.log(`✅ Next.js version: ${packageJson.dependencies?.next || 'not found'}`);
  console.log(`✅ Build script: ${packageJson.scripts?.build || 'not found'}`);
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
}

// Check tsconfig.json
console.log('\n⚙️  Checking TypeScript config:');
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  console.log(`✅ Base URL: ${tsconfig.compilerOptions?.baseUrl || 'not set'}`);
  console.log(`✅ Paths: ${JSON.stringify(tsconfig.compilerOptions?.paths || {})}`);
} catch (error) {
  console.log(`❌ Error reading tsconfig.json: ${error.message}`);
}

// Check next.config
console.log('\n🔧 Checking Next.js config:');
try {
  if (fs.existsSync('next.config.cjs')) {
    console.log(`✅ next.config.cjs exists`);
  } else if (fs.existsSync('next.config.js')) {
    console.log(`✅ next.config.js exists`);
  } else {
    console.log(`❌ No Next.js config found`);
  }
} catch (error) {
  console.log(`❌ Error checking Next.js config: ${error.message}`);
}

console.log('\n🎯 Build debug analysis complete!');
console.log('💡 If you see any ❌ errors above, those are likely causing the build failures.');
