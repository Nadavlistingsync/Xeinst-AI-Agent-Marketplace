#!/bin/bash

# 🚀 Xeinst AI Agent Marketplace - Final Deployment Setup Script

echo "🚀 Setting up Xeinst AI Agent Marketplace for production deployment..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Database
DATABASE_URL=your-database-url-here

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# OAuth Credentials
MAKE_CLIENT_ID=your-make-client-id
MAKE_CLIENT_SECRET=your-make-client-secret
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
ZAPIER_CLIENT_ID=your-zapier-client-id
ZAPIER_CLIENT_SECRET=your-zapier-client-secret

# Stripe
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
EOF
    echo "✅ .env.local created! Please update with your actual credentials."
else
    echo "✅ .env.local already exists"
fi

# Generate encryption key if not set
if ! grep -q "ENCRYPTION_KEY=" .env.local || grep -q "your-32-character-encryption-key-here" .env.local; then
    echo "🔐 Generating encryption key..."
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-32-character-encryption-key-here/$ENCRYPTION_KEY/" .env.local
    else
        # Linux
        sed -i "s/your-32-character-encryption-key-here/$ENCRYPTION_KEY/" .env.local
    fi
    echo "✅ Encryption key generated and set"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run build check
echo "🔨 Running build check..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Your marketplace is ready for deployment."
    echo ""
    echo "🎯 Next steps:"
    echo "1. Update .env.local with your actual credentials"
    echo "2. Set up OAuth apps (Gmail, Make.com, Slack, Zapier)"
    echo "3. Configure Stripe payments"
    echo "4. Deploy to Vercel"
    echo ""
    echo "🚀 Your AI Agent Marketplace is ready to launch!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
