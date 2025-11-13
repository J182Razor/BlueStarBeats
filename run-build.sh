#!/bin/bash
# Build and sync script for Blue Star Beats iOS app

echo "🔍 Running linter..."
npm run lint

echo ""
echo "🏗️  Building web application..."
npm run build

echo ""
echo "🔄 Syncing with iOS..."
npm run ios:sync

echo ""
echo "📱 Opening in Xcode..."
npm run ios:open

echo ""
echo "✅ Done! Xcode should now be opening."
echo ""
echo "Next steps in Xcode:"
echo "1. Select iPhone XR simulator or your device"
echo "2. Product → Clean Build Folder (Shift + Cmd + K)"
echo "3. Build and Run (Cmd + R)"

