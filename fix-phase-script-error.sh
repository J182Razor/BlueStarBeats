#!/bin/bash
# Fix PhaseScriptExecution error by ensuring Pods are installed and scripts are patched

set -e

IOS_DIR="ios/App"
cd "$IOS_DIR" || exit 1

echo "🔍 Diagnosing PhaseScriptExecution error..."
echo ""

# Check if Pods directory exists
if [ ! -d "Pods" ]; then
    echo "❌ Pods directory not found!"
    echo ""
    echo "📦 Installing Pods..."
    pod install
    echo ""
    echo "✅ Pods installed"
else
    echo "✓ Pods directory exists"
fi

echo ""

# Check if the frameworks script exists
PODS_SCRIPT="Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"
if [ ! -f "$PODS_SCRIPT" ]; then
    echo "❌ Pods framework script not found at: $PODS_SCRIPT"
    echo "   This means pod install didn't complete successfully"
    echo ""
    echo "🔄 Reinstalling Pods..."
    rm -rf Pods Podfile.lock
    pod install
    echo ""
else
    echo "✓ Pods framework script exists"
fi

echo ""

# Check if script has _CodeSignature filter
if [ -f "$PODS_SCRIPT" ]; then
    if grep -q "_CodeSignature" "$PODS_SCRIPT"; then
        echo "✓ Script already has _CodeSignature filter"
    else
        echo "⚠️  Script doesn't have _CodeSignature filter"
        echo "   Running manual patch..."
        cd ../..
        ./fix-pods-script.sh
        cd "$IOS_DIR"
    fi
fi

echo ""
echo "🧹 Cleaning build artifacts..."
echo "   Run in Xcode: Product → Clean Build Folder (Shift + Cmd + K)"
echo "   Or delete derived data: rm -rf ~/Library/Developer/Xcode/DerivedData/App-*"
echo ""
echo "✅ Setup complete! Try building again in Xcode."

