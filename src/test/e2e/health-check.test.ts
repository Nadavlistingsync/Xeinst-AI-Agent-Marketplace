import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { parse } from 'url';
import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

describe('Health Check E2E', () => {
  it('health endpoint returns correct status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
    expect(data.version).toBeDefined();
  });

  it('health endpoint includes system information', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.system).toBeDefined();
    expect(data.system.memory).toBeDefined();
    expect(data.system.cpu).toBeDefined();
    expect(data.system.platform).toBeDefined();
    expect(data.system.nodeVersion).toBeDefined();
  });

  it('health endpoint includes database status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.database).toBeDefined();
    expect(data.database.status).toBeDefined();
    expect(data.database.responseTime).toBeDefined();
  });

  it('health endpoint includes external services status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.services).toBeDefined();
    expect(data.services.redis).toBeDefined();
    expect(data.services.stripe).toBeDefined();
  });

  it('health endpoint includes performance metrics', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.performance).toBeDefined();
    expect(data.performance.responseTime).toBeDefined();
    expect(data.performance.memoryUsage).toBeDefined();
  });
}); 