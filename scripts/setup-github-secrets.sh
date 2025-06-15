#!/bin/bash

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub first using 'gh auth login'"
    exit 1
fi

# Function to set secret if it doesn't exist
set_secret_if_missing() {
    local secret_name=$1
    local secret_value=$2
    
    if ! gh secret list | grep -q "$secret_name"; then
        echo "Setting $secret_name..."
        echo "$secret_value" | gh secret set "$secret_name"
    else
        echo "$secret_name already exists"
    fi
}

# Required secrets
set_secret_if_missing "DATABASE_URL" "postgresql://postgres:postgres@localhost:5432/ai_agency"
set_secret_if_missing "NEXTAUTH_URL" "http://localhost:3000"
set_secret_if_missing "NEXTAUTH_SECRET" "$(openssl rand -base64 32)"
set_secret_if_missing "NEXT_PUBLIC_API_URL" "http://localhost:3000/api"
set_secret_if_missing "GOOGLE_CLIENT_ID" "your-google-client-id"
set_secret_if_missing "GOOGLE_CLIENT_SECRET" "your-google-client-secret"
set_secret_if_missing "VERCEL_TOKEN" "your-vercel-token"
set_secret_if_missing "VERCEL_ORG_ID" "your-vercel-org-id"
set_secret_if_missing "VERCEL_PROJECT_ID" "your-vercel-project-id"
set_secret_if_missing "CODECOV_TOKEN" "your-codecov-token"

echo "GitHub secrets setup complete!"
echo "Please make sure to update the Vercel and Codecov tokens with your actual values." 