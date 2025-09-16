# OAuth Integration Setup Guide

This guide explains how to set up OAuth integrations for Make.com, Zapier, and other platforms to enable user account connections.

## Overview

The account connection system allows users to:
- Connect their Make.com, Zapier, or custom API accounts
- Use agents with their own data and permissions
- Get personalized results based on their connected services
- Securely store and use their platform credentials

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# OAuth Integrations
MAKE_CLIENT_ID="your_make_client_id"
MAKE_CLIENT_SECRET="your_make_client_secret"
ZAPIER_CLIENT_ID="your_zapier_client_id"
ZAPIER_CLIENT_SECRET="your_zapier_client_secret"
N8N_CLIENT_ID="your_n8n_client_id"
N8N_CLIENT_SECRET="your_n8n_client_secret"

# Encryption (required for secure credential storage)
ENCRYPTION_KEY="your_32_character_encryption_key"
```

## Make.com OAuth Setup

### 1. Create Make.com App

1. Go to [Make.com Developer Portal](https://www.make.com/en/help/apps/create-an-app)
2. Click "Create App"
3. Fill in the app details:
   - **App Name**: Xeinst AI Agent Marketplace
   - **Description**: AI Agent marketplace with Make.com integration
   - **Redirect URI**: `https://your-domain.com/api/oauth/make/callback`

### 2. Configure OAuth Settings

1. In your Make.com app settings, add these scopes:
   - `scenarios:read` - Read user's scenarios
   - `scenarios:execute` - Execute scenarios
   - `webhooks:manage` - Manage webhooks

2. Copy the Client ID and Client Secret to your environment variables

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/agent-setup?agentId=test-agent-id`
3. Click "Connect Make.com"
4. Complete the OAuth flow
5. Verify the account appears in connected accounts

## Zapier OAuth Setup

### 1. Create Zapier App

1. Go to [Zapier Developer Platform](https://developer.zapier.com/)
2. Click "Create App"
3. Fill in the app details:
   - **App Name**: Xeinst AI Agent Marketplace
   - **Description**: AI Agent marketplace with Zapier integration
   - **Redirect URI**: `https://your-domain.com/api/oauth/zapier/callback`

### 2. Configure OAuth Settings

1. In your Zapier app settings, add these scopes:
   - `zaps:read` - Read user's Zaps
   - `zaps:execute` - Execute Zaps
   - `webhooks:manage` - Manage webhooks

2. Copy the Client ID and Client Secret to your environment variables

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/agent-setup?agentId=test-agent-id`
3. Click "Connect Zapier"
4. Complete the OAuth flow
5. Verify the account appears in connected accounts

## n8n OAuth Setup

### 1. Create n8n App

1. Go to your n8n instance admin panel
2. Navigate to "OAuth Apps" or "Integrations"
3. Create a new OAuth app:
   - **App Name**: Xeinst AI Agent Marketplace
   - **Redirect URI**: `https://your-domain.com/api/oauth/n8n/callback`

### 2. Configure OAuth Settings

1. Add these scopes:
   - `workflows:read` - Read user's workflows
   - `workflows:execute` - Execute workflows
   - `webhooks:manage` - Manage webhooks

2. Copy the Client ID and Client Secret to your environment variables

## Custom API Integration

For custom APIs, users can manually add their API keys:

1. Go to `/agent-setup?agentId=your-agent-id`
2. Click "Custom API"
3. Enter API key and configuration
4. Credentials are encrypted and stored securely

## Security Features

### Encryption
- All credentials are encrypted using AES-256-GCM
- Encryption key is stored in environment variables
- Credentials are never stored in plain text

### Token Management
- Automatic token refresh when expired
- Secure token storage and retrieval
- Proper error handling for expired tokens

### Permissions
- Users see exactly what permissions they're granting
- Granular permission management
- Easy account disconnection

## Database Schema

The system uses these new tables:

### ConnectedAccount
- Stores encrypted OAuth credentials
- Links users to agents and platforms
- Tracks connection status and usage

### AgentExecution
- Logs all agent executions
- Stores input/output data
- Tracks execution time and status

## API Endpoints

### OAuth Flow
- `POST /api/oauth/make` - Start Make.com OAuth
- `GET /api/oauth/make/callback` - Handle Make.com callback
- `POST /api/oauth/zapier` - Start Zapier OAuth
- `GET /api/oauth/zapier/callback` - Handle Zapier callback

### Account Management
- `GET /api/accounts` - Get user's connected accounts
- `POST /api/accounts/disconnect` - Disconnect an account

### Agent Execution
- `POST /api/run-agent-enhanced` - Execute agent with user credentials
- `GET /api/executions` - Get execution history

## Testing

### Local Testing
1. Set up OAuth apps with `http://localhost:3000` as redirect URI
2. Use test credentials for development
3. Test the complete OAuth flow

### Production Testing
1. Update OAuth apps with production domain
2. Test with real user accounts
3. Verify credential encryption and storage

## Troubleshooting

### Common Issues

1. **OAuth callback errors**
   - Check redirect URI matches exactly
   - Verify client ID and secret are correct
   - Check environment variables are loaded

2. **Token refresh failures**
   - Verify refresh token is valid
   - Check OAuth app permissions
   - Ensure proper error handling

3. **Database connection issues**
   - Run Prisma migrations: `npx prisma migrate dev`
   - Generate Prisma client: `npx prisma generate`
   - Check database connection string

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=oauth:*
```

## Production Deployment

### Environment Variables
Ensure all OAuth environment variables are set in production:
- `MAKE_CLIENT_ID`
- `MAKE_CLIENT_SECRET`
- `ZAPIER_CLIENT_ID`
- `ZAPIER_CLIENT_SECRET`
- `ENCRYPTION_KEY`

### Database Migration
Run the database migration in production:
```bash
npx prisma migrate deploy
```

### OAuth App Configuration
Update OAuth apps with production domain:
- Make.com: `https://your-domain.com/api/oauth/make/callback`
- Zapier: `https://your-domain.com/api/oauth/zapier/callback`

## Support

For issues with OAuth integrations:
1. Check the browser console for errors
2. Verify environment variables are set
3. Test OAuth flow step by step
4. Check database connectivity
5. Review server logs for detailed error messages
