#!/bin/bash

# Install dependencies with legacy-peer-deps
npm install --legacy-peer-deps

# Run the build
npm run build

# Copy routes.json to the output directory
cp routes.json out/

# Success message
echo "Build completed successfully!"
