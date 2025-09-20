# Option B: Deploy Frontend as separate Cloud Run service with Nginx (PowerShell)
# This script builds and deploys the frontend as a Cloud Run service

param(
    [string]$BackendUrl = "",
    [string]$ProjectId = "kbtu-cloud-assignment2-w0nsdoof",
    [string]$Region = "europe-west3",
    [string]$ServiceName = "shopwave-frontend"
)

Write-Host "🚀 ShopWave Frontend Cloud Run Deployment (Option B)" -ForegroundColor Green
Write-Host "Project: $ProjectId" -ForegroundColor Cyan
Write-Host "Service: $ServiceName" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan

# Check if gcloud is available
try {
    $null = gcloud config get-value project 2>$null
}
catch {
    Write-Host "❌ Error: gcloud is not configured. Please run 'gcloud auth login' and 'gcloud config set project $ProjectId'" -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "📋 Setting project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Check if backend URL is provided
if ([string]::IsNullOrEmpty($BackendUrl)) {
    Write-Host "⚠️  Warning: BackendUrl not provided. Using placeholder." -ForegroundColor Yellow
    Write-Host "   Please provide -BackendUrl parameter" -ForegroundColor Yellow
    $BackendUrl = "https://shopwave-backend-xxxxx-ew.a.run.app"
}

# Update environment variables
Write-Host "🔧 Configuring environment variables..." -ForegroundColor Yellow
$envContent = @"
# Production Environment Variables for Cloud Run Deployment
NEXT_PUBLIC_API_URL=$BackendUrl
NEXT_PUBLIC_BACKEND_URL=$BackendUrl
NEXT_PUBLIC_MEDIA_URL=$BackendUrl
NODE_ENV=production
"@

$envContent | Out-File -FilePath ".env.production" -Encoding utf8
Write-Host "   Backend URL: $BackendUrl" -ForegroundColor Green

# Install dependencies and build
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Check if dist directory exists
if (!(Test-Path "dist")) {
    Write-Host "❌ Error: dist directory not found. Build may have failed." -ForegroundColor Red
    exit 1
}

# Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag "gcr.io/$ProjectId/$ServiceName" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --image "gcr.io/$ProjectId/$ServiceName" `
    --region=$Region `
    --allow-unauthenticated `
    --port=80 `
    --memory=256Mi `
    --cpu=1 `
    --timeout=300

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloud Run deployment failed" -ForegroundColor Red
    exit 1
}

# Get frontend URL
$FrontendUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Information:" -ForegroundColor Cyan
Write-Host "   Project ID: $ProjectId"
Write-Host "   Service: $ServiceName"
Write-Host "   Frontend URL: $FrontendUrl"
Write-Host "   Backend URL: $BackendUrl"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update backend CORS settings to allow: $FrontendUrl"
Write-Host "2. Update backend FRONTEND_URL environment variable:"
Write-Host "   gcloud run services update shopwave-backend ``"
Write-Host "     --region=$Region ``"
Write-Host "     --set-env-vars FRONTEND_URL=$FrontendUrl"
Write-Host "3. Test the application"
Write-Host ""
Write-Host "🎉 Frontend is now live on Cloud Run!" -ForegroundColor Green