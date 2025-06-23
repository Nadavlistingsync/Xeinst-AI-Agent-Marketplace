# Webhook Agent API Documentation

## Overview

The Webhook Agent API allows users to run AI agents by calling external webhooks. Each agent has a configuration stored in the database containing a `webhook_url` that will be called with the provided inputs.

## API Endpoint

### POST `/api/run-agent`

Executes an agent by calling its configured webhook URL.

#### Request Body

```json
{
  "agentId": "agent-1",
  "inputs": {
    "query": "Miami real estate agents",
    "limit": 10,
    "filters": {
      "location": "Miami, FL",
      "type": "residential"
    }
  }
}
```

#### Response Format

**Success Response (200)**
```json
{
  "success": true,
  "agentId": "agent-1",
  "agentName": "Lead Scraper",
  "executionTime": 1250,
  "result": {
    "leads": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0123"
      }
    ],
    "totalFound": 1
  },
  "webhookStatus": 200
}
```

**Error Response (4xx/5xx)**
```json
{
  "success": false,
  "error": "Agent not found",
  "agentId": "invalid-agent-id"
}
```

## Features

### ✅ Implemented

- **Agent Lookup**: Retrieves agent configuration from database
- **Webhook Execution**: Calls external webhooks with provided inputs
- **Error Handling**: Comprehensive error handling for various failure scenarios
- **CORS Support**: Full CORS headers for cross-origin requests
- **Request Validation**: Input validation using Zod schemas
- **Execution Logging**: Logs all agent runs for monitoring
- **Mock Database**: Fallback mock database for testing
- **Execution Metrics**: Tracks execution time and success rates

### 🔄 Planned Enhancements

- **User Authentication**: Add user-based access control
- **Rate Limiting**: Implement request rate limiting
- **Webhook Authentication**: Support for authenticated webhooks
- **Retry Logic**: Automatic retry for failed webhook calls
- **Response Caching**: Cache webhook responses for performance
- **Webhook Health Checks**: Monitor webhook availability

## Database Schema

### Agent Configuration

The agent configuration is stored in the `deployment` table with the following structure:

```sql
-- Agent configuration stored in the 'source' field as JSON
{
  "webhook_url": "https://api.example.com/agent-webhook",
  "timeout": 30000,
  "retry_count": 3,
  "authentication": {
    "type": "bearer",
    "token": "your-api-token"
  }
}
```

### Logging Tables

```sql
-- Agent execution logs
CREATE TABLE agent_logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  level TEXT NOT NULL, -- 'info', 'error', 'warning'
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent runs (when user auth is implemented)
CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  inputs JSONB,
  result JSONB,
  error TEXT,
  execution_time INTEGER,
  status TEXT, -- 'success', 'failed', 'timeout'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

### HTTP Status Codes

- **200**: Success - Agent executed successfully
- **400**: Bad Request - Invalid input data or agent not active
- **404**: Not Found - Agent ID not found in database
- **502**: Bad Gateway - Webhook call failed
- **500**: Internal Server Error - Server-side error

### Error Scenarios

1. **Agent Not Found**: Returns 404 with agent ID
2. **Agent Inactive**: Returns 400 with current status
3. **Invalid Webhook URL**: Returns 400 with configuration error
4. **Webhook Timeout**: Returns 502 with timeout error
5. **Webhook Error**: Returns 502 with webhook response error
6. **Invalid Input**: Returns 400 with validation errors

## CORS Configuration

The API includes CORS headers for cross-origin requests:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Configure for production
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

**Production Configuration**: Replace `'*'` with your specific domain(s).

## Authentication & Authorization

### Current State
- No authentication required (for testing)
- All agents are publicly accessible

### Planned Implementation

```javascript
// Add to POST handler
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Check user permissions
const hasAccess = await checkUserAgentAccess(session.user.id, agentId);
if (!hasAccess) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Monitoring & Logging

### Execution Logs

All agent runs are logged to the `agent_logs` table with:

- Agent ID
- Execution timestamp
- Input data
- Result/error
- Execution time
- Request metadata

### Metrics Tracking

The system tracks:

- Total requests per agent
- Success/failure rates
- Average execution time
- Error rates and types
- User usage patterns (when auth is added)

## Testing

### Mock Agents

For testing, the system includes mock agents:

```javascript
const mockAgents = [
  {
    id: 'agent-1',
    name: 'Lead Scraper',
    webhook_url: 'https://webhook.site/your-unique-id-1',
    status: 'active',
  },
  {
    id: 'agent-2',
    name: 'Sentiment Analyzer', 
    webhook_url: 'https://webhook.site/your-unique-id-2',
    status: 'active',
  },
];
```

### Test Page

Visit `/test-webhook` to test the API with a user-friendly interface.

## Security Considerations

### Current
- Input validation with Zod
- Error message sanitization
- Request timeout handling

### Recommended
- Rate limiting per user/IP
- Webhook URL validation
- Request size limits
- API key authentication
- Webhook signature verification

## Performance Optimization

### Current
- Async/await for non-blocking operations
- Efficient database queries
- Error handling without blocking

### Planned
- Response caching
- Connection pooling
- Request queuing
- Load balancing

## Integration Examples

### JavaScript/TypeScript

```javascript
const runAgent = async (agentId, inputs) => {
  const response = await fetch('/api/run-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, inputs }),
  });
  
  return response.json();
};

// Usage
const result = await runAgent('agent-1', {
  query: 'Miami real estate agents',
  limit: 10
});
```

### cURL

```bash
curl -X POST http://localhost:3000/api/run-agent \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-1",
    "inputs": {
      "query": "Miami real estate agents"
    }
  }'
```

### Python

```python
import requests

def run_agent(agent_id, inputs):
    response = requests.post(
        'http://localhost:3000/api/run-agent',
        json={'agentId': agent_id, 'inputs': inputs}
    )
    return response.json()

# Usage
result = run_agent('agent-1', {
    'query': 'Miami real estate agents',
    'limit': 10
})
```

## Troubleshooting

### Common Issues

1. **Agent Not Found**: Check if agent ID exists in database
2. **Webhook Timeout**: Verify webhook URL is accessible
3. **CORS Errors**: Check CORS configuration for your domain
4. **Invalid Input**: Ensure input JSON is valid

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=webhook-agent npm run dev
```

## Future Enhancements

1. **Webhook Authentication**: Support for API keys, OAuth, etc.
2. **Response Streaming**: Real-time response streaming
3. **Batch Processing**: Execute multiple agents in parallel
4. **Webhook Validation**: Validate webhook responses
5. **Custom Headers**: Support for custom webhook headers
6. **Response Transformation**: Transform webhook responses
7. **Webhook Testing**: Built-in webhook testing tools 