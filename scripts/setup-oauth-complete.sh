#!/bin/bash

# 🚀 Complete OAuth Setup Script for Xeinst AI Agent Marketplace
# This script helps you set up all OAuth integrations and environment variables

echo "🔐 Xeinst AI Agent Marketplace - OAuth Setup"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Generate encryption key
echo "🔑 Generating encryption key..."
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env.local template
echo "📝 Creating .env.local template..."
cat > .env.local << EOF
# ========================================
# XEINST AI AGENT MARKETPLACE - OAUTH SETUP
# ========================================
# Generated on: $(date)
# 
# 🔐 OAUTH INTEGRATIONS
# ========================================

# Gmail OAuth (Priority: HIGH)
# Get from: https://console.cloud.google.com/
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here

# Make.com OAuth (Priority: HIGH)
# Get from: https://www.make.com/en/help/apps/create-app
MAKE_CLIENT_ID=your_make_client_id_here
MAKE_CLIENT_SECRET=your_make_client_secret_here

# Slack OAuth (Priority: MEDIUM)
# Get from: https://api.slack.com/apps
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here

# Zapier OAuth (Priority: MEDIUM)
# Get from: https://developer.zapier.com/
ZAPIER_CLIENT_ID=your_zapier_client_id_here
ZAPIER_CLIENT_SECRET=your_zapier_client_secret_here

# ========================================
# ENCRYPTION
# ========================================
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# ========================================
# STRIPE PAYMENT
# ========================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ========================================
# DATABASE
# ========================================
# Your Supabase or PostgreSQL database URL
DATABASE_URL=your_database_url_here

# ========================================
# AUTHENTICATION
# ========================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://ai-agency-website-c7fs.vercel.app

# ========================================
# PRODUCTION SETTINGS
# ========================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ai-agency-website-c7fs.vercel.app
EOF

echo "✅ .env.local created successfully!"
echo ""
echo "🔑 Your encryption key: ${ENCRYPTION_KEY}"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🔐 Set up OAuth integrations:"
echo "   - Gmail: https://console.cloud.google.com/"
echo "   - Make.com: https://www.make.com/en/help/apps/create-app"
echo "   - Slack: https://api.slack.com/apps"
echo "   - Zapier: https://developer.zapier.com/"
echo ""
echo "2. 💳 Set up Stripe:"
echo "   - Go to: https://dashboard.stripe.com/apikeys"
echo "   - Get your API keys"
echo ""
echo "3. 🗄️  Set up database:"
echo "   - Use your existing Supabase/PostgreSQL URL"
echo ""
echo "4. 🔑 Generate NextAuth secret:"
echo "   openssl rand -base64 32"
echo ""
echo "5. ✏️  Edit .env.local with your actual values"
echo ""
echo "6. 🚀 Test OAuth flows:"
echo "   npm run dev"
echo "   Go to: http://localhost:3000/test-oauth"
echo ""
echo "📖 For detailed setup instructions, see: OAUTH_SETUP_COMPLETE.md"
echo ""
echo "🎉 Happy coding!"
