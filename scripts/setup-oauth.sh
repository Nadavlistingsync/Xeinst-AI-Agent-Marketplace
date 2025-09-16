#!/bin/bash

echo "🚀 Setting up OAuth integrations for Xeinst AI Agent Marketplace"
echo "================================================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp env.production.example .env.local
    echo "✅ Created .env.local from template"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔑 OAuth Setup Instructions:"
echo "============================"

echo ""
echo "1️⃣  MAKE.COM OAUTH SETUP:"
echo "   • Go to: https://www.make.com/en/help/apps/create-an-app"
echo "   • Click 'Create App'"
echo "   • App Name: Xeinst AI Agent Marketplace"
echo "   • Redirect URI: https://your-domain.vercel.app/api/oauth/make/callback"
echo "   • Copy Client ID and Secret to .env.local"

echo ""
echo "2️⃣  ZAPIER OAUTH SETUP:"
echo "   • Go to: https://developer.zapier.com/"
echo "   • Click 'Create App'"
echo "   • App Name: Xeinst AI Agent Marketplace"
echo "   • Redirect URI: https://your-domain.vercel.app/api/oauth/zapier/callback"
echo "   • Copy Client ID and Secret to .env.local"

echo ""
echo "3️⃣  N8N OAUTH SETUP:"
echo "   • Go to: https://app.n8n.cloud/"
echo "   • Settings → Integrations"
echo "   • App Name: Xeinst AI Agent Marketplace"
echo "   • Redirect URI: https://your-domain.vercel.app/api/oauth/n8n/callback"
echo "   • Copy Client ID and Secret to .env.local"

echo ""
echo "4️⃣  ENCRYPTION KEY:"
echo "   • Generate a 32-character encryption key:"
echo "   • Run: openssl rand -base64 32"
echo "   • Add to .env.local as ENCRYPTION_KEY"

echo ""
echo "📋 Required Environment Variables:"
echo "=================================="
echo "MAKE_CLIENT_ID=your_make_client_id"
echo "MAKE_CLIENT_SECRET=your_make_client_secret"
echo "ZAPIER_CLIENT_ID=your_zapier_client_id"
echo "ZAPIER_CLIENT_SECRET=your_zapier_client_secret"
echo "N8N_CLIENT_ID=your_n8n_client_id"
echo "N8N_CLIENT_SECRET=your_n8n_client_secret"
echo "ENCRYPTION_KEY=your_32_character_encryption_key"

echo ""
echo "🔧 After adding credentials:"
echo "============================"
echo "1. Run: npm run dev"
echo "2. Go to: http://localhost:3000/agent-setup?agentId=test"
echo "3. Test OAuth connections"
echo "4. Deploy to production with your domain"

echo ""
echo "✅ OAuth setup complete! Your users can now connect their accounts."
