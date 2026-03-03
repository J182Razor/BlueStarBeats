#!/bin/bash
# Complete cleanup and rebuild to resolve PhaseScriptExecution error

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_DIR="$SCRIPT_DIR/ios/App"

echo "🧹 Complete cleanup and rebuild for BlueStarBeats iOS app"
echo ""
echo "This will:"
echo "  1. Clean all build artifacts"
echo "  2. Remove and reinstall Pods"
echo "  3. Verify the _CodeSignature fix is applied"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 1
fi

echo ""
echo "Step 1: Cleaning DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/App-* 2>/dev/null || true
echo "   ✓ DerivedData cleaned"
echo ""

echo "Step 2: Removing Pods..."
cd "$IOS_DIR"
rm -rf Pods Podfile.lock
echo "   ✓ Pods removed"
echo ""

echo "Step 3: Installing Pods..."
export LANG=en_US.UTF-8
pod install
echo "   ✓ Pods installed"
echo ""

echo "Step 4: Verifying _CodeSignature filter..."
if grep -q "_CodeSignature" "Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"; then
    echo "   ✓ _CodeSignature filter is present"
else
    echo "   ⚠️  _CodeSignature filter missing, applying manual patch..."
    cd "$SCRIPT_DIR"
    ./fix-pods-script.sh
    cd "$IOS_DIR"
fi
echo ""

echo "✅ Cleanup and rebuild complete!"
echo ""
echo "📱 Next steps in Xcode:"
echo ""
echo "  1. CLOSE Xcode completely (Cmd + Q)"
echo ""
echo "  2. Open the WORKSPACE file (important!):"
echo "     open '$IOS_DIR/BlueStarBeats.xcworkspace'"
echo ""
echo "  3. In Xcode, go to Product → Clean Build Folder (Shift + Cmd + K)"
echo ""
echo "  4. Build the project (Cmd + B)"
echo ""
echo "⚠️  IMPORTANT: You MUST open BlueStarBeats.xcworkspace, NOT BlueStarBeats.xcodeproj"
echo ""
echo "If the error persists, check the exact error message in Xcode's build log"
echo "to see which specific script phase is failing."
echo ""

