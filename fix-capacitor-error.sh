#!/bin/bash
# Script to fix Capacitor build errors by cleaning all caches

echo "🔧 Fixing Capacitor Build Errors..."
echo ""

# Step 1: Clean Xcode DerivedData
echo "1. Cleaning Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null
echo "   ✓ DerivedData cleaned"

# Step 2: Clean Pods
echo "2. Cleaning CocoaPods..."
cd ios/App
rm -rf Pods Podfile.lock .symlinks 2>/dev/null
echo "   ✓ Pods cleaned"

# Step 3: Reinstall Pods
echo "3. Reinstalling CocoaPods..."
export LANG=en_US.UTF-8
pod install
echo "   ✓ Pods reinstalled"

# Step 4: Verify CAPInstanceDescriptor.h is correct
echo "4. Verifying Capacitor header file..."
cd ../../node_modules/@capacitor/ios/Capacitor/Capacitor
if grep -q "^#ifndef CAPInstanceDescriptor_h$" CAPInstanceDescriptor.h && ! grep -q "^#ifndef CAPInstanceDescriptor_h$" CAPInstanceDescriptor.h | grep -c . | grep -q "^2$"; then
    echo "   ✓ Header file is correct"
else
    echo "   ⚠️  Fixing header file..."
    # Remove duplicate #ifndef if it exists
    sed -i '' '1,2{/^#ifndef CAPInstanceDescriptor_h$/d;}' CAPInstanceDescriptor.h
    sed -i '' '1i\
#ifndef CAPInstanceDescriptor_h
' CAPInstanceDescriptor.h
    echo "   ✓ Header file fixed"
fi

echo ""
echo "✅ Done! Now:"
echo "   1. Close Xcode completely"
echo "   2. Open: ios/App/App.xcworkspace"
echo "   3. Product → Clean Build Folder (Shift + Cmd + K)"
echo "   4. Build (Cmd + R)"

