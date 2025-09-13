#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory (two levels up from scripts/)
const projectRoot = path.join(__dirname, '..');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git, and other build/cache directories
      if (!['node_modules', '.next', '.git', 'dist', 'build', 'coverage'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      // Skip test files and documentation
      if (!file.includes('.test.') && !file.includes('.spec.') && !file.includes('SENTRY_SETUP.md') && !file.includes('ALIAS_IMPORT_FIXES.md')) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

function calculateRelativePath(fromFile, toTarget) {
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, toTarget);
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
}

function fixAliasImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let newContent = content;
  
  // Pattern to match @/ imports
  const aliasPattern = /from\s+['"]@\/([^'"]+)['"]/g;
  const dynamicImportPattern = /import\s*\(\s*['"]@\/([^'"]+)['"]\s*\)/g;
  
  // Calculate relative path from current file to src directory
  const srcDir = path.join(projectRoot, 'src');
  const relativeToSrc = path.relative(path.dirname(filePath), srcDir);
  
  // Replace @/ imports with relative paths
  newContent = newContent.replace(aliasPattern, (match, importPath) => {
    const targetPath = path.join(srcDir, importPath);
    const relativePath = calculateRelativePath(filePath, targetPath);
    modified = true;
    return `from '${relativePath.replace(/\\/g, '/')}'`;
  });
  
  // Replace dynamic @/ imports
  newContent = newContent.replace(dynamicImportPattern, (match, importPath) => {
    const targetPath = path.join(srcDir, importPath);
    const relativePath = calculateRelativePath(filePath, targetPath);
    modified = true;
    return `import('${relativePath.replace(/\\/g, '/')}')`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed: ${path.relative(projectRoot, filePath)}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🔍 Finding all TypeScript/JavaScript files...');
  
  const srcDir = path.join(projectRoot, 'src');
  const allFiles = getAllFiles(srcDir);
  
  console.log(`📁 Found ${allFiles.length} files to check`);
  
  let fixedCount = 0;
  
  for (const file of allFiles) {
    if (fixAliasImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed @ alias imports in ${fixedCount} files!`);
  
  // Verify no @ alias imports remain
  console.log('\n🔍 Verifying no @ alias imports remain...');
  let remainingCount = 0;
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('@/')) {
      remainingCount++;
      console.log(`⚠️  Still has @ alias: ${path.relative(projectRoot, file)}`);
    }
  }
  
  if (remainingCount === 0) {
    console.log('✅ No @ alias imports remain!');
  } else {
    console.log(`⚠️  ${remainingCount} files still have @ alias imports`);
  }
}

main().catch(console.error);
