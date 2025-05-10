Write-Host "Fixing API paths to prevent mixed content issues..." -ForegroundColor Cyan

$apiFiles = Get-ChildItem -Path ".\lib\api\" -Filter "*.ts" -Recurse

foreach ($file in $apiFiles) {
    Write-Host "Processing $($file.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace double API paths - ${API_URL}/api/ with ${API_URL}/
    $newContent = $content -replace '\$\{API_URL\}\/api\/', '${API_URL}/'
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "  Fixed API paths in $($file.Name)" -ForegroundColor Green
    }
    else {
        Write-Host "  No changes needed in $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nAll API paths fixed successfully!" -ForegroundColor Green
Write-Host "Remember to rebuild your application with 'npm run build'" -ForegroundColor Yellow
