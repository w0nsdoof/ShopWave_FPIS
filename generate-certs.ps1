# Script to generate self-signed certificates for local HTTPS testing
$ErrorActionPreference = "Stop"

Write-Host "Generating self-signed certificates for local HTTPS testing..." -ForegroundColor Cyan

# Use OpenSSL to generate certificates
# Check if OpenSSL is installed
$opensslExists = $null -ne (Get-Command openssl -ErrorAction SilentlyContinue)

if (-not $opensslExists) {
    Write-Host "OpenSSL not found. Please install OpenSSL or use Windows Certificate Manager." -ForegroundColor Red
    exit 1
}

# Generate private key and certificate
Write-Host "Generating private key and certificate..." -ForegroundColor Yellow

# Create openssl config file
$configContent = @"
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
"@

Set-Content -Path ".\openssl.cnf" -Value $configContent

# Generate key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -config openssl.cnf

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate certificates!" -ForegroundColor Red
    exit 1
}

# Clean up config file
Remove-Item -Path ".\openssl.cnf"

Write-Host "`nSelf-signed certificates generated successfully!" -ForegroundColor Green
Write-Host "  - localhost.key: Private key"
Write-Host "  - localhost.crt: Certificate"
Write-Host "`nYou can now run test-mixed-content.ps1 to test your app with HTTPS" -ForegroundColor Cyan
