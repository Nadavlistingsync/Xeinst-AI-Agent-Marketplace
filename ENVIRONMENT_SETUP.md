# 🚀 Xeinst AI Agent Marketplace - Complete Environment Setup Guide

This guide will help you set up the complete environment configuration for the Xeinst AI Agent Marketplace.

## 📋 Quick Start

1. **Copy the environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update the required variables** (see sections below)

3. **Start the application:**
   ```bash
   pnpm dev
   ```

## 🔧 Required Environment Variables

### 1. Database Configuration (REQUIRED)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/xeinst_ai_marketplace"
```

**Setup Steps:**
1. Install PostgreSQL locally or use a cloud service
2. Create a database named `xeinst_ai_marketplace`
3. Update the connection string with your credentials

**Cloud Options:**
- [Supabase](https://supabase.com/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)
- [Railway](https://railway.app/) (Free tier available)

### 2. Authentication (REQUIRED)
```env
NEXTAUTH_SECRET="your-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

## 🎯 Optional Services Setup

### 3. Payment Processing (Stripe)
**Required for:** Credit purchases, agent payments, earnings

1. Create a [Stripe account](https://stripe.com/)
2. Get your API keys from the dashboard
3. Set up webhooks for payment events

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Caching & Performance (Redis)
**Required for:** Rate limiting, caching, session storage

1. Create a [Upstash Redis](https://upstash.com/) account
2. Create a new Redis database
3. Copy the REST URL and token

```env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 5. OAuth Providers
**Required for:** Social login (Google, GitHub)

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### GitHub OAuth:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 6. Error Monitoring (Sentry)
**Required for:** Production error tracking

1. Create a [Sentry account](https://sentry.io/)
2. Create a new project
3. Get the DSN from project settings

```env
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
```

## 🛠️ Development Setup

### Database Migration
```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# (Optional) Seed initial data
pnpm prisma db seed
```

### Create Admin User
```bash
# Set environment variables and run
SEED_USER_EMAIL="admin@xeinst.com" SEED_USER_PASSWORD="admin123" pnpm exec node scripts/seed-user.js
```

## 🌐 Production Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
- Update `NEXTAUTH_URL` to your production domain
- Use production database URLs
- Set production Stripe keys
- Configure production Redis instance
- Set up production Sentry project

## 🔒 Security Checklist

- [ ] Generate secure `NEXTAUTH_SECRET`
- [ ] Use strong database passwords
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable SSL verification for webhooks
- [ ] Set up monitoring and alerts
- [ ] Use environment-specific secrets

## 🧪 Testing Configuration

### Test Database
```env
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/xeinst_ai_marketplace_test"
```

### Test Webhooks
```env
TEST_WEBHOOK_URL="https://webhook.site/your-unique-url"
TEST_WEBHOOK_SECRET="test-secret"
```

## 📊 Monitoring & Analytics

### Webhook Monitoring
```env
ENABLE_WEBHOOK_MONITORING="true"
ENABLE_WEBHOOK_ANALYTICS="true"
WEBHOOK_LOG_LEVEL="info"
```

### Performance Monitoring
- Set up Redis for caching
- Configure rate limiting
- Enable auto-cleanup for temporary files
- Set up webhook failure alerts

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check network connectivity

2. **Authentication Errors**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure OAuth providers are configured

3. **Stripe Webhook Failures**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Ensure webhook events are enabled

4. **Redis Connection Issues**
   - Check UPSTASH_REDIS_REST_URL
   - Verify UPSTASH_REDIS_REST_TOKEN
   - App will fallback to in-memory cache

### Debug Mode
```env
DEBUG_WEBHOOKS="true"
LOG_WEBHOOK_PAYLOADS="true"
WEBHOOK_LOG_LEVEL="debug"
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [Upstash Redis Documentation](https://docs.upstash.com/)
- [Sentry Documentation](https://docs.sentry.io/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error logs in the console
3. Verify all required environment variables are set
4. Check the application documentation
5. Submit an issue on GitHub

---

**Happy coding! 🚀**
