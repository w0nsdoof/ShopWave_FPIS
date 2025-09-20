#!/bin/bash

# GCS + Cloud CDN Deployment Script for ShopWave Frontend
# This script deploys the frontend to Google Cloud Storage with Cloud CDN

set -e

# Configuration
PROJECT_ID="kbtu-cloud-assignment2-w0nsdoof"
BUCKET_NAME="shopwave-frontend-${PROJECT_ID}"
REGION="europe-west3"
BACKEND_URL=${BACKEND_URL:-""}

echo "🚀 ShopWave Frontend GCS + CDN Deployment"
echo "Project: $PROJECT_ID"
echo "Bucket: $BUCKET_NAME"
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
    echo "   Please set BACKEND_URL environment variable or update .env.production manually"
    BACKEND_URL="https://shopwave-backend-xxxxx-ew.a.run.app"
fi

# Update environment variables
echo "🔧 Configuring environment variables..."
cat > .env.production << EOF
# Production Environment Variables for GCS Deployment
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

# Create bucket if it doesn't exist
echo "🪣 Setting up GCS bucket..."
if ! gsutil ls -b gs://$BUCKET_NAME > /dev/null 2>&1; then
    echo "   Creating bucket $BUCKET_NAME..."
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME
else
    echo "   Bucket $BUCKET_NAME already exists"
fi

# Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Make bucket publicly readable
echo "🔓 Setting public access permissions..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Set cache control for different file types
echo "📋 Setting cache control policies..."
# Long cache for static assets (1 year)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" gs://$BUCKET_NAME/**/*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot}

# Short cache for HTML files (1 hour)
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$BUCKET_NAME/**/*.html

# Upload files
echo "⬆️  Uploading files to bucket..."
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME/

# Create load balancer and CDN (if not exists)
echo "🌍 Setting up Cloud CDN..."

# Create backend bucket
BACKEND_BUCKET_NAME="shopwave-frontend-backend"
if ! gcloud compute backend-buckets describe $BACKEND_BUCKET_NAME --global > /dev/null 2>&1; then
    echo "   Creating backend bucket configuration..."
    gcloud compute backend-buckets create $BACKEND_BUCKET_NAME \
        --gcs-bucket-name=$BUCKET_NAME \
        --enable-cdn \
        --cache-mode=CACHE_ALL_STATIC
else
    echo "   Backend bucket $BACKEND_BUCKET_NAME already exists"
fi

# Create URL map
URL_MAP_NAME="shopwave-frontend-map"
if ! gcloud compute url-maps describe $URL_MAP_NAME --global > /dev/null 2>&1; then
    echo "   Creating URL map..."
    gcloud compute url-maps create $URL_MAP_NAME \
        --default-backend-bucket=$BACKEND_BUCKET_NAME
else
    echo "   URL map $URL_MAP_NAME already exists"
fi

# Reserve IP address
IP_NAME="shopwave-frontend-ip"
if ! gcloud compute addresses describe $IP_NAME --global > /dev/null 2>&1; then
    echo "   Reserving static IP address..."
    gcloud compute addresses create $IP_NAME --global
fi

# Get the reserved IP
STATIC_IP=$(gcloud compute addresses describe $IP_NAME --global --format="value(address)")
echo "   Static IP: $STATIC_IP"

# Create HTTP(S) load balancer
LB_NAME="shopwave-frontend-lb"
if ! gcloud compute target-http-proxies describe $LB_NAME --global > /dev/null 2>&1; then
    echo "   Creating HTTP load balancer..."
    gcloud compute target-http-proxies create $LB_NAME \
        --url-map=$URL_MAP_NAME
    
    gcloud compute forwarding-rules create ${LB_NAME}-http \
        --address=$IP_NAME \
        --global \
        --target-http-proxy=$LB_NAME \
        --ports=80
else
    echo "   Load balancer $LB_NAME already exists"
fi

# Output information
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment Information:"
echo "   Project ID: $PROJECT_ID"
echo "   Bucket: gs://$BUCKET_NAME"
echo "   Static IP: $STATIC_IP"
echo "   Backend URL: $BACKEND_URL"
echo ""
echo "🌐 Access URLs:"
echo "   Direct bucket: https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo "   Load Balancer: http://$STATIC_IP"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your domain to point to IP: $STATIC_IP"
echo "2. Set up SSL certificate for HTTPS (recommended)"
echo "3. Update backend CORS settings to allow your domain"
echo "4. Update FRONTEND_URL in backend environment to your domain"
echo ""
echo "💡 SSL Certificate Setup (optional):"
echo "   gcloud compute ssl-certificates create shopwave-ssl-cert \\"
echo "     --domains=your-domain.com"
echo "   gcloud compute target-https-proxies create ${LB_NAME}-https \\"
echo "     --url-map=$URL_MAP_NAME \\"
echo "     --ssl-certificates=shopwave-ssl-cert"
echo "   gcloud compute forwarding-rules create ${LB_NAME}-https \\"
echo "     --address=$IP_NAME \\"
echo "     --global \\"
echo "     --target-https-proxy=${LB_NAME}-https \\"
echo "     --ports=443"
echo ""
echo "🎉 Frontend is now live with Cloud CDN!"