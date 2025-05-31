const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Replace import { db } from '@/lib/db' with import db from '@/lib/db'
  const updatedContent = content.replace(
    /import\s*{\s*db\s*}\s*from\s*['"]@\/lib\/db['"]/g,
    'import db from \'@/lib/db\''
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(file, updatedContent);
    console.log(`Updated imports in ${file}`);
  }
}); 