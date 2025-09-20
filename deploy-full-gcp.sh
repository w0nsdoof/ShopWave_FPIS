#!/bin/bash

# Complete GCP Deployment Script for ShopWave Project
# This script deploys both backend and frontend components to Google Cloud Platform

set -e

# Configuration
PROJECT_ID="kbtu-cloud-assignment2-w0nsdoof"
REGION="europe-west3"
SQL_INSTANCE="shopwave-sql"
REDIS_INSTANCE="shopwave-redis"
BACKEND_SERVICE="shopwave-backend"
FRONTEND_BUCKET="shopwave-frontend-${PROJECT_ID}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ShopWave Complete GCP Deployment${NC}"
echo -e "${CYAN}Project: $PROJECT_ID${NC}"
echo -e "${CYAN}Region: $REGION${NC}"
echo ""

# Check if gcloud is configured
if ! gcloud config get-value project > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: gcloud is not configured. Please run 'gcloud auth login' and 'gcloud config set project $PROJECT_ID'${NC}"
    exit 1
fi

# Set project
echo -e "${YELLOW}📋 Setting project configuration...${NC}"
gcloud config set project $PROJECT_ID

# Step 1: Create Cloud SQL (Postgres)
echo -e "${YELLOW}🗄️  Step 1: Setting up Cloud SQL (PostgreSQL)...${NC}"
if ! gcloud sql instances describe $SQL_INSTANCE > /dev/null 2>&1; then
    echo -e "${BLUE}   Creating SQL instance...${NC}"
    gcloud sql instances create $SQL_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --assign-ip
    
    echo -e "${BLUE}   Setting database password...${NC}"
    gcloud sql users set-password postgres \
        --instance=$SQL_INSTANCE \
        --password="STRONG_PASS_$(date +%s)"
    
    echo -e "${BLUE}   Creating database...${NC}"
    gcloud sql databases create shopwave --instance=$SQL_INSTANCE
else
    echo -e "${GREEN}   SQL instance $SQL_INSTANCE already exists${NC}"
fi

# Get SQL IP
SQL_IP=$(gcloud sql instances describe $SQL_INSTANCE --format="value(ipAddresses[0].ipAddress)")
echo -e "${GREEN}   SQL IP: $SQL_IP${NC}"

# Step 2: Create Memorystore (Redis)
echo -e "${YELLOW}🔴 Step 2: Setting up Memorystore (Redis)...${NC}"
if ! gcloud redis instances describe $REDIS_INSTANCE --region=$REGION > /dev/null 2>&1; then
    echo -e "${BLUE}   Creating Redis instance...${NC}"
    gcloud redis instances create $REDIS_INSTANCE \
        --size=1 \
        --region=$REGION \
        --tier=BASIC
else
    echo -e "${GREEN}   Redis instance $REDIS_INSTANCE already exists${NC}"
fi

# Get Redis IP
REDIS_IP=$(gcloud redis instances describe $REDIS_INSTANCE --region=$REGION --format="value(host)")
echo -e "${GREEN}   Redis IP: $REDIS_IP${NC}"

# Step 3: Build and Deploy Backend
echo -e "${YELLOW}🏗️  Step 3: Building and deploying backend...${NC}"

# Check if we're in the frontend directory, if so, we need to go to backend
if [[ -f "next.config.mjs" ]]; then
    echo -e "${YELLOW}   Detected frontend directory. Please run this script from the backend directory or provide the backend path.${NC}"
    echo -e "${YELLOW}   For now, skipping backend build. You can build it manually with:${NC}"
    echo -e "${BLUE}   gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE /path/to/backend${NC}"
else
    echo -e "${BLUE}   Building backend image...${NC}"
    gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE .
fi

# Deploy Backend Cloud Run
echo -e "${BLUE}   Deploying backend to Cloud Run...${NC}"
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --region=$REGION \
    --allow-unauthenticated \
    --set-env-vars "SECRET_KEY=change_me_$(date +%s)" \
    --set-env-vars "DEBUG=False" \
    --set-env-vars "DATABASE_URL=postgres://postgres:STRONG_PASS_$(date +%s)@$SQL_IP:5432/shopwave" \
    --set-env-vars "REDIS_URL=redis://$REDIS_IP:6379/0" \
    --set-env-vars "FRONTEND_URL=https://storage.googleapis.com/$FRONTEND_BUCKET" \
    --memory=512Mi \
    --cpu=1 \
    --timeout=300

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format="value(status.url)")
echo -e "${GREEN}   Backend URL: $BACKEND_URL${NC}"

# Update backend with its own host
BACKEND_HOST=$(echo $BACKEND_URL | sed 's|https://||')
echo -e "${BLUE}   Updating backend with BACKEND_HOST...${NC}"
gcloud run services update $BACKEND_SERVICE \
    --region=$REGION \
    --set-env-vars "BACKEND_HOST=$BACKEND_HOST"

# Step 4: Run Database Migrations
echo -e "${YELLOW}🔄 Step 4: Running database migrations...${NC}"
echo -e "${BLUE}   You can run migrations locally with:${NC}"
echo -e "${CYAN}   export DATABASE_URL=postgres://postgres:STRONG_PASS@$SQL_IP:5432/shopwave${NC}"
echo -e "${CYAN}   python manage.py migrate${NC}"
echo ""
echo -e "${BLUE}   Or create a Cloud Run job for migrations (recommended for production)${NC}"

# Step 5: Deploy Frontend
echo -e "${YELLOW}🌐 Step 5: Deploying frontend to GCS + CDN...${NC}"

# Update environment for frontend build
echo -e "${BLUE}   Configuring frontend environment variables...${NC}"
cat > .env.production << EOF
# Production Environment Variables for GCS Deployment
NEXT_PUBLIC_API_URL=$BACKEND_URL
NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL
NEXT_PUBLIC_MEDIA_URL=$BACKEND_URL
NODE_ENV=production
EOF

echo -e "${BLUE}   Building frontend...${NC}"
npm install
npm run build

echo -e "${BLUE}   Deploying to GCS with CDN...${NC}"
./deploy-gcs.sh

# Step 6: Update Backend CORS
echo -e "${YELLOW}🔗 Step 6: Final configuration...${NC}"
echo -e "${BLUE}   Don't forget to update backend CORS settings to allow:${NC}"
echo -e "${CYAN}   - https://storage.googleapis.com/$FRONTEND_BUCKET${NC}"
echo -e "${CYAN}   - Your custom domain (if you set one up)${NC}"

echo ""
echo -e "${GREEN}✅ Deployment Summary:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Infrastructure:${NC}"
echo -e "   Project ID: $PROJECT_ID"
echo -e "   Region: $REGION"
echo -e "   SQL Instance: $SQL_INSTANCE ($SQL_IP)"
echo -e "   Redis Instance: $REDIS_INSTANCE ($REDIS_IP)"
echo ""
echo -e "${CYAN}🔗 Services:${NC}"
echo -e "   Backend: $BACKEND_URL"
echo -e "   Frontend Bucket: gs://$FRONTEND_BUCKET"
echo ""
echo -e "${CYAN}📋 Next Steps:${NC}"
echo -e "1. Run database migrations"
echo -e "2. Configure custom domain (optional)"
echo -e "3. Set up SSL certificate for frontend (recommended)"
echo -e "4. Update backend CORS settings"
echo -e "5. Test the application end-to-end"
echo ""
echo -e "${GREEN}🎉 ShopWave deployment completed!${NC}"