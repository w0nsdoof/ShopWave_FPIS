#!/bin/bash

# Install dependencies with legacy-peer-deps
npm install --legacy-peer-deps

# Run the build
npm run build

# Copy routes.json and vercel.json to the output directory
cp routes.json out/
cp vercel.json out/

# Create .nojekyll file to disable Jekyll processing on GitHub Pages
touch out/.nojekyll

# Success message
echo "Build completed successfully!"
