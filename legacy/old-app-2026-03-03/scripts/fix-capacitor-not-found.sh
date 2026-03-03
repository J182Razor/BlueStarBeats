#!/bin/bash
# Comprehensive fix for "Capacitor not found" error in Xcode

set -e

echo "🔧 Fixing Capacitor 'not found' error in Xcode..."
echo ""

PROJECT_DIR="/Users/johnlawal/Desktop/2025 - 2026 Projects/BlueStarBeats"
IOS_DIR="$PROJECT_DIR/ios/App"

cd "$IOS_DIR"

# Step 1: Clean Xcode DerivedData
echo "1. Cleaning Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
echo "   ✓ DerivedData cleaned"

# Step 2: Clean Pods
echo "2. Cleaning CocoaPods..."
rm -rf Pods Podfile.lock .symlinks 2>/dev/null || true
echo "   ✓ Pods cleaned"

# Step 3: Reinstall Pods
echo "3. Reinstalling CocoaPods..."
export LANG=en_US.UTF-8
pod install
echo "   ✓ Pods reinstalled"

# Step 4: Verify Capacitor installation
echo "4. Verifying Capacitor installation..."
if [ -f "Pods/Target Support Files/Capacitor/Capacitor.debug.xcconfig" ]; then
    echo "   ✓ Capacitor configuration found"
else
    echo "   ✗ ERROR: Capacitor configuration not found!"
    exit 1
fi

if [ -f "Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats.debug.xcconfig" ]; then
    echo "   ✓ Pods-BlueStarBeats configuration found"
else
    echo "   ✗ ERROR: Pods-BlueStarBeats configuration not found!"
    exit 1
fi

# Step 5: Verify workspace
echo "5. Verifying workspace..."
if [ -f "App.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✓ App.xcworkspace exists"
else
    echo "   ✗ ERROR: App.xcworkspace not found!"
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📱 Next steps:"
echo "   1. Close Xcode completely (Quit the application)"
echo "   2. Open the WORKSPACE (not the project):"
echo "      open ios/App/App.xcworkspace"
echo "      OR run: npm run ios:open"
echo ""
echo "   3. In Xcode:"
echo "      - Verify you see 'BlueStarBeats' AND 'Pods' in the navigator"
echo "      - Product → Clean Build Folder (Shift + Cmd + K)"
echo "      - Build (Cmd + R)"
echo ""
echo "⚠️  CRITICAL: Always open .xcworkspace, NEVER .xcodeproj!"

