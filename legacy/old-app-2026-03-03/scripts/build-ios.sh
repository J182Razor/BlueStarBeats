#!/bin/bash
# Build script for iOS app

echo "Building web application..."
npm run build

echo "Syncing with Capacitor..."
npm run ios:sync

echo "Opening Xcode..."
npm run ios:open

echo "Done! Xcode should now be opening with your project."
echo "In Xcode:"
echo "1. Select iPhone XR simulator or your device"
echo "2. Click the Play button (▶️) or press Cmd + R to build and run"

