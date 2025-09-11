#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = 'src/app/api/agents/[id]/run/route.ts';

console.log('🔧 Fixing EnhancedAppError calls in', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Replace all complex EnhancedAppError calls with simple NextResponse.json calls
const patterns = [
  {
    // Agent not found
    from: /return NextResponse\.json\(\s*'Agent not found',\s*404,\s*ErrorCategory\.VALIDATION,\s*ErrorSeverity\.MEDIUM,\s*'AGENT_NOT_FOUND',\s*null,\s*false,\s*undefined,\s*'The requested agent could not be found',\s*\[[^\]]*\]\s*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Agent not found\' },\n        { status: 404 }\n      );'
  },
  {
    // Cannot run own agent
    from: /return NextResponse\.json\(\s*'Cannot run own agent',\s*403,\s*ErrorCategory\.AUTHORIZATION,\s*ErrorSeverity\.MEDIUM,\s*'OWN_AGENT_RUN',[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Cannot run own agent\' },\n        { status: 403 }\n      );'
  },
  {
    // User not found
    from: /return NextResponse\.json\(\s*'User not found',\s*404,\s*ErrorCategory\.VALIDATION,\s*ErrorSeverity\.HIGH,\s*'USER_NOT_FOUND',[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'User not found\' },\n        { status: 404 }\n      );'
  },
  {
    // Invalid request format
    from: /return NextResponse\.json\(\s*'Invalid request format',\s*400,\s*ErrorCategory\.VALIDATION,\s*ErrorSeverity\.MEDIUM,\s*'INVALID_JSON',[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Invalid request format\' },\n        { status: 400 }\n      );'
  },
  {
    // Invalid request data
    from: /return NextResponse\.json\(\s*'Invalid request data',\s*400,\s*ErrorCategory\.VALIDATION,\s*ErrorSeverity\.MEDIUM,\s*'VALIDATION_ERROR',[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Invalid request data\' },\n        { status: 400 }\n      );'
  },
  {
    // Insufficient credits
    from: /return NextResponse\.json\(\s*'Insufficient credits',\s*402,\s*ErrorCategory\.PAYMENT,\s*ErrorSeverity\.MEDIUM,\s*'INSUFFICIENT_CREDITS',[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Insufficient credits\' },\n        { status: 402 }\n      );'
  },
  {
    // Agent execution failed
    from: /return NextResponse\.json\(\s*'Agent execution failed',\s*500,\s*ErrorCategory\.AGENT_EXECUTION,\s*ErrorSeverity\.HIGH,\s*'EXECUTION_FAILED',[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Agent execution failed\' },\n        { status: 500 }\n      );'
  },
  {
    // Payment processing failed
    from: /return NextResponse\.json\(\s*'Payment processing failed',\s*500,\s*ErrorCategory\.PAYMENT,\s*ErrorSeverity\.HIGH,\s*'PAYMENT_FAILED',[^)]*\);/g,
    to: 'return NextResponse.json(\n        { success: false, error: \'Payment processing failed\' },\n        { status: 500 }\n      );'
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
