# 🚀 Local Development Setup Guide

## Current Status: **90% Ready for Local Testing**

You're very close to having a fully functional local test version! Here's what's ready and what needs to be done:

## ✅ **What's Already Working**

### **Core Features Ready:**
- ✅ **Enhanced Error Handling System** - Complete with retry mechanisms
- ✅ **Agent Marketplace** - Browse and discover agents
- ✅ **User Authentication** - NextAuth.js with multiple providers
- ✅ **Database Schema** - Complete Prisma schema with all models
- ✅ **API Routes** - All major endpoints implemented
- ✅ **UI Components** - Modern, responsive design
- ✅ **Testing Framework** - Vitest with comprehensive tests
- ✅ **Development Scripts** - Automated setup and deployment

### **Infrastructure Ready:**
- ✅ **Environment Configuration** - Complete `.env.example` with all variables
- ✅ **Database Migrations** - Automated schema management
- ✅ **Background Jobs** - Job queue system for reliability
- ✅ **Monitoring** - Health checks and performance tracking
- ✅ **Security** - Rate limiting, input validation, CORS

## 🔧 **Quick Setup (5 minutes)**

### **1. Prerequisites**
```bash
# Make sure you have these installed:
- Node.js 18+ 
- pnpm (or npm)
- PostgreSQL (or use Supabase/Neon for free)
- Git
```

### **2. Clone and Setup**
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-agency-website

# Install dependencies
pnpm install

# Copy environment file
cp env.example .env.local

# Run the setup script
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

### **3. Database Setup**
```bash
# Option A: Local PostgreSQL
# Install PostgreSQL and create a database
createdb ai_agency_dev

# Option B: Free Cloud Database (Recommended)
# Go to https://supabase.com or https://neon.tech
# Create a free database and get the connection URL
```

### **4. Environment Configuration**
Edit `.env.local` with your database URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_agency_dev"
# or for cloud database:
DATABASE_URL="postgresql://user:pass@host:port/database"
```

### **5. Database Migration**
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed test data
pnpm exec node scripts/seed-user.js
```

### **6. Start Development Server**
```bash
pnpm dev
```

Visit `http://localhost:3000` - you should see the AI agency website!

## 🎯 **What You'll Get**

### **Immediately Working:**
- ✅ **Landing Page** - Modern, responsive design
- ✅ **User Registration/Login** - Email/password or OAuth
- ✅ **Agent Marketplace** - Browse available agents
- ✅ **Dashboard** - User management interface
- ✅ **Enhanced Error Handling** - User-friendly error messages
- ✅ **API Endpoints** - All major functionality
- ✅ **Database** - Complete data persistence

### **Optional Features (can be added later):**
- 🔄 **Stripe Payments** - Add payment processing
- 🔄 **Redis Caching** - Add for better performance
- 🔄 **Email Notifications** - Add SMTP configuration
- 🔄 **File Uploads** - Add S3 configuration
- 🔄 **Real-time Features** - Add WebSocket support

## 🧪 **Testing the System**

### **1. Test Error Handling**
Visit: `http://localhost:3000/test-error-handling`
- Test different error types
- See retry mechanisms in action
- Experience user-friendly error messages

### **2. Test Agent Marketplace**
Visit: `http://localhost:3000/marketplace`
- Browse available agents
- Test search and filtering
- Experience enhanced error handling

### **3. Test User Features**
- Register a new account
- Upload an agent
- Test the dashboard
- Experience the credit system

## 🔧 **Configuration Options**

### **Minimal Setup (Works Immediately)**
```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### **Full Setup (All Features)**
```env
# Database
DATABASE_URL="your-database-url"

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis (for caching)
REDIS_URL="your-redis-url"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET_NAME="your-bucket"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. Database Connection Error**
```bash
# Check your DATABASE_URL in .env.local
# Make sure PostgreSQL is running
# Try: pnpm prisma db push
```

**2. Authentication Issues**
```bash
# Generate a new secret:
openssl rand -base64 32
# Update NEXTAUTH_SECRET in .env.local
```

**3. Build Errors**
```bash
# Clear cache and reinstall:
rm -rf node_modules .next
pnpm install
pnpm dev
```

**4. Port Already in Use**
```bash
# Kill process on port 3000:
lsof -ti:3000 | xargs kill -9
# Or use different port:
pnpm dev --port 3001
```

## 📊 **Performance & Monitoring**

### **Development Tools:**
- **Prisma Studio**: `pnpm prisma studio` - Database GUI
- **Test Runner**: `pnpm test` - Run all tests
- **Type Checking**: `pnpm type-check` - Verify TypeScript
- **Linting**: `pnpm lint` - Code quality checks

### **Monitoring:**
- **Health Check**: `http://localhost:3000/api/health`
- **Error Tracking**: Check browser console and server logs
- **Performance**: Built-in Next.js analytics

## 🎉 **Success Indicators**

You'll know everything is working when you can:

1. ✅ **Visit the homepage** without errors
2. ✅ **Register/login** successfully
3. ✅ **Browse the marketplace** and see agents
4. ✅ **Upload an agent** (if S3 is configured)
5. ✅ **Test error handling** at `/test-error-handling`
6. ✅ **Use the dashboard** to manage your account

## 🚀 **Next Steps After Setup**

1. **Add Real Data**: Upload some test agents
2. **Configure Payments**: Add Stripe for the credit system
3. **Add File Storage**: Configure S3 for agent uploads
4. **Enable Monitoring**: Add Sentry for error tracking
5. **Deploy**: Push to Vercel for production

## 📞 **Support**

If you encounter issues:

1. **Check the logs**: `pnpm dev` will show detailed error messages
2. **Verify environment**: Make sure all required variables are set
3. **Test database**: Run `pnpm prisma studio` to verify connection
4. **Check health**: Visit `/api/health` for system status

---

**You're 90% ready!** The core system is fully functional. Just follow the setup steps above and you'll have a working local test version in under 10 minutes. 