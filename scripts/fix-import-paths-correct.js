#!/usr/bin/env node

import fs from 'fs';

// Map of file paths to correct relative paths to db-check
const pathMappings = {
  'src/app/api/dashboard/stats/route.ts': '../../../../lib/db-check',
  'src/app/api/notifications/route.ts': '../../../../lib/db-check',
  'src/app/api/deployments/route.ts': '../../../../lib/db-check',
  'src/app/api/products/route.ts': '../../../../lib/db-check',
  'src/app/api/agents/trending/route.ts': '../../../../lib/db-check',
  'src/app/api/agents/featured/route.ts': '../../../../lib/db-check',
  'src/app/api/agents/user/route.ts': '../../../../lib/db-check',
  'src/app/api/agents/upload/route.ts': '../../../../lib/db-check',
  'src/app/api/user/dashboard/route.ts': '../../../../lib/db-check',
  'src/app/api/user/me/route.ts': '../../../../lib/db-check',
  'src/app/api/upload/route.ts': '../../../../lib/db-check',
  'src/app/api/auth/signup/route.ts': '../../../../lib/db-check'
};

function fixImportPath(filePath, correctPath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace any db-check import with the correct path
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

console.log('🔧 Fixing db-check import paths with correct relative paths...\n');

let fixedCount = 0;
Object.entries(pathMappings).forEach(([filePath, correctPath]) => {
  if (fixImportPath(filePath, correctPath)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} import paths!`);
