# AI Agency Website

A modern web application for deploying and managing AI agents, built with Next.js, Neon Database, and AWS S3.

## Features

- User authentication with NextAuth.js
- File uploads with AWS S3
- Product marketplace with Stripe payments
- User reviews and ratings
- Featured agents section
- Deployment management
- Earnings tracking

## Prerequisites

- Node.js 18+ and npm
- Neon Database account
- AWS account with S3 access
- Stripe account

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Database
NEON_DATABASE_URL=postgres://user:password@host:port/database

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run database migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── lib/             # Shared utilities
│   │   ├── db.ts        # Database connection
│   │   ├── schema.ts    # Database schema
│   │   ├── auth.ts      # Authentication config
│   │   ├── db-helpers.ts # Database helper functions
│   │   └── s3-helpers.ts # AWS S3 helper functions
│   └── components/      # React components
├── public/              # Static files
├── drizzle/            # Database migrations
└── scripts/            # Utility scripts
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push database changes
- `npm run db:migrate` - Run database migrations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
