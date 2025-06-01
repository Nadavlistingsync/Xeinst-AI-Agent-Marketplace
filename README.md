# AI Agency Website

A Next.js application for managing and showcasing AI agents.

## Features

- Featured and trending AI agents showcase
- Comprehensive error handling and monitoring
- Type-safe API routes
- Automated testing and deployment
- Sentry integration for error tracking

## Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- GitHub account
- Vercel account
- Sentry account

## Environment Setup

1. Copy `.env.example` to `.env` and fill in the required values:
```bash
cp .env.example .env
```

2. Required environment variables:
- `DATABASE_URL`: Your PostgreSQL database URL
- `TEST_DATABASE_URL`: Your test database URL
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: A random string for NextAuth
- `GITHUB_ID`: GitHub OAuth client ID
- `GITHUB_SECRET`: GitHub OAuth client secret
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN
- `SENTRY_AUTH_TOKEN`: Sentry auth token
- `SENTRY_ORG`: Your Sentry organization
- `SENTRY_PROJECT`: Your Sentry project name

## Development

1. Install dependencies:
```bash
npm install
```

2. Run database migrations:
```bash
npx prisma migrate dev
```

3. Start the development server:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

The application is configured for automatic deployment to Vercel. The deployment process includes:

1. Running tests
2. Building the application
3. Deploying to Vercel

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Vercel:
```bash
vercel --prod
```

## GitHub Actions

The repository includes GitHub Actions workflows for:
- Running tests
- Building the application
- Deploying to Vercel

Required secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Error Monitoring

The application uses Sentry for error monitoring. To set up Sentry:

1. Create a Sentry account
2. Create a new project
3. Add the Sentry DSN to your environment variables
4. Configure the Sentry auth token and project details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
