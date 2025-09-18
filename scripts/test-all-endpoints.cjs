#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script
 * Tests all critical API endpoints to ensure functionality
 */

const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

// Critical API endpoints to test
const ENDPOINTS = [
  // Public endpoints
  { path: '/api/health', method: 'GET', expectedStatus: [200, 503] },
  { path: '/api/agents/simple', method: 'GET', expectedStatus: [200] },
  { path: '/api/agents/featured', method: 'GET', expectedStatus: [200, 503] },
  { path: '/api/agents/trending', method: 'GET', expectedStatus: [200, 503] },
  
  // Auth endpoints
  { path: '/api/auth/signup', method: 'POST', expectedStatus: [400, 503], body: {} },
  
  // Agent endpoints
  { path: '/api/agents', method: 'GET', expectedStatus: [200, 503] },
  { path: '/api/agents/search', method: 'GET', expectedStatus: [200, 503] },
  { path: '/api/agents/stats', method: 'GET', expectedStatus: [401, 503] },
  
  // Protected endpoints (should return 401 without auth)
  { path: '/api/user/profile', method: 'GET', expectedStatus: [401, 503] },
  { path: '/api/dashboard/stats', method: 'GET', expectedStatus: [401, 503] },
  { path: '/api/agents/upload', method: 'POST', expectedStatus: [401, 503], body: {} },
  { path: '/api/credits/purchase', method: 'POST', expectedStatus: [401, 503], body: {} },
  
  // File endpoints
  { path: '/api/upload', method: 'POST', expectedStatus: [401, 503], body: {} },
  
  // Webhook endpoints
  { path: '/api/webhooks/examples', method: 'GET', expectedStatus: [200] },
  
  // Security endpoints
  { path: '/api/security/test?type=health', method: 'GET', expectedStatus: [200, 503] },
];

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: endpoint.method,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script/1.0'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          endpoint: endpoint
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message,
        endpoint: endpoint
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        error: 'Request timeout',
        endpoint: endpoint
      });
    });

    // Send body if provided
    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }

    req.end();
  });
}

function isExpectedStatus(actual, expected) {
  return expected.includes(actual);
}

function formatResult(result) {
  const { status, error, endpoint } = result;
  const expected = endpoint.expectedStatus;
  const passed = error ? false : isExpectedStatus(status, expected);
  
  return {
    path: endpoint.path,
    method: endpoint.method,
    status: status || 'ERROR',
    expected: expected.join(' | '),
    passed: passed,
    error: error,
    details: passed ? '✅ PASS' : `❌ FAIL${error ? ` (${error})` : ''}`
  };
}

async function runTests() {
  console.log('🚀 Starting comprehensive API endpoint tests...\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  
  testResults.total = ENDPOINTS.length;
  
  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      const result = await makeRequest(endpoint);
      const formatted = formatResult(result);
      
      testResults.details.push(formatted);
      
      if (formatted.passed) {
        testResults.passed++;
        console.log(`  ${formatted.details}`);
      } else {
        testResults.failed++;
        console.log(`  ${formatted.details}`);
        if (formatted.error) {
          console.log(`    Error: ${formatted.error}`);
        } else {
          console.log(`    Got status ${formatted.status}, expected ${formatted.expected}`);
        }
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push({
        path: endpoint.path,
        method: endpoint.method,
        status: 'ERROR',
        expected: endpoint.expectedStatus.join(' | '),
        passed: false,
        error: error.message,
        details: `❌ FAIL (${error.message})`
      });
      console.log(`  ❌ FAIL - ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Print summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  console.log(`Total tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ${r.method} ${r.path} - Status: ${r.status}, Expected: ${r.expected}`);
        if (r.error) console.log(`    Error: ${r.error}`);
      });
  }
  
  console.log('\n🎉 API endpoint testing completed!');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
