# 💳 Stripe Payment Setup Guide for Xeinst AI Agent Marketplace

## 🎯 **Overview**

Your marketplace uses Stripe for secure payment processing. Users can purchase credits to use AI agents, and you earn revenue from each execution.

## 🚀 **Quick Setup Steps**

### **1. Create Stripe Account**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in to your account
3. Complete account verification (if required)

### **2. Get API Keys**
1. Go to [API Keys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### **3. Set up Webhook**
1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://ai-agency-website-c7fs.vercel.app/api/payments/webhook`
4. **Events to send**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### **4. Environment Variables**
Add these to your `.env.local`:

```bash
# Stripe Payment Integration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 💰 **Credit System**

### **Credit Packages**
- **Starter Pack**: 100 credits for $10 (1 credit = $0.10)
- **Pro Pack**: 500 credits for $45 (1 credit = $0.09)
- **Enterprise Pack**: 1000 credits for $80 (1 credit = $0.08)

### **Revenue Split**
- **80%** goes to agent creators
- **20%** goes to platform (you)

### **Example Flow**
1. User buys 100 credits for $10
2. User runs an agent that costs 5 credits
3. Agent creator earns: 5 credits × $0.10 × 0.8 = $0.40
4. Platform earns: 5 credits × $0.10 × 0.2 = $0.10

## 🔧 **Testing Payments**

### **Test Mode**
- Use test keys (start with `pk_test_` and `sk_test_`)
- Use test card numbers:
  - **Success**: `4242 4242 4242 4242`
  - **Decline**: `4000 0000 0000 0002`
  - **Insufficient funds**: `4000 0000 0000 9995`

### **Test Webhook**
1. Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/payments/webhook`
2. Or use ngrok for local testing

## 🚀 **Production Setup**

### **1. Switch to Live Mode**
1. In Stripe Dashboard, toggle to "Live mode"
2. Get live API keys
3. Update environment variables with live keys

### **2. Update Webhook URL**
1. Update webhook endpoint to production URL
2. Test webhook with live events

### **3. Enable Features**
1. Enable Stripe Connect (for creator payouts)
2. Set up tax collection (if required)
3. Configure dispute handling

## 📊 **Monitoring & Analytics**

### **Stripe Dashboard**
- Monitor payments and revenue
- Track failed payments
- View customer analytics
- Handle disputes and refunds

### **Your Analytics**
- Go to `/analytics` page
- View execution metrics
- Track revenue per agent
- Monitor user spending

## 🔒 **Security Best Practices**

### **API Keys**
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Use different keys for test/production

### **Webhook Security**
- Verify webhook signatures
- Use HTTPS endpoints
- Validate event data
- Handle idempotency

### **PCI Compliance**
- Stripe handles PCI compliance
- Never store card details
- Use Stripe Elements for forms
- Follow security guidelines

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"Invalid API key"**:
   - Check key format (pk_test_/sk_test_)
   - Ensure no extra spaces
   - Verify test vs live mode

2. **"Webhook signature verification failed"**:
   - Check webhook secret
   - Verify endpoint URL
   - Ensure HTTPS in production

3. **"Payment failed"**:
   - Check card details
   - Verify sufficient funds
   - Check for fraud filters

4. **"Webhook not receiving events"**:
   - Check endpoint URL
   - Verify webhook is enabled
   - Check server logs

### **Debug Mode**
Enable debug logging in development:

```bash
STRIPE_DEBUG=true
```

## 📞 **Support**

### **Stripe Support**
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Community](https://github.com/stripe/stripe-node)

### **Your Implementation**
- Check `/test-oauth` page for OAuth issues
- Check `/analytics` page for payment metrics
- Review server logs for errors

## 🎉 **Success Checklist**

- [ ] Stripe account created and verified
- [ ] API keys obtained and configured
- [ ] Webhook endpoint set up
- [ ] Test payments working
- [ ] Credit system functional
- [ ] Revenue tracking enabled
- [ ] Production keys configured
- [ ] Monitoring set up

**Once all items are checked, your payment system is ready for production!** 🚀
