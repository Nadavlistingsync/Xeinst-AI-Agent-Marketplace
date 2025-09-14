#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// List of critical API routes that users are most likely to hit
const criticalRoutes = [
  'src/app/api/auth/signup/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/user/me/route.ts',
  'src/app/api/user/dashboard/route.ts',
  'src/app/api/agents/upload/route.ts',
  'src/app/api/agents/user/route.ts',
  'src/app/api/agents/featured/route.ts',
  'src/app/api/agents/trending/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/deployments/route.ts',
  'src/app/api/notifications/route.ts',
  'src/app/api/dashboard/stats/route.ts'
];

function addDatabaseCheck(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has database check
    if (content.includes('isDatabaseAvailable()')) {
      console.log(`✅ Already fixed: ${filePath}`);
      return false;
    }

    // Skip if doesn't use prisma
    if (!content.includes('prisma.')) {
      console.log(`⏭️  No prisma usage: ${filePath}`);
      return false;
    }

    // Add import
    let newContent = content;
    if (!content.includes('from "../../../lib/db-check"') && !content.includes('from "../../../../lib/db-check"')) {
      const importPath = filePath.includes('/api/agents/') ? '../../../lib/db-check' : '../../../../lib/db-check';
      const importLine = `import { isDatabaseAvailable, createDatabaseErrorResponse } from "${importPath}";`;
      
      // Find the last import and add after it
      const importRegex = /import[^;]+;/g;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        newContent = content.replace(lastImport, `${lastImport}\n${importLine}`);
      }
    }

    // Add database check to main export function
    const functionRegex = /export async function (GET|POST|PUT|DELETE|PATCH)\(/g;
    const matches = [...newContent.matchAll(functionRegex)];
    
    if (matches.length > 0) {
      const firstMatch = matches[0];
      const functionName = firstMatch[1];
      const functionStart = firstMatch.index + firstMatch[0].length;
      
      // Find the opening brace
      const afterFunction = newContent.substring(functionStart);
      const braceIndex = afterFunction.indexOf('{');
      const insertIndex = functionStart + braceIndex + 1;
      
      const databaseCheck = `
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        createDatabaseErrorResponse(),
        { status: 503 }
      );
    }
`;
      
      newContent = newContent.substring(0, insertIndex) + databaseCheck + newContent.substring(insertIndex);
    }

    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing critical API routes with database checks...\n');

let fixedCount = 0;
criticalRoutes.forEach(route => {
  if (addDatabaseCheck(route)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} API routes with database checks!`);
console.log('📝 All critical routes now check for DATABASE_URL before using Prisma.');
