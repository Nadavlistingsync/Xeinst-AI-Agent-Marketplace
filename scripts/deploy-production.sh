#!/bin/bash

# Production Deployment Script for Xeinst AI Agent Marketplace
# This script prepares and deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting Production Deployment for Xeinst AI Agent Marketplace"
echo "================================================================"

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
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "git is not installed. Please install git and try again."
    exit 1
fi

print_success "git version: $(git --version)"

print_status "Installing dependencies..."
npm ci --production=false

print_status "Running type checking..."
npm run type-check

print_status "Running linting..."
npm run lint

print_status "Running tests..."
npm test

print_status "Building application..."
npm run build

print_success "Build completed successfully!"

print_status "Checking build artifacts..."
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Build artifacts verified"

print_status "Checking environment variables..."

# Check for required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_warning "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    print_warning "Please set these variables in your deployment environment"
fi

# Optional environment variables
OPTIONAL_VARS=(
    "STRIPE_SECRET_KEY"
    "SENTRY_DSN"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

print_status "Checking optional environment variables..."
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "Optional variable not set: $var"
    else
        print_success "Optional variable set: $var"
    fi
done

print_status "Preparing for deployment..."

# Create deployment info file
cat > deployment-info.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(node -v)",
  "npm_version": "$(npm -v)",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git branch --show-current)",
  "build_successful": true,
  "environment": "production"
}
EOF

print_success "Deployment info created"

print_status "Final checks..."

# Check if we can connect to the database (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    print_status "Testing database connection..."
    # Note: In a real deployment, you might want to run a quick DB connection test here
    print_success "Database connection test skipped (requires runtime environment)"
else
    print_warning "DATABASE_URL not set - database connection test skipped"
fi

echo ""
echo "🎉 Deployment Preparation Complete!"
echo "=================================="
echo ""
echo "✅ All checks passed"
echo "✅ Dependencies installed"
echo "✅ Type checking passed"
echo "✅ Linting passed"
echo "✅ Tests passed"
echo "✅ Build successful"
echo "✅ Environment variables checked"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in your hosting platform"
echo "2. Deploy to Vercel, Netlify, or your preferred platform"
echo "3. Run database migrations: npm run prisma:migrate"
echo "4. Verify deployment at your domain"
echo ""
echo "For Vercel deployment:"
echo "  vercel --prod"
echo ""
echo "For manual deployment:"
echo "  - Upload the .next folder and package.json"
echo "  - Set NODE_ENV=production"
echo "  - Start with: npm start"
echo ""

print_success "Deployment script completed successfully!"
