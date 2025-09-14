# 🚀 Supabase Setup Guide for Xeinst AI Agent Marketplace

This guide will help you set up Supabase database for your AI Agent Marketplace and deploy it to production.

## 📋 Prerequisites

- [Supabase account](https://supabase.com) (free tier available)
- [Vercel account](https://vercel.com) (free tier available)
- Your GitHub repository connected to Vercel

## 🗄️ Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Select your organization
   - Name: `xeinst-ai-marketplace`
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users
4. **Click "Create new project"**
5. **Wait for project to be ready (2-3 minutes)**

## 🔧 Step 2: Set Up Database Schema

1. **Go to your Supabase project dashboard**
2. **Click on "SQL Editor" in the left sidebar**
3. **Click "New query"**
4. **Copy and paste the contents of `supabase-setup.sql`**
5. **Click "Run" to execute the script**
6. **Verify tables were created by going to "Table Editor"**

## 🔑 Step 3: Get Supabase Credentials

1. **Go to "Settings" → "API" in your Supabase dashboard**
2. **Copy these values:**
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...` - keep this secret!)

## 🌐 Step 4: Set Up Vercel Environment Variables

1. **Go to your [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your project**
3. **Go to "Settings" → "Environment Variables"**
4. **Add these environment variables:**

### Required Variables:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

NEXTAUTH_SECRET=[GENERATE-WITH-openssl-rand-base64-32]

NEXTAUTH_URL=https://[YOUR-VERCEL-DOMAIN].vercel.app

NEXT_PUBLIC_APP_URL=https://[YOUR-VERCEL-DOMAIN].vercel.app
```

### Optional Variables (for full functionality):
```
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry (for error tracking)
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...

# Redis (for caching)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## 🔄 Step 5: Deploy to Vercel

1. **Push your latest changes to GitHub:**
   ```bash
   git add .
   git commit -m "Add Supabase setup files"
   git push origin main
   ```

2. **Vercel will automatically deploy**
3. **Wait for deployment to complete**
4. **Test your marketplace at your Vercel URL**

## 🧪 Step 6: Test Your Setup

1. **Visit your marketplace URL**
2. **Verify agents are loading (should show 6 sample agents)**
3. **Test search and filtering functionality**
4. **Check that no errors appear in browser console**

## 🔍 Step 7: Verify Database Connection

1. **Go to your Supabase dashboard**
2. **Click "Table Editor"**
3. **Verify you can see the `agents` table with 6 sample records**
4. **Check that the marketplace is pulling real data from Supabase**

## 🚨 Troubleshooting

### If agents aren't loading:
1. Check Vercel environment variables are set correctly
2. Verify DATABASE_URL format is correct
3. Check Supabase logs in the dashboard
4. Ensure RLS policies allow public read access to agents

### If you get permission errors:
1. Verify RLS policies in Supabase SQL Editor
2. Check that anon and authenticated roles have proper permissions
3. Ensure your Supabase keys are correct

### If build fails:
1. Check that all environment variables are set
2. Verify your GitHub repository has the latest code
3. Check Vercel build logs for specific errors

## 📊 Database Schema Overview

Your Supabase database includes:

- **agents**: AI agents available in the marketplace
- **users**: User accounts and profiles
- **reviews**: User reviews and ratings for agents
- **purchases**: Transaction records
- **credit_transactions**: Credit system tracking

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public read access** to active agents only
- **User-specific access** to personal data
- **Secure authentication** with Supabase Auth

## 🎯 Next Steps

Once your basic setup is working:

1. **Set up Stripe** for payments
2. **Configure authentication** with NextAuth.js
3. **Add file upload** functionality
4. **Set up monitoring** with Sentry
5. **Add more features** as needed

## 📞 Support

If you encounter issues:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review [Vercel Documentation](https://vercel.com/docs)
3. Check your project's GitHub issues

---

**🎉 Congratulations!** Your AI Agent Marketplace should now be live with a real database connection!
