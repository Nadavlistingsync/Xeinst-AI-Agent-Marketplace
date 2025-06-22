# Xeinst Agent Marketplace API

This directory contains the API route for the Xeinst Agent Marketplace.

## How it Works

The primary route is `GET /api/agents`, which returns a list of available agents. This endpoint is consumed by the frontend at `/app/marketplace/page.tsx`.

## Adding a New Agent

To add a new agent to the marketplace, follow these steps:

1.  **Open `src/app/api/agents/route.ts`**.
2.  **Locate the `exampleAgents` array**.
3.  **Add a new agent object** to the array, following the `Agent` type definition.

### Agent Schema

Each agent object must include:
- `id`: A unique string identifier.
- `name`: The display name of the agent.
- `description`: A brief summary of what the agent does.
- `apiUrl`: The real API endpoint where the agent can be executed.
- `inputSchema`: A standard JSON schema that defines the inputs for the agent's form. The `properties` key should describe each field, and the `required` array should list which fields are mandatory.

### Example

```typescript
{
  id: '4',
  name: 'Language Translator',
  description: 'Translates text from one language to another.',
  apiUrl: 'https://api.example.com/translate',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to translate.' },
      targetLanguage: { type: 'string', description: 'e.g., "Spanish", "French"' },
    },
    required: ['text', 'targetLanguage'],
  },
}
```

This setup allows for easy, static definition of new agents. For a production system, you would replace the static `exampleAgents` array with a dynamic fetch from your database. 