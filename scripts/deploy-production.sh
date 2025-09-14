#!/bin/bash

# Production Deployment Script for Xeinst AI Agent Marketplace
# This script helps prepare and deploy your MVP to production

set -e

echo "🚀 Starting production deployment process..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Run pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from your project root."
        exit 1
    fi
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes. Please commit or stash them before deploying."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check if we're on main branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        print_warning "You're not on the main branch (currently on: $current_branch)"
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Pre-deployment checks passed"
}

# Build the project locally to catch any errors
build_project() {
    print_status "Building project locally..."
    
    # Install dependencies
    npm install
    
    # Generate Prisma client
    npx prisma generate
    
    # Build the project
    npm run build
    
    print_success "Project built successfully"
}

# Deploy to production
deploy_to_production() {
    print_status "Deploying to production..."
    
    # Push to GitHub (this will trigger Vercel deployment)
    git push origin main
    
    print_success "Code pushed to GitHub successfully"
    print_status "Vercel will automatically deploy your changes"
}

# Post-deployment instructions
post_deployment_instructions() {
    echo
    print_success "Deployment initiated! 🎉"
    echo
    print_status "Next steps:"
    echo "1. Go to your Vercel dashboard to monitor the deployment"
    echo "2. Set up your Supabase database using the SUPABASE_SETUP_GUIDE.md"
    echo "3. Add environment variables in Vercel settings:"
    echo "   - DATABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
    echo "4. Test your deployed application"
    echo
    print_warning "Don't forget to:"
    echo "- Set up Stripe for payments (optional)"
    echo "- Configure Sentry for error tracking (optional)"
    echo "- Test all functionality in production"
    echo
    print_status "Your MVP should be live once Vercel finishes deploying!"
}

# Main execution
main() {
    echo "🎯 Xeinst AI Agent Marketplace - Production Deployment"
    echo "=================================================="
    echo
    
    check_dependencies
    pre_deployment_checks
    build_project
    deploy_to_production
    post_deployment_instructions
}

# Run main function
main "$@"