# PowerShell script for building on Windows
# Install dependencies with legacy-peer-deps
npm install --legacy-peer-deps

# Run the build with output export
npm run build

# Copy routes.json and vercel.json to the output directory
Copy-Item -Path "routes.json" -Destination "out/"
Copy-Item -Path "vercel.json" -Destination "out/"

# Create .nojekyll file to disable Jekyll processing on GitHub Pages
New-Item -Path "out/.nojekyll" -ItemType File -Force

# Success message
Write-Host "Build completed successfully!"
