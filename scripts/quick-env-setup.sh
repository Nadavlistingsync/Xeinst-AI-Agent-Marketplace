#!/bin/bash

echo "🚀 Xeinst AI Agent Marketplace - Quick Environment Setup"
echo "========================================================"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy example to local
echo "📋 Copying .env.example to .env.local..."
cp .env.example .env.local

# Generate secure secrets
echo "🔐 Generating secure secrets..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
WEBHOOK_SECRET=$(openssl rand -base64 32)

# Update secrets in .env.local
sed -i.bak "s/your-nextauth-secret-here/$NEXTAUTH_SECRET/g" .env.local
sed -i.bak "s/your-jwt-secret-key-change-in-production/$JWT_SECRET/g" .env.local
sed -i.bak "s/default-webhook-secret/$WEBHOOK_SECRET/g" .env.local

# Clean up backup files
rm -f .env.local.bak

echo "✅ Environment file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update DATABASE_URL with your PostgreSQL connection string"
echo "2. (Optional) Add Stripe credentials for payments"
echo "3. (Optional) Add Redis credentials for caching"
echo "4. (Optional) Add OAuth provider credentials"
echo "5. (Optional) Add Sentry credentials for error monitoring"
echo ""
echo "🔧 The application will work with just the database configured!"
echo "   All other services are optional and have fallbacks."
echo ""
echo "📚 See ENVIRONMENT_SETUP.md for detailed setup instructions"
echo ""
echo "🚀 Ready to start development:"
echo "   pnpm dev"
