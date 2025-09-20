# Build and Deploy Script for ShopWave Frontend (PowerShell)
# This script builds the Next.js application and prepares it for deployment

param(
    [Parameter(Mandatory = $true)]
    [string]$BackendUrl
)

Write-Host "🚀 Starting ShopWave Frontend Build and Deploy Process..." -ForegroundColor Green

# Set environment variables for build
$env:NEXT_PUBLIC_API_URL = $BackendUrl
$env:NEXT_PUBLIC_BACKEND_URL = $BackendUrl
$env:NEXT_PUBLIC_MEDIA_URL = $BackendUrl
$env:NODE_ENV = "production"

Write-Host "📦 Building Next.js application..." -ForegroundColor Yellow

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Blue
    npm install
}

# Build the application
Write-Host "🔨 Building static files..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed! Static files are ready in the 'out' directory." -ForegroundColor Green
    
    # Deployment instructions
    Write-Host ""
    Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🅰️  Option A (Recommended): Cloud Storage + CDN" -ForegroundColor Yellow
    Write-Host "   1. Upload the 'out' directory contents to your Cloud Storage bucket:"
    Write-Host "      gsutil -m cp -r out/* gs://your-bucket-name/"
    Write-Host "   2. Enable Cloud CDN on your bucket"
    Write-Host "   3. Configure your domain to point to the CDN"
    Write-Host ""
    
    Write-Host "🅱️  Option B: Docker + Cloud Run" -ForegroundColor Yellow
    Write-Host "   1. Build Docker image:"
    Write-Host "      docker build -t shopwave-frontend ."
    Write-Host "   2. Tag for Google Cloud:"
    Write-Host "      docker tag shopwave-frontend gcr.io/YOUR_PROJECT_ID/shopwave-frontend"
    Write-Host "   3. Push to Container Registry:"
    Write-Host "      docker push gcr.io/YOUR_PROJECT_ID/shopwave-frontend"
    Write-Host "   4. Deploy to Cloud Run:"
    Write-Host "      gcloud run deploy shopwave-frontend ``"
    Write-Host "        --image gcr.io/YOUR_PROJECT_ID/shopwave-frontend ``"
    Write-Host "        --platform managed ``"
    Write-Host "        --region YOUR_REGION ``"
    Write-Host "        --allow-unauthenticated"
    Write-Host ""
    
    Write-Host "🎉 Frontend build process completed successfully!" -ForegroundColor Green
    Write-Host "Backend URL configured: $BackendUrl" -ForegroundColor Green
}
else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}