#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo "Please update the .env file with your environment variables"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Start development server
echo "Starting development server..."
npm run dev 