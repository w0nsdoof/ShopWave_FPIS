#!/bin/bash

# Option B: Deploy Frontend as separate Cloud Run service with Nginx
# This script builds and deploys the frontend as a Cloud Run service

set -e

# Configuration
PROJECT_ID="kbtu-cloud-assignment2-w0nsdoof"
REGION="europe-west3"
SERVICE_NAME="shopwave-frontend"
BACKEND_URL=${BACKEND_URL:-""}

echo "🚀 ShopWave Frontend Cloud Run Deployment (Option B)"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Check if gcloud is configured
if ! gcloud config get-value project > /dev/null 2>&1; then
    echo "❌ Error: gcloud is not configured. Please run 'gcloud auth login' and 'gcloud config set project $PROJECT_ID'"
    exit 1
fi

# Set project
echo "📋 Setting project..."
gcloud config set project $PROJECT_ID

# Check if backend URL is provided
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  Warning: BACKEND_URL not provided. Using placeholder."
    echo "   Please set BACKEND_URL environment variable"
    BACKEND_URL="https://shopwave-backend-xxxxx-ew.a.run.app"
fi

# Update environment variables
echo "🔧 Configuring environment variables..."
cat > .env.production << EOF
# Production Environment Variables for Cloud Run Deployment
NEXT_PUBLIC_API_URL=${BACKEND_URL}
NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}
NEXT_PUBLIC_MEDIA_URL=${BACKEND_URL}
NODE_ENV=production
EOF

echo "   Backend URL: $BACKEND_URL"

# Install dependencies and build
echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Build may have failed."
    exit 1
fi

# Build Docker image
echo "🐳 Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --region=$REGION \
    --allow-unauthenticated \
    --port=80 \
    --memory=256Mi \
    --cpu=1 \
    --timeout=300

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment Information:"
echo "   Project ID: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Frontend URL: $FRONTEND_URL"
echo "   Backend URL: $BACKEND_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend CORS settings to allow: $FRONTEND_URL"
echo "2. Update backend FRONTEND_URL environment variable:"
echo "   gcloud run services update shopwave-backend \\"
echo "     --region=$REGION \\"
echo "     --set-env-vars FRONTEND_URL=$FRONTEND_URL"
echo "3. Test the application"
echo ""
echo "🎉 Frontend is now live on Cloud Run!"