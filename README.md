# AI Agency Website

A modern platform for creating, deploying, and managing AI agents with a marketplace for discovery and collaboration.

## Features

- **Agent Marketplace**: Discover and download AI agents created by the community
- **Agent Builder**: Create custom AI agents with natural language input
- **Deployment System**: Deploy agents with monitoring and analytics
- **Credit System**: Pay-per-use model with Stripe integration
- **User Dashboard**: Manage your agents, deployments, and earnings
- **Feedback System**: Collect and analyze user feedback for agent improvement

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Deployment**: Vercel
- **Monitoring**: Sentry

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `pnpm prisma migrate dev`
5. Start the development server: `pnpm dev`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Sentry
SENTRY_DSN="https://..."

# Redis (optional)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Deployment

The application is automatically deployed to Vercel on push to the main branch.

## Production Deployment

1. Set environment variables in Vercel (see `.env.production.example`):
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel deployment URL)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Any other required keys (Stripe, Redis, etc.)
2. Push to `main` branch to trigger deployment.
3. (Optional) Seed an initial user for credentials login:
   ```bash
   SEED_USER_EMAIL=admin@example.com SEED_USER_PASSWORD=changeme123 pnpm exec node scripts/seed-user.js
   ```
   - Change the email and password as needed.
   - You can run this locally or in a production shell with access to your production database.

## Troubleshooting Auth
- If you see a 500 error on `/api/auth/error`, check:
  - All required environment variables are set in Vercel.
  - Your database is accessible from Vercel.
  - You have at least one user in the database for credentials login.
- Check Vercel logs for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

<!-- Build fix: Latest commit includes deployment type fixes -->
# Updated Thu Sep 11 20:25:38 EDT 2025
