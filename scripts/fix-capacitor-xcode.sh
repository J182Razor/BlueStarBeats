#!/bin/bash
# Fix Capacitor not found in Xcode build

echo "🔧 Fixing Capacitor build issues in Xcode..."
echo ""

# Step 1: Clean everything
echo "1. Cleaning build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null
cd ios/App
rm -rf Pods Podfile.lock .symlinks 2>/dev/null

# Step 2: Reinstall Pods
echo "2. Reinstalling CocoaPods..."
export LANG=en_US.UTF-8
pod install

# Step 3: Verify Capacitor is installed
echo "3. Verifying Capacitor installation..."
if [ -d "Pods/Capacitor" ] || [ -f "Pods/Target Support Files/Capacitor/Capacitor.debug.xcconfig" ]; then
    echo "   ✓ Capacitor is installed"
else
    echo "   ✗ ERROR: Capacitor not found in Pods!"
    exit 1
fi

echo ""
echo "✅ Done! Now:"
echo "   1. Close Xcode completely"
echo "   2. Open: ios/App/App.xcworkspace (NOT .xcodeproj)"
echo "   3. Product → Clean Build Folder (Shift + Cmd + K)"
echo "   4. Build (Cmd + R)"
echo ""
echo "⚠️  IMPORTANT: Always open .xcworkspace, never .xcodeproj!"

