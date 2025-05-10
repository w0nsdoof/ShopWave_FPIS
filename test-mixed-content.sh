#!/bin/bash
# Test script to check for mixed content issues

echo "Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed! Fix the errors and try again."
  exit 1
fi

echo "Starting static file server to test the build..."
echo "Press Ctrl+C to stop the server when finished testing"

# Use http-server to serve the static site
# Install it first if it's not already installed
if ! command -v npx &> /dev/null; then
  echo "Installing npx..."
  npm install -g npx
fi

# Start http-server with HTTPS (for testing mixed content issues)
# Note: You'll need to create self-signed certificates first
# openssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout localhost.key -out localhost.crt
npx http-server ./out -p 3000 --ssl --cert ./localhost.crt --key ./localhost.key

echo "Server stopped"
