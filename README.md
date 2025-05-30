# Xeinst AI Marketplace

A modern AI marketplace platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🤖 AI Agent Marketplace
- 💳 Secure Payment Processing with Stripe
- 🔐 Authentication with NextAuth.js
- 📊 Advanced Analytics Dashboard
- 💬 Real-time Feedback System
- 🎯 Sentiment Analysis
- 📈 Performance Monitoring
- 🔔 Smart Notifications

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma
- **Authentication:** NextAuth.js
- **Payment:** Stripe
- **Deployment:** Vercel
- **Storage:** AWS S3
- **Analytics:** Custom implementation

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Nadavlistingsync/AI-agency-Website-.git
   cd AI-agency-Website-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required environment variables in `.env.local`

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

## Project Structure

```
├── src/
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   ├── types/           # TypeScript type definitions
│   └── hooks/           # Custom React hooks
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── tests/              # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database changes
- `npm run test` - Run tests

## Deployment

The project is configured for deployment on Vercel. The deployment process is automated through GitHub integration.

1. Push changes to the main branch
2. Vercel automatically deploys the changes
3. Environment variables are managed through Vercel's dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@xeinst.ai or join our Discord community.
