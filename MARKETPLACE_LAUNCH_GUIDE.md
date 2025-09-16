# 🚀 Xeinst AI Agent Marketplace - Launch Setup Guide

## 🎯 **Your Marketplace Model**

**Xeinst** is an AI Agent Marketplace where:
- **Creators** upload AI agents and earn 80% of execution fees
- **Buyers** purchase credits and run agents with their connected accounts
- **You** take 20% platform fee and host everything

## 🔐 **OAuth Setup (Priority Order)**

### **1. Gmail OAuth** 📧 (Start Here - Most Popular)
**Why**: Email agents are the most common use case

#### **Quick Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project: "Xeinst AI Marketplace"
3. Enable Gmail API
4. Create OAuth 2.0 credentials:
   - **Redirect URI**: `https://ai-agency-website-c7fs.vercel.app/api/oauth/gmail/callback`
   - **Scopes**: `gmail.readonly`, `gmail.send`, `gmail.modify`
5. Copy Client ID and Secret

### **2. Make.com OAuth** ⚡ (High Priority)
**Why**: Powerful automation platform

#### **Quick Setup:**
1. Go to [Make.com Developer Portal](https://www.make.com/en/help/apps/create-app)
2. Create app: "Xeinst AI Marketplace"
3. Set redirect URI: `https://ai-agency-website-c7fs.vercel.app/api/oauth/make/callback`
4. Copy Client ID and Secret

### **3. Slack OAuth** 💬 (Medium Priority)
**Why**: Team communication agents

#### **Quick Setup:**
1. Go to [Slack API Dashboard](https://api.slack.com/apps)
2. Create app: "Xeinst AI Marketplace"
3. Add redirect URL: `https://ai-agency-website-c7fs.vercel.app/api/oauth/slack/callback`
4. Add scopes: `chat:write`, `channels:read`, `users:read`
5. Copy Client ID and Secret

### **4. Zapier OAuth** 🔗 (Medium Priority)
**Why**: App integration agents

#### **Quick Setup:**
1. Go to [Zapier Developer Platform](https://developer.zapier.com/)
2. Create app: "Xeinst AI Marketplace"
3. Set redirect URI: `https://ai-agency-website-c7fs.vercel.app/api/oauth/zapier/callback`
4. Copy Client ID and Secret

## 💳 **Stripe Setup**

### **1. Create Stripe Account**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Complete account setup
3. Get API keys from [API Keys page](https://dashboard.stripe.com/apikeys)

### **2. Set up Webhook**
1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://ai-agency-website-c7fs.vercel.app/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret

### **3. Credit Packages**
Your marketplace uses these credit packages:
- **Starter**: 100 credits for $10
- **Pro**: 500 credits for $45  
- **Enterprise**: 1000 credits for $80

## 🔧 **Environment Variables**

Create `.env.local` with these values:

```bash
# OAuth Integrations
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
MAKE_CLIENT_ID=your_make_client_id
MAKE_CLIENT_SECRET=your_make_client_secret
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
ZAPIER_CLIENT_ID=your_zapier_client_id
ZAPIER_CLIENT_SECRET=your_zapier_client_secret

# Stripe Payment
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Encryption
ENCRYPTION_KEY=your_32_character_key

# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://ai-agency-website-c7fs.vercel.app
```

## 🚀 **Launch Steps**

### **Phase 1: Core Setup (Start Here)**
1. ✅ **Set up Gmail OAuth** (most important)
2. ✅ **Set up Make.com OAuth** (second most important)
3. ✅ **Configure Stripe** (for payments)
4. ✅ **Deploy to production**

### **Phase 2: Expansion**
5. ✅ **Add Slack OAuth** (for communication agents)
6. ✅ **Add Zapier OAuth** (for integration agents)
7. ✅ **Test all integrations**

### **Phase 3: Launch**
8. ✅ **Create first agent** (your own)
9. ✅ **Test full flow**: Upload → Buy → Connect → Execute
10. ✅ **Launch publicly**

## 🎯 **Revenue Model**

### **For Each Agent Execution:**
- **Buyer pays**: X credits
- **Creator earns**: 80% of credits × $0.10
- **You earn**: 20% of credits × $0.10

### **Example:**
- Agent costs 5 credits to run
- Buyer pays: 5 credits
- Creator earns: 5 × $0.10 × 0.8 = $0.40
- You earn: 5 × $0.10 × 0.2 = $0.10

## 🧪 **Testing Your Marketplace**

### **1. Test OAuth Flows**
- Go to `/test-oauth` page
- Test each OAuth integration
- Verify redirects work

### **2. Test Payment Flow**
- Go to `/buy-credits` page
- Purchase test credits
- Verify Stripe webhook works

### **3. Test Agent Execution**
- Upload a test agent
- Connect accounts via OAuth
- Execute agent and verify results

## 📊 **Success Metrics**

Track these metrics for your marketplace:
- **Agent uploads** (creators joining)
- **Credit purchases** (buyers spending)
- **Agent executions** (usage)
- **Revenue per execution** (your 20% cut)
- **Creator earnings** (80% to creators)

## 🎉 **Launch Checklist**

- [ ] Gmail OAuth configured
- [ ] Make.com OAuth configured  
- [ ] Stripe payment system working
- [ ] Database connected
- [ ] Environment variables set
- [ ] Deployed to production
- [ ] Test OAuth flows working
- [ ] Test payment flows working
- [ ] First agent uploaded
- [ ] First execution completed
- [ ] Revenue tracking working

**Once all items are checked, your AI Agent Marketplace is ready to launch!** 🚀

## 🆘 **Need Help?**

1. **OAuth Issues**: Check `/test-oauth` page
2. **Payment Issues**: Check Stripe dashboard
3. **Execution Issues**: Check `/analytics` page
4. **General Issues**: Check server logs

**Your marketplace is built and ready - just need the OAuth and Stripe setup!** 🎯
