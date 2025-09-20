# GCS + Cloud CDN Deployment Script for ShopWave Frontend (PowerShell)
# This script deploys the frontend to Google Cloud Storage with Cloud CDN

param(
    [string]$BackendUrl = "",
    [string]$ProjectId = "kbtu-cloud-assignment2-w0nsdoof",
    [string]$Region = "europe-west3"
)

$BucketName = "shopwave-frontend-$ProjectId"

Write-Host "🚀 ShopWave Frontend GCS + CDN Deployment" -ForegroundColor Green
Write-Host "Project: $ProjectId" -ForegroundColor Cyan
Write-Host "Bucket: $BucketName" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan

# Check if gcloud is available
try {
    $null = gcloud config get-value project 2>$null
} catch {
    Write-Host "❌ Error: gcloud is not configured. Please run 'gcloud auth login' and 'gcloud config set project $ProjectId'" -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "📋 Setting project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Check if backend URL is provided
if ([string]::IsNullOrEmpty($BackendUrl)) {
    Write-Host "⚠️  Warning: BackendUrl not provided. Using placeholder." -ForegroundColor Yellow
    Write-Host "   Please provide -BackendUrl parameter or update .env.production manually" -ForegroundColor Yellow
    $BackendUrl = "https://shopwave-backend-xxxxx-ew.a.run.app"
}

# Update environment variables
Write-Host "🔧 Configuring environment variables..." -ForegroundColor Yellow
$envContent = @"
# Production Environment Variables for GCS Deployment
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

# Create bucket if it doesn't exist
Write-Host "🪣 Setting up GCS bucket..." -ForegroundColor Yellow
$bucketExists = gsutil ls -b "gs://$BucketName" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating bucket $BucketName..." -ForegroundColor Blue
    gsutil mb -p $ProjectId -c STANDARD -l $Region "gs://$BucketName"
} else {
    Write-Host "   Bucket $BucketName already exists" -ForegroundColor Green
}

# Configure bucket for static website hosting
Write-Host "🌐 Configuring static website hosting..." -ForegroundColor Yellow
gsutil web set -m index.html -e 404.html "gs://$BucketName"

# Make bucket publicly readable
Write-Host "🔓 Setting public access permissions..." -ForegroundColor Yellow
gsutil iam ch allUsers:objectViewer "gs://$BucketName"

# Upload files
Write-Host "⬆️  Uploading files to bucket..." -ForegroundColor Yellow
gsutil -m rsync -r -d dist/ "gs://$BucketName/"

# Create backend bucket for CDN
Write-Host "🌍 Setting up Cloud CDN..." -ForegroundColor Yellow
$BackendBucketName = "shopwave-frontend-backend"

$backendBucketExists = gcloud compute backend-buckets describe $BackendBucketName --global 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating backend bucket configuration..." -ForegroundColor Blue
    gcloud compute backend-buckets create $BackendBucketName `
        --gcs-bucket-name=$BucketName `
        --enable-cdn `
        --cache-mode=CACHE_ALL_STATIC
} else {
    Write-Host "   Backend bucket $BackendBucketName already exists" -ForegroundColor Green
}

# Create URL map
$UrlMapName = "shopwave-frontend-map"
$urlMapExists = gcloud compute url-maps describe $UrlMapName --global 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating URL map..." -ForegroundColor Blue
    gcloud compute url-maps create $UrlMapName `
        --default-backend-bucket=$BackendBucketName
} else {
    Write-Host "   URL map $UrlMapName already exists" -ForegroundColor Green
}

# Reserve IP address
$IpName = "shopwave-frontend-ip"
$ipExists = gcloud compute addresses describe $IpName --global 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Reserving static IP address..." -ForegroundColor Blue
    gcloud compute addresses create $IpName --global
}

# Get the reserved IP
$StaticIp = gcloud compute addresses describe $IpName --global --format="value(address)"
Write-Host "   Static IP: $StaticIp" -ForegroundColor Green

# Create HTTP load balancer
$LbName = "shopwave-frontend-lb"
$lbExists = gcloud compute target-http-proxies describe $LbName --global 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating HTTP load balancer..." -ForegroundColor Blue
    gcloud compute target-http-proxies create $LbName `
        --url-map=$UrlMapName
    
    gcloud compute forwarding-rules create "$LbName-http" `
        --address=$IpName `
        --global `
        --target-http-proxy=$LbName `
        --ports=80
} else {
    Write-Host "   Load balancer $LbName already exists" -ForegroundColor Green
}

# Output information
Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Information:" -ForegroundColor Cyan
Write-Host "   Project ID: $ProjectId"
Write-Host "   Bucket: gs://$BucketName"
Write-Host "   Static IP: $StaticIp"
Write-Host "   Backend URL: $BackendUrl"
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Direct bucket: https://storage.googleapis.com/$BucketName/index.html"
Write-Host "   Load Balancer: http://$StaticIp"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure your domain to point to IP: $StaticIp"
Write-Host "2. Set up SSL certificate for HTTPS (recommended)"
Write-Host "3. Update backend CORS settings to allow your domain"
Write-Host "4. Update FRONTEND_URL in backend environment to your domain"
Write-Host ""
Write-Host "💡 SSL Certificate Setup (optional):" -ForegroundColor Magenta
Write-Host "   gcloud compute ssl-certificates create shopwave-ssl-cert ``"
Write-Host "     --domains=your-domain.com"
Write-Host "   gcloud compute target-https-proxies create $LbName-https ``"
Write-Host "     --url-map=$UrlMapName ``"
Write-Host "     --ssl-certificates=shopwave-ssl-cert"
Write-Host "   gcloud compute forwarding-rules create $LbName-https ``"
Write-Host "     --address=$IpName ``"
Write-Host "     --global ``"
Write-Host "     --target-https-proxy=$LbName-https ``"
Write-Host "     --ports=443"
Write-Host ""
Write-Host "🎉 Frontend is now live with Cloud CDN!" -ForegroundColor Green