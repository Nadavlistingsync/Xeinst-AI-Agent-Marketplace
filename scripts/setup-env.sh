#!/bin/bash

echo "🚀 Setting up environment variables for AI Agency Website"

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local with placeholder values
cat > .env.local << EOF
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ai_agency"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Redis Configuration (Optional - for caching and rate limiting)
# Get these from https://upstash.com/
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
EOF

echo "✅ Created .env.local with placeholder values"
echo ""
echo "📝 Next steps:"
echo "1. Update DATABASE_URL with your database connection string"
echo "2. (Optional) Add Redis credentials from https://upstash.com/"
echo "3. (Optional) Add OAuth provider credentials"
echo "4. (Optional) Add Stripe credentials"
echo ""
echo "🔧 The application will work without Redis, OAuth, or Stripe configured"
echo "   - Redis: Uses in-memory fallback cache"
echo "   - OAuth: Uses email/password authentication"
echo "   - Stripe: Payment features will be disabled" 