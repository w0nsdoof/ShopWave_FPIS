# Complete GCP Deployment Script for ShopWave Project (PowerShell)
# This script deploys both backend and frontend components to Google Cloud Platform

param(
    [string]$ProjectId = "kbtu-cloud-assignment2-w0nsdoof",
    [string]$Region = "europe-west3",
    [string]$BackendPath = "",
    [switch]$SkipBackend = $false
)

# Configuration
$SqlInstance = "shopwave-sql"
$RedisInstance = "shopwave-redis"
$BackendService = "shopwave-backend"
$FrontendBucket = "shopwave-frontend-$ProjectId"

Write-Host "🚀 ShopWave Complete GCP Deployment" -ForegroundColor Green
Write-Host "Project: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is configured
try {
    $null = gcloud config get-value project 2>$null
} catch {
    Write-Host "❌ Error: gcloud is not configured. Please run 'gcloud auth login' and 'gcloud config set project $ProjectId'" -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "📋 Setting project configuration..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Step 1: Create Cloud SQL (Postgres)
Write-Host "🗄️  Step 1: Setting up Cloud SQL (PostgreSQL)..." -ForegroundColor Yellow
$sqlExists = gcloud sql instances describe $SqlInstance 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating SQL instance..." -ForegroundColor Blue
    gcloud sql instances create $SqlInstance `
        --database-version=POSTGRES_15 `
        --tier=db-f1-micro `
        --region=$Region `
        --assign-ip
    
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    Write-Host "   Setting database password..." -ForegroundColor Blue
    gcloud sql users set-password postgres `
        --instance=$SqlInstance `
        --password="STRONG_PASS_$timestamp"
    
    Write-Host "   Creating database..." -ForegroundColor Blue
    gcloud sql databases create shopwave --instance=$SqlInstance
} else {
    Write-Host "   SQL instance $SqlInstance already exists" -ForegroundColor Green
}

# Get SQL IP
$SqlIp = gcloud sql instances describe $SqlInstance --format="value(ipAddresses[0].ipAddress)"
Write-Host "   SQL IP: $SqlIp" -ForegroundColor Green

# Step 2: Create Memorystore (Redis)
Write-Host "🔴 Step 2: Setting up Memorystore (Redis)..." -ForegroundColor Yellow
$redisExists = gcloud redis instances describe $RedisInstance --region=$Region 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating Redis instance..." -ForegroundColor Blue
    gcloud redis instances create $RedisInstance `
        --size=1 `
        --region=$Region `
        --tier=BASIC
} else {
    Write-Host "   Redis instance $RedisInstance already exists" -ForegroundColor Green
}

# Get Redis IP
$RedisIp = gcloud redis instances describe $RedisInstance --region=$Region --format="value(host)"
Write-Host "   Redis IP: $RedisIp" -ForegroundColor Green

# Step 3: Build and Deploy Backend
Write-Host "🏗️  Step 3: Building and deploying backend..." -ForegroundColor Yellow

if (-not $SkipBackend) {
    # Check if we're in the frontend directory
    if (Test-Path "next.config.mjs") {
        if ([string]::IsNullOrEmpty($BackendPath)) {
            Write-Host "   Detected frontend directory. Skipping backend build." -ForegroundColor Yellow
            Write-Host "   To build backend, provide -BackendPath parameter or run from backend directory" -ForegroundColor Yellow
            Write-Host "   Manual command: gcloud builds submit --tag gcr.io/$ProjectId/$BackendService /path/to/backend" -ForegroundColor Blue
        } else {
            Write-Host "   Building backend from: $BackendPath" -ForegroundColor Blue
            Push-Location $BackendPath
            gcloud builds submit --tag "gcr.io/$ProjectId/$BackendService" .
            Pop-Location
        }
    } else {
        Write-Host "   Building backend image..." -ForegroundColor Blue
        gcloud builds submit --tag "gcr.io/$ProjectId/$BackendService" .
    }
}

# Deploy Backend Cloud Run
Write-Host "   Deploying backend to Cloud Run..." -ForegroundColor Blue
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
gcloud run deploy $BackendService `
    --image "gcr.io/$ProjectId/$BackendService" `
    --region=$Region `
    --allow-unauthenticated `
    --set-env-vars "SECRET_KEY=change_me_$timestamp" `
    --set-env-vars "DEBUG=False" `
    --set-env-vars "DATABASE_URL=postgres://postgres:STRONG_PASS_$timestamp@$SqlIp:5432/shopwave" `
    --set-env-vars "REDIS_URL=redis://$RedisIp:6379/0" `
    --set-env-vars "FRONTEND_URL=https://storage.googleapis.com/$FrontendBucket" `
    --memory=512Mi `
    --cpu=1 `
    --timeout=300

# Get backend URL
$BackendUrl = gcloud run services describe $BackendService --region=$Region --format="value(status.url)"
Write-Host "   Backend URL: $BackendUrl" -ForegroundColor Green

# Update backend with its own host
$BackendHost = $BackendUrl -replace "https://", ""
Write-Host "   Updating backend with BACKEND_HOST..." -ForegroundColor Blue
gcloud run services update $BackendService `
    --region=$Region `
    --set-env-vars "BACKEND_HOST=$BackendHost"

# Step 4: Database Migrations
Write-Host "🔄 Step 4: Database migrations..." -ForegroundColor Yellow
Write-Host "   You can run migrations locally with:" -ForegroundColor Blue
Write-Host "   `$env:DATABASE_URL='postgres://postgres:STRONG_PASS@$SqlIp:5432/shopwave'" -ForegroundColor Cyan
Write-Host "   python manage.py migrate" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Or create a Cloud Run job for migrations (recommended for production)" -ForegroundColor Blue

# Step 5: Deploy Frontend
Write-Host "🌐 Step 5: Deploying frontend to GCS + CDN..." -ForegroundColor Yellow

# Update environment for frontend build
Write-Host "   Configuring frontend environment variables..." -ForegroundColor Blue
$envContent = @"
# Production Environment Variables for GCS Deployment
NEXT_PUBLIC_API_URL=$BackendUrl
NEXT_PUBLIC_BACKEND_URL=$BackendUrl
NEXT_PUBLIC_MEDIA_URL=$BackendUrl
NODE_ENV=production
"@

$envContent | Out-File -FilePath ".env.production" -Encoding utf8

Write-Host "   Building frontend..." -ForegroundColor Blue
npm install
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Deploying to GCS with CDN..." -ForegroundColor Blue
    # Call the GCS deployment script
    .\deploy-gcs.ps1 -BackendUrl $BackendUrl -ProjectId $ProjectId -Region $Region
} else {
    Write-Host "   ❌ Frontend build failed" -ForegroundColor Red
}

# Step 6: Final configuration
Write-Host "🔗 Step 6: Final configuration..." -ForegroundColor Yellow
Write-Host "   Don't forget to update backend CORS settings to allow:" -ForegroundColor Blue
Write-Host "   - https://storage.googleapis.com/$FrontendBucket" -ForegroundColor Cyan
Write-Host "   - Your custom domain (if you set one up)" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Deployment Summary:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "📊 Infrastructure:" -ForegroundColor Cyan
Write-Host "   Project ID: $ProjectId"
Write-Host "   Region: $Region"
Write-Host "   SQL Instance: $SqlInstance ($SqlIp)"
Write-Host "   Redis Instance: $RedisInstance ($RedisIp)"
Write-Host ""
Write-Host "🔗 Services:" -ForegroundColor Cyan
Write-Host "   Backend: $BackendUrl"
Write-Host "   Frontend Bucket: gs://$FrontendBucket"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database migrations"
Write-Host "2. Configure custom domain (optional)"
Write-Host "3. Set up SSL certificate for frontend (recommended)"
Write-Host "4. Update backend CORS settings"
Write-Host "5. Test the application end-to-end"
Write-Host ""
Write-Host "🎉 ShopWave deployment completed!" -ForegroundColor Green