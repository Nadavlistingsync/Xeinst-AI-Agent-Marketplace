#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// List of files with incorrect import paths
const filesToFix = [
  'src/app/api/dashboard/stats/route.ts',
  'src/app/api/notifications/route.ts',
  'src/app/api/deployments/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/agents/trending/route.ts',
  'src/app/api/agents/featured/route.ts',
  'src/app/api/agents/user/route.ts',
  'src/app/api/agents/upload/route.ts',
  'src/app/api/user/dashboard/route.ts',
  'src/app/api/user/me/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/auth/signup/route.ts'
];

function fixImportPath(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Calculate the correct relative path to db-check
    const pathParts = filePath.split('/');
    const depth = pathParts.filter(part => part === 'api' || part === '..').length;
    
    // For files in src/app/api/*/route.ts, we need to go up 4 levels to reach src/lib/
    // For files in src/app/api/*/*/route.ts, we need to go up 5 levels
    let correctPath;
    if (pathParts.includes('agents') && pathParts.length > 6) {
      // Files like src/app/api/agents/featured/route.ts
      correctPath = '../../../../lib/db-check';
    } else if (pathParts.length > 6) {
      // Files like src/app/api/user/me/route.ts
      correctPath = '../../../../lib/db-check';
    } else {
      // Files like src/app/api/upload/route.ts
      correctPath = '../../../lib/db-check';
    }
    
    // Replace the incorrect import path
    const incorrectPattern = /from\s+['"][^'"]*db-check['"]/;
    const correctImport = `from "${correctPath}"`;
    
    if (content.match(incorrectPattern)) {
      const newContent = content.replace(incorrectPattern, correctImport);
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed: ${filePath} -> ${correctPath}`);
      return true;
    } else {
      console.log(`⏭️  No db-check import found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing db-check import paths...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  if (fixImportPath(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} import paths!`);
