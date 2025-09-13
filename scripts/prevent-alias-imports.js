#!/usr/bin/env node

/**
 * Script to prevent future @ alias import issues
 * This script should be run before committing to ensure no @ alias imports are added
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        if (!['node_modules', '.next', '.git', 'dist', 'build', 'coverage'].includes(file)) {
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

// Function to check for @ alias imports in a file
function checkAliasImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      // Check for @ alias imports
      if (line.includes('from "@/') || line.includes('import("@/') || line.includes('require("@/')) {
        issues.push({
          line: index + 1,
          content: line.trim(),
          file: filePath
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Main execution
console.log('🔍 Checking for @ alias imports...');

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);

console.log(`Found ${files.length} files to check`);

let totalIssues = 0;
const filesWithIssues = [];

files.forEach(file => {
  const issues = checkAliasImports(file);
  if (issues.length > 0) {
    filesWithIssues.push({
      file,
      issues
    });
    totalIssues += issues.length;
  }
});

if (totalIssues > 0) {
  console.log(`\n❌ Found ${totalIssues} @ alias imports in ${filesWithIssues.length} files:\n`);
  
  filesWithIssues.forEach(({ file, issues }) => {
    console.log(`📁 ${file}:`);
    issues.forEach(({ line, content }) => {
      console.log(`  Line ${line}: ${content}`);
    });
    console.log('');
  });
  
  console.log('🔧 To fix these issues, run:');
  console.log('   node fix-all-aliases.js');
  console.log('\n❌ Commit blocked due to @ alias imports!');
  process.exit(1);
} else {
  console.log('✅ No @ alias imports found!');
  console.log('🚀 Safe to commit!');
  process.exit(0);
}
