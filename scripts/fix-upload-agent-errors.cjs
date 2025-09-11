#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = 'src/app/api/upload-agent/route.ts';

console.log('🔧 Fixing EnhancedAppError calls in', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Replace all complex EnhancedAppError calls with simple NextResponse.json calls
const patterns = [
  {
    // Authentication required
    from: /return NextResponse\.json\(\s*'Authentication required',\s*401,\s*ErrorCategory\.AUTHENTICATION,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Authentication required\' },\n        { status: 401 }\n      );'
  },
  {
    // Upload limit exceeded
    from: /return NextResponse\.json\(\s*'Upload limit exceeded',\s*429,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Upload limit exceeded\' },\n        { status: 429 }\n      );'
  },
  {
    // Invalid form data
    from: /return NextResponse\.json\(\s*'Invalid form data',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Invalid form data\' },\n        { status: 400 }\n      );'
  },
  {
    // Missing required fields
    from: /return NextResponse\.json\(\s*'Missing required fields',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Missing required fields\' },\n        { status: 400 }\n      );'
  },
  {
    // Invalid file type
    from: /return NextResponse\.json\(\s*'Invalid file type',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Invalid file type\' },\n        { status: 400 }\n      );'
  },
  {
    // File too large
    from: /return NextResponse\.json\(\s*'File too large',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'File too large\' },\n        { status: 400 }\n      );'
  },
  {
    // Invalid agent name
    from: /return NextResponse\.json\(\s*'Invalid agent name',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Invalid agent name\' },\n        { status: 400 }\n      );'
  },
  {
    // Invalid description
    from: /return NextResponse\.json\(\s*'Invalid description',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Invalid description\' },\n        { status: 400 }\n      );'
  },
  {
    // Invalid price
    from: /return NextResponse\.json\(\s*'Invalid price',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Invalid price\' },\n        { status: 400 }\n      );'
  },
  {
    // Too many tags
    from: /return NextResponse\.json\(\s*'Too many tags',\s*400,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Too many tags\' },\n        { status: 400 }\n      );'
  },
  {
    // Agent name already exists
    from: /return NextResponse\.json\(\s*'Agent name already exists',\s*409,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Agent name already exists\' },\n        { status: 409 }\n      );'
  },
  {
    // File processing failed
    from: /return NextResponse\.json\(\s*'File processing failed',\s*500,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'File processing failed\' },\n        { status: 500 }\n      );'
  },
  {
    // File upload failed
    from: /return NextResponse\.json\(\s*'File upload failed',\s*500,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'File upload failed\' },\n        { status: 500 }\n      );'
  },
  {
    // Agent creation failed
    from: /return NextResponse\.json\(\s*'Agent creation failed',\s*500,[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Agent creation failed\' },\n        { status: 500 }\n      );'
  }
];

let changes = 0;
patterns.forEach((pattern, index) => {
  const matches = content.match(pattern.from);
  if (matches) {
    content = content.replace(pattern.from, pattern.to);
    changes += matches.length;
    console.log(`✅ Fixed ${matches.length} instances of pattern ${index + 1}`);
  }
});

if (changes > 0) {
  fs.writeFileSync(filePath, content);
  console.log(`🎉 Fixed ${changes} EnhancedAppError calls!`);
} else {
  console.log('ℹ️  No EnhancedAppError calls found to fix');
}
