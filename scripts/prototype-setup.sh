#!/bin/bash

echo "🚀 AI Agency Website - Prototype Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting prototype setup..."

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check package manager
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    print_success "Using pnpm"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    print_success "Using npm"
else
    print_error "Neither pnpm nor npm is installed. Please install one of them."
    exit 1
fi

# Step 2: Install dependencies
print_status "Installing dependencies..."
$PACKAGE_MANAGER install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Setup prototype environment
print_status "Setting up prototype environment..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
    print_warning ".env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local with prototype configuration
cat > .env.local << EOF
# =============================================================================
# AI Agency Website - Prototype Environment
# =============================================================================

# Core Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration (REQUIRED - Update this!)
DATABASE_URL="postgresql://username:password@localhost:5432/ai_agency_dev"

# Authentication (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Mock Services (All enabled for prototype)
MOCK_S3_ENABLED=true
MOCK_STRIPE_ENABLED=true
MOCK_EMAIL_ENABLED=true
MOCK_REDIS_ENABLED=true
MOCK_SENTRY_ENABLED=true
MOCK_ANALYTICS_ENABLED=true

# Feature Flags (All enabled for prototype)
FEATURE_AGENT_EXECUTION_ENABLED=true
FEATURE_WEB_EMBEDS_ENABLED=true
FEATURE_CREDIT_SYSTEM_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true
FEATURE_REAL_TIME_MONITORING=true
FEATURE_BACKGROUND_JOBS_ENABLED=true

# Development Settings
DEBUG_ENABLED=true
LOG_LEVEL=debug
API_LOGGING_ENABLED=true

# Agent Execution (Mock)
AGENT_EXECUTION_TIMEOUT=30000
AGENT_MAX_FILE_SIZE=10485760
AGENT_DEFAULT_PRICE=5
AGENT_PLATFORM_FEE_PERCENTAGE=20

# Rate Limiting (Mock)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX_REQUESTS=60

# Testing Configuration
TEST_ENVIRONMENT=local
TEST_TIMEOUT=10000
TEST_RETRIES=3

# Test Data
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123
TEST_AGENT_ID=test-agent-id
TEST_DEPLOYMENT_ID=test-deployment-id
EOF

print_success "Prototype environment file created: .env.local"

# Step 4: Generate Prisma client
print_status "Generating Prisma client..."
$PACKAGE_MANAGER prisma generate
if [ $? -eq 0 ]; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Step 5: Database setup instructions
echo ""
print_status "Database Setup Required"
echo "============================"
echo ""
echo "You need to set up a PostgreSQL database. Choose one option:"
echo ""
echo "Option 1: Local PostgreSQL"
echo "  - Install PostgreSQL locally"
echo "  - Create database: createdb ai_agency_dev"
echo "  - Update DATABASE_URL in .env.local"
echo ""
echo "Option 2: Free Cloud Database (Recommended)"
echo "  - Go to https://supabase.com (free tier)"
echo "  - Create a new project"
echo "  - Get the connection string from Settings > Database"
echo "  - Update DATABASE_URL in .env.local"
echo ""
echo "Option 3: Neon Database (Free)"
echo "  - Go to https://neon.tech"
echo "  - Create a free account"
echo "  - Create a new project"
echo "  - Copy the connection string"
echo "  - Update DATABASE_URL in .env.local"
echo ""

# Step 6: Check if database is configured
print_status "Checking database configuration..."
if grep -q "postgresql://username:password@localhost:5432/ai_agency_dev" .env.local; then
    print_warning "Database URL is still using placeholder values"
    echo ""
    echo "Please update the DATABASE_URL in .env.local with your actual database connection string"
    echo "Example: DATABASE_URL=\"postgresql://user:pass@host:port/database\""
    echo ""
    read -p "Press Enter when you've updated the DATABASE_URL..."
fi

# Step 7: Run database migrations
print_status "Running database migrations..."
$PACKAGE_MANAGER prisma migrate dev --name init
if [ $? -eq 0 ]; then
    print_success "Database migrations completed"
else
    print_error "Failed to run database migrations"
    echo ""
    echo "This usually means:"
    echo "1. Database URL is incorrect"
    echo "2. Database is not accessible"
    echo "3. Database doesn't exist"
    echo ""
    echo "Please check your DATABASE_URL in .env.local and try again"
    exit 1
fi

# Step 8: Seed test data (optional)
echo ""
read -p "Would you like to seed test data? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Seeding test data..."
    $PACKAGE_MANAGER exec node scripts/seed-user.js
    if [ $? -eq 0 ]; then
        print_success "Test data seeded successfully"
    else
        print_warning "Failed to seed test data (this is optional)"
    fi
fi

# Step 9: Start development server
echo ""
print_status "Starting prototype development server..."
echo ""
print_success "Prototype setup complete! Starting development server..."
echo ""
echo "🎯 PROTOTYPE FEATURES:"
echo "  ✅ All external services are MOCKED"
echo "  ✅ No API keys required"
echo "  ✅ Full functionality for testing"
echo "  ✅ Enhanced error handling"
echo "  ✅ Real-time monitoring (mock)"
echo "  ✅ Payment processing (mock)"
echo "  ✅ File uploads (mock)"
echo "  ✅ Email notifications (mock)"
echo ""
echo "🌐 Your AI Agency Website will be available at: http://localhost:3000"
echo ""
echo "📋 Test These Features:"
echo "  ✅ Homepage: http://localhost:3000"
echo "  ✅ Error Handling: http://localhost:3000/test-error-handling"
echo "  ✅ Marketplace: http://localhost:3000/marketplace"
echo "  ✅ User Registration: http://localhost:3000/signup"
echo "  ✅ Dashboard: http://localhost:3000/dashboard"
echo "  ✅ Agent Upload: http://localhost:3000/upload"
echo ""
echo "🔍 Mock Service Activity:"
echo "  📧 Check console for mock email logs"
echo "  💳 Check console for mock payment logs"
echo "  📊 Check console for mock analytics logs"
echo "  🚨 Check console for mock error tracking"
echo "  🤖 Check console for mock agent execution"
echo ""
echo "📚 Documentation:"
echo "  📖 Prototype Setup: LOCAL_SETUP.md"
echo "  📖 Backend Architecture: docs/backend-architecture.md"
echo "  📖 Error Handling: docs/enhanced-error-handling.md"
echo ""
echo "🛠️ Development Commands:"
echo "  🚀 Start dev server: $PACKAGE_MANAGER dev"
echo "  🗄️  Database GUI: $PACKAGE_MANAGER prisma studio"
echo "  🧪 Run tests: $PACKAGE_MANAGER test"
echo "  🔍 Type check: $PACKAGE_MANAGER type-check"
echo "  🧹 Lint code: $PACKAGE_MANAGER lint"
echo ""

$PACKAGE_MANAGER dev 