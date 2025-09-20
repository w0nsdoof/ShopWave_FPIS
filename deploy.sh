#!/bin/bash

# Build and Deploy Script for ShopWave Frontend
# This script builds the Next.js application and prepares it for deployment

set -e

echo "🚀 Starting ShopWave Frontend Build and Deploy Process..."

# Check if Cloud Run backend URL is provided
if [ -z "$BACKEND_URL" ]; then
    echo "❌ Error: BACKEND_URL environment variable is required"
    echo "Usage: BACKEND_URL=https://your-backend-url.run.app ./deploy.sh"
    exit 1
fi

echo "📦 Building Next.js application..."

# Set environment variables for build
export NEXT_PUBLIC_API_URL="$BACKEND_URL"
export NEXT_PUBLIC_BACKEND_URL="$BACKEND_URL"
export NEXT_PUBLIC_MEDIA_URL="$BACKEND_URL"
export NODE_ENV="production"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building static files..."
npm run build

echo "✅ Build completed! Static files are ready in the 'out' directory."

# Option A: Cloud Storage + CDN deployment instructions
echo ""
echo "📋 Deployment Options:"
echo ""
echo "🅰️  Option A (Recommended): Cloud Storage + CDN"
echo "   1. Upload the 'out' directory contents to your Cloud Storage bucket:"
echo "      gsutil -m cp -r out/* gs://your-bucket-name/"
echo "   2. Enable Cloud CDN on your bucket"
echo "   3. Configure your domain to point to the CDN"
echo ""

# Option B: Docker deployment instructions
echo "🅱️  Option B: Docker + Cloud Run"
echo "   1. Build Docker image:"
echo "      docker build -t shopwave-frontend ."
echo "   2. Tag for Google Cloud:"
echo "      docker tag shopwave-frontend gcr.io/YOUR_PROJECT_ID/shopwave-frontend"
echo "   3. Push to Container Registry:"
echo "      docker push gcr.io/YOUR_PROJECT_ID/shopwave-frontend"
echo "   4. Deploy to Cloud Run:"
echo "      gcloud run deploy shopwave-frontend \\"
echo "        --image gcr.io/YOUR_PROJECT_ID/shopwave-frontend \\"
echo "        --platform managed \\"
echo "        --region YOUR_REGION \\"
echo "        --allow-unauthenticated"
echo ""

echo "🎉 Frontend build process completed successfully!"
echo "Backend URL configured: $BACKEND_URL"