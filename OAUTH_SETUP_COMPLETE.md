# 🔐 Complete OAuth Setup Guide for Xeinst AI Agent Marketplace

## 🎯 **Required OAuth Integrations**

Your marketplace needs these OAuth integrations to allow users to connect their accounts:

### **1. Gmail OAuth** 📧 (Priority: HIGH)
**Purpose**: Email automation agents (auto-responders, email processing)

#### **Setup Steps:**
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create new project or select existing
3. **Enable Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Xeinst AI Agent Marketplace"
   - Authorized redirect URIs: `https://ai-agency-website-c7fs.vercel.app/api/oauth/gmail/callback`
5. **Copy Credentials**:
   - Client ID: Copy to `GMAIL_CLIENT_ID`
   - Client Secret: Copy to `GMAIL_CLIENT_SECRET`

#### **Required Scopes:**
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.modify`

---

### **2. Make.com OAuth** ⚡ (Priority: HIGH)
**Purpose**: Automation and workflow agents

#### **Setup Steps:**
1. **Go to Make.com Developer Portal**: https://www.make.com/en/help/apps/create-app
2. **Create New App**:
   - Click "Create App"
   - App Name: "Xeinst AI Agent Marketplace"
   - Description: "AI Agent Marketplace for Make.com integration"
3. **Configure OAuth**:
   - Redirect URI: `https://ai-agency-website-c7fs.vercel.app/api/oauth/make/callback`
   - Scopes: `scenarios:read`, `scenarios:execute`, `webhooks:manage`
4. **Save and Get Credentials**:
   - Client ID: Copy to `MAKE_CLIENT_ID`
   - Client Secret: Copy to `MAKE_CLIENT_SECRET`

---

### **3. Slack OAuth** 💬 (Priority: MEDIUM)
**Purpose**: Team communication and notification agents

#### **Setup Steps:**
1. **Go to Slack API Dashboard**: https://api.slack.com/apps
2. **Create New App**:
   - Click "Create New App"
   - Choose "From scratch"
   - App Name: "Xeinst AI Agent Marketplace"
   - Workspace: Select your workspace
3. **Configure OAuth & Permissions**:
   - Go to "OAuth & Permissions"
   - Redirect URLs: Add `https://ai-agency-website-c7fs.vercel.app/api/oauth/slack/callback`
   - Scopes: Add these Bot Token Scopes:
     - `chat:write`
     - `channels:read`
     - `groups:read`
     - `im:read`
     - `mpim:read`
     - `users:read`
4. **Install App to Workspace**:
   - Click "Install to Workspace"
   - Authorize the app
5. **Copy Credentials**:
   - Client ID: Copy to `SLACK_CLIENT_ID`
   - Client Secret: Copy to `SLACK_CLIENT_SECRET`

---

### **4. Zapier OAuth** 🔗 (Priority: MEDIUM)
**Purpose**: App automation and integration agents

#### **Setup Steps:**
1. **Go to Zapier Developer Platform**: https://developer.zapier.com/
2. **Create New App**:
   - Click "Create App"
   - App Name: "Xeinst AI Agent Marketplace"
   - Description: "AI Agent Marketplace for Zapier integration"
3. **Configure OAuth**:
   - Go to "Authentication"
   - Choose "OAuth v2"
   - Redirect URI: `https://ai-agency-website-c7fs.vercel.app/api/oauth/zapier/callback`
4. **Get Credentials**:
   - Client ID: Copy to `ZAPIER_CLIENT_ID`
   - Client Secret: Copy to `ZAPIER_CLIENT_SECRET`

---

## 🔧 **Environment Variables Setup**

Create a `.env.local` file with these variables:

```bash
# ========================================
# OAUTH INTEGRATIONS
# ========================================

# Gmail OAuth
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here

# Make.com OAuth
MAKE_CLIENT_ID=your_make_client_id_here
MAKE_CLIENT_SECRET=your_make_client_secret_here

# Slack OAuth
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here

# Zapier OAuth
ZAPIER_CLIENT_ID=your_zapier_client_id_here
ZAPIER_CLIENT_SECRET=your_zapier_client_secret_here

# ========================================
# ENCRYPTION
# ========================================
ENCRYPTION_KEY=your_32_character_encryption_key_here

# ========================================
# STRIPE PAYMENT
# ========================================
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ========================================
# DATABASE
# ========================================
DATABASE_URL=your_database_url_here

# ========================================
# AUTHENTICATION
# ========================================
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://ai-agency-website-c7fs.vercel.app
```

---

## 🚀 **Quick Setup Script**

Run this script to generate a secure encryption key:

```bash
# Generate encryption key
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ **Testing OAuth Integrations**

After setting up the environment variables:

1. **Start the development server**: `npm run dev`
2. **Test OAuth flows**:
   - Go to `/test-oauth` page
   - Test each OAuth integration
   - Verify redirects work correctly

---

## 🎯 **Priority Order**

### **Start with these 2 (Most Important):**
1. **Gmail OAuth** - Most common use case (email agents)
2. **Make.com OAuth** - Powerful automation platform

### **Then add these 2:**
3. **Slack OAuth** - Team communication
4. **Zapier OAuth** - App integrations

---

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Invalid redirect URI"**:
   - Check that redirect URI matches exactly
   - Ensure no trailing slashes
   - Verify HTTPS in production

2. **"Invalid client credentials"**:
   - Double-check Client ID and Secret
   - Ensure no extra spaces or characters
   - Verify credentials are from the correct app

3. **"Scope not authorized"**:
   - Check that all required scopes are added
   - Re-authorize the app if scopes were changed

4. **"App not installed"**:
   - For Slack: Install app to workspace
   - For Make.com: Ensure app is published
   - For Zapier: Complete app setup

---

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test OAuth flows in development first
4. Check OAuth provider documentation

---

**Once all OAuth integrations are set up, your AI Agent Marketplace will be fully functional!** 🎉
