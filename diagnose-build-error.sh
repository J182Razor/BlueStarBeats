#!/bin/bash
# Diagnose PhaseScriptExecution error in detail

echo "🔍 Diagnosing PhaseScriptExecution error..."
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/ios/App" || exit 1

# Check workspace exists
echo "1. Checking workspace file:"
if [ -f "BlueStarBeats.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✓ Workspace file exists"
else
    echo "   ❌ Workspace file missing!"
fi
echo ""

# Check Pods
echo "2. Checking Pods:"
if [ -d "Pods" ]; then
    echo "   ✓ Pods directory exists"
    
    # Check framework script
    if [ -f "Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh" ]; then
        echo "   ✓ Framework script exists"
        
        # Check for _CodeSignature filter
        if grep -q "_CodeSignature" "Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"; then
            echo "   ✓ Script has _CodeSignature filter"
        else
            echo "   ❌ Script missing _CodeSignature filter"
        fi
    else
        echo "   ❌ Framework script missing"
    fi
else
    echo "   ❌ Pods directory missing"
fi
echo ""

# Check for common issues
echo "3. Checking for common issues:"

# Check if using project instead of workspace
echo "   ⚠️  Make sure you're opening BlueStarBeats.xcworkspace, NOT BlueStarBeats.xcodeproj"
echo ""

# Check Podfile.lock
if [ -f "Podfile.lock" ]; then
    echo "   ✓ Podfile.lock exists"
else
    echo "   ❌ Podfile.lock missing - run 'pod install'"
fi
echo ""

# Check manifest lock
if [ -f "Pods/Manifest.lock" ]; then
    echo "   ✓ Pods/Manifest.lock exists"
    
    # Compare Podfile.lock and Manifest.lock
    if diff -q Podfile.lock Pods/Manifest.lock > /dev/null 2>&1; then
        echo "   ✓ Podfile.lock and Manifest.lock match"
    else
        echo "   ⚠️  Podfile.lock and Manifest.lock don't match - run 'pod install'"
    fi
else
    echo "   ❌ Pods/Manifest.lock missing"
fi
echo ""

echo "4. Suggested fixes:"
echo ""
echo "   If PhaseScriptExecution error persists:"
echo ""
echo "   A. Clean everything:"
echo "      cd ios/App"
echo "      rm -rf Pods Podfile.lock ~/Library/Developer/Xcode/DerivedData/App-*"
echo "      export LANG=en_US.UTF-8"
echo "      pod install"
echo ""
echo "   B. In Xcode:"
echo "      - Close Xcode completely"
echo "      - Open BlueStarBeats.xcworkspace (NOT .xcodeproj)"
echo "      - Product → Clean Build Folder (Shift + Cmd + K)"
echo "      - Try building again"
echo ""
echo "   C. Check build errors in Xcode:"
echo "      - Look at the exact error message in Xcode's build log"
echo "      - The error will tell you which script phase failed"
echo "      - Common failures:"
echo "        * [CP] Check Pods Manifest.lock - run 'pod install'"
echo "        * [CP] Embed Pods Frameworks - sandbox/permissions issue"
echo ""

