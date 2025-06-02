# Environment Variables Setup

This document outlines the required environment variables for the AI agency website.

## Required Variables

Create a `.env.local` file in the root directory with the following variables:

### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_agency"
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/ai_agency_test"
```

### Authentication
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### GitHub OAuth
```env
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

### Sentry
```env
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
```

### App
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Vercel
```env
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-vercel-org-id"
VERCEL_PROJECT_ID="your-vercel-project-id"
```

### WebSocket
```env
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
```

## Getting the Values

### Database
1. Set up a PostgreSQL database
2. Create a database named `ai_agency`
3. Create a test database named `ai_agency_test`
4. Use the connection string format: `postgresql://user:password@host:port/database`

### Authentication
1. Generate a secure random string for `NEXTAUTH_SECRET`
2. Set `NEXTAUTH_URL` to your application's URL

### GitHub OAuth
1. Go to GitHub Developer Settings
2. Create a new OAuth application
3. Set the callback URL to `{NEXTAUTH_URL}/api/auth/callback/github`
4. Copy the Client ID and Client Secret

### Sentry
1. Create a Sentry account
2. Create a new project
3. Get the DSN from project settings
4. Generate an auth token
5. Note your organization and project names

### Vercel
1. Create a Vercel account
2. Link your project
3. Get the project ID from project settings
4. Generate a Vercel token
5. Get the organization ID from team settings

### WebSocket
1. Set `NEXT_PUBLIC_WS_URL` to your WebSocket server URL
2. For local development, use `ws://localhost:3000`

## Development vs Production

For local development:
1. Copy `.env.example` to `.env.local`
2. Fill in the values for local development
3. Use local database URLs
4. Use local WebSocket URL

For production:
1. Set up environment variables in your hosting platform
2. Use production database URLs
3. Use production WebSocket URL
4. Use production OAuth credentials
5. Use production Sentry project

## Security Notes

1. Never commit `.env.local` to version control
2. Keep your secrets secure
3. Rotate secrets regularly
4. Use different values for development and production
5. Use strong passwords for databases
6. Limit database user permissions
7. Use HTTPS in production
8. Use secure WebSocket connections (WSS) in production

## Troubleshooting

If you encounter issues:

1. Check if all required variables are set
2. Verify database connection
3. Check OAuth configuration
4. Verify Sentry setup
5. Check WebSocket connection
6. Look for error messages in logs
7. Check environment variable format
8. Verify URL formats

## Support

For help with environment setup:

1. Check the documentation
2. Review error messages
3. Contact the development team
4. Submit a GitHub issue 