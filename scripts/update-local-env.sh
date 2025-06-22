#!/bin/bash

echo "🔧 Updating local environment with production database..."

# Backup current .env.local
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up current .env.local"
fi

# Create new .env.local with correct database URL
cat > .env.local << 'EOF'
# Database Configuration - Using Neon PostgreSQL (same as production)
DATABASE_URL="postgres://neondb_owner:npg_PSt0Ahekuzd3@ep-misty-dust-a4k4h736-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_PSt0Ahekuzd3@ep-misty-dust-a4k4h736.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="4EHYb0eXQJrBMs8RtcyTDxeXw6dycCrx9GUS5LDx92k="
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

echo "✅ Updated .env.local with production database"
echo "🔄 Restart your development server to apply changes"
echo "   Run: pnpm dev" 