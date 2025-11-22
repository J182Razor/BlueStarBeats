#!/bin/bash

# Fix Sandbox Permissions Script
# This script addresses the "Sandbox: bash deny(1) file-read-data" error

set -e

echo "🔧 Fixing sandbox permissions and build configuration..."

# Change to the iOS App directory
cd "$(dirname "$0")"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/
rm -rf DerivedData/

# Ensure proper permissions for the Pods directory
if [ -d "Pods" ]; then
    echo "📁 Setting proper permissions for Pods directory..."
    chmod -R +r Pods/
    chmod +x Pods/Target\ Support\ Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh
fi

# Check if we need to reinstall pods
if [ ! -f "Podfile.lock" ] || [ ! -d "Pods" ]; then
    echo "📦 Reinstalling CocoaPods..."
    export LANG=en_US.UTF-8
    pod install --verbose
fi

# Verify the framework script exists and is executable
FRAMEWORK_SCRIPT="Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"
if [ -f "$FRAMEWORK_SCRIPT" ]; then
    echo "✅ Framework script found: $FRAMEWORK_SCRIPT"
    ls -la "$FRAMEWORK_SCRIPT"
else
    echo "❌ Framework script not found: $FRAMEWORK_SCRIPT"
fi

echo "🎉 Sandbox permissions fix complete!"
echo "💡 Next steps:"
echo "   1. Open BlueStarBeats.xcworkspace in Xcode"
echo "   2. Clean build folder (Product → Clean Build Folder)"
echo "   3. Build the project"

