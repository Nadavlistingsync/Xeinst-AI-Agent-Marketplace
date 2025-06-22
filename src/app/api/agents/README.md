# Xeinst Agent Marketplace API

This API serves the Xeinst Agent Marketplace, allowing users to discover and run AI agents directly from their browser.

## Features

- **GET /api/agents**: Fetch all available agents (both from database and example agents)
- **POST /api/agents**: Upload a new agent to the marketplace
- **Interactive Agent Cards**: Run agents directly from the marketplace with dynamic form generation
- **JSON Schema Support**: Each agent defines its input schema for automatic form generation

## How to Add New Agents

### Option 1: Upload via Web Interface (Recommended)

1. Navigate to `/upload` in your browser
2. Fill out the agent details:
   - **Name**: The display name of your agent
   - **Category**: The category your agent belongs to
   - **Description**: A clear description of what your agent does
   - **Price**: Credits required per run (0 for free agents)
   - **API URL**: The endpoint where your agent can be called
   - **Input JSON Schema**: Define the structure of inputs your agent expects
   - **Documentation**: Usage instructions and examples

3. Click "Upload to Marketplace"

### Option 2: Direct API Call

You can also add agents programmatically by making a POST request to `/api/agents`:

```bash
curl -X POST /api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Custom Agent",
    "description": "A powerful AI agent that does amazing things",
    "category": "Text Processing",
    "price": 5,
    "apiUrl": "https://api.example.com/my-agent",
    "inputSchema": {
      "type": "object",
      "properties": {
        "text": {
          "type": "string",
          "description": "The text to process"
        },
        "options": {
          "type": "object",
          "properties": {
            "maxLength": {
              "type": "number",
              "description": "Maximum output length"
            }
          }
        }
      },
      "required": ["text"]
    },
    "documentation": "This agent processes text and returns enhanced results...",
    "version": "1.0.0",
    "framework": "custom",
    "modelType": "custom"
  }'
```

## Agent Schema

Each agent must include:

- **name** (string): Display name
- **description** (string): What the agent does
- **category** (string): Agent category
- **price** (number): Credits per run (0 for free)
- **apiUrl** (string): Valid URL where the agent can be called
- **inputSchema** (object): JSON Schema defining the input structure

Optional fields:
- **documentation** (string): Usage instructions
- **version** (string): Agent version (default: "1.0.0")
- **framework** (string): Framework used (default: "custom")
- **modelType** (string): Type of model (default: "custom")
- **environment** (string): Environment (default: "production")

## Input JSON Schema

The `inputSchema` field should be a valid JSON Schema that defines:
- What properties the agent expects
- Data types for each property
- Required vs optional fields
- Descriptions for each field

Example:
```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "description": "The text to analyze"
    },
    "sentences": {
      "type": "number",
      "description": "Number of sentences in summary",
      "minimum": 1,
      "maximum": 10
    }
  },
  "required": ["text"]
}
```

## Authentication

- **GET requests**: No authentication required
- **POST requests**: Requires valid session (user must be logged in)

## Database Storage

Agents are stored in the `Agent` table with the following fields:
- Basic metadata (name, description, category, price)
- API endpoint (stored in `fileUrl` field)
- Creator information
- Version and framework details
- Public/private status

## Example Agents

The marketplace includes several example agents to demonstrate the functionality:
- Text Summarizer
- Image Classifier  
- Sentiment Analysis

These examples show different input schemas and use cases.

## Error Handling

The API includes comprehensive error handling:
- Validation errors for malformed requests
- Authentication errors for unauthorized access
- Database errors with fallback to example agents
- Graceful degradation when services are unavailable 