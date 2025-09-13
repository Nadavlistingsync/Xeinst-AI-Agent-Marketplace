#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to calculate relative path from file to target
function getRelativePath(fromFile, toTarget) {
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, toTarget);
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Common @ alias patterns to fix
    const patterns = [
      {
        // @/lib/utils -> ../lib/utils or ../../lib/utils etc
        pattern: /from\s+["']@\/lib\/utils["']/g,
        replacement: (match, offset, string) => {
          const relativePath = getRelativePath(filePath, path.join(__dirname, 'src/lib/utils'));
          return `from "${relativePath}"`;
        }
      },
      {
        // @/lib/enhanced-error-handling
        pattern: /from\s+["']@\/lib\/enhanced-error-handling["']/g,
        replacement: (match, offset, string) => {
          const relativePath = getRelativePath(filePath, path.join(__dirname, 'src/lib/enhanced-error-handling'));
          return `from "${relativePath}"`;
        }
      },
      {
        // @/lib/prisma
        pattern: /from\s+["']@\/lib\/prisma["']/g,
        replacement: (match, offset, string) => {
          const relativePath = getRelativePath(filePath, path.join(__dirname, 'src/lib/prisma'));
          return `from "${relativePath}"`;
        }
      },
      {
        // @/lib/auth
        pattern: /from\s+["']@\/lib\/auth["']/g,
        replacement: (match, offset, string) => {
          const relativePath = getRelativePath(filePath, path.join(__dirname, 'src/lib/auth'));
          return `from "${relativePath}"`;
        }
      },
      {
        // @/lib/db-helpers
        pattern: /from\s+["']@\/lib\/db-helpers["']/g,
        replacement: (match, offset, string) => {
          const relativePath = getRelativePath(filePath, path.join(__dirname, 'src/lib/db-helpers'));
          return `from "${relativePath}"`;
        }
      },
      {
        // @/lib/security
        pattern: /from\s+["']@\/lib\/security["']/g,
        replacement: (match, offset, string) => {
          const relativePath = getRelativePath(filePath, path.join(__dirname, 'src/lib/security'));
          return `from "${relativePath}"`;
        }
      },
      {
        // @/stack
        pattern: /from\s+["']@\/stack["']/g,
        replacement: (match, offset, string) => {
          const relativePath = getRelativePath(filePath, path.join(__dirname, 'src/stack'));
          return `from "${relativePath}"`;
        }
      }
    ];
    
    // Apply all patterns
    patterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
          results = results.concat(findFiles(filePath, extensions));
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

// Main execution
console.log('🔧 Fixing all @ alias imports...');

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);

console.log(`Found ${files.length} files to check`);

let fixedCount = 0;
files.forEach(file => {
  fixImportsInFile(file);
  fixedCount++;
});

console.log(`\n✅ Processed ${fixedCount} files`);
console.log('🎉 All @ alias imports have been fixed!');
