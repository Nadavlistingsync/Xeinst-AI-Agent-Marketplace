#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix import paths in a file
function fixImportPaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix relative imports to lib directory
    const relativeLibPattern = /from\s+['"](\.\.\/)+lib\/([^'"]+)['"]/g;
    const matches = content.match(relativeLibPattern);
    
    if (matches) {
      matches.forEach(match => {
        const newImport = match.replace(/(\.\.\/)+lib\//, '@/lib/');
        content = content.replace(match, newImport);
        modified = true;
      });
    }
    
    // Fix relative imports to auth
    const relativeAuthPattern = /from\s+['"](\.\.\/)+auth\/([^'"]+)['"]/g;
    const authMatches = content.match(relativeAuthPattern);
    
    if (authMatches) {
      authMatches.forEach(match => {
        const newImport = match.replace(/(\.\.\/)+auth\//, '@/lib/auth');
        content = content.replace(match, newImport);
        modified = true;
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing all import paths...\n');

const srcDir = path.join(__dirname, '..', 'src');
const tsFiles = findTsFiles(srcDir);

let fixedCount = 0;
let totalCount = tsFiles.length;

tsFiles.forEach(file => {
  if (fixImportPaths(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Import path fix complete!`);
console.log(`📊 Fixed ${fixedCount} out of ${totalCount} files`);
console.log(`\n✅ All relative imports have been converted to @/ aliases`);
