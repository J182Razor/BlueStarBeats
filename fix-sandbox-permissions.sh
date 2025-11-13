#!/bin/bash
# Fix permissions and attributes for Pods scripts to resolve sandbox errors

set -e

PROJECT_DIR="/Users/johnlawal/Desktop/2025 - 2026 Projects/BlueStarBeats"
IOS_DIR="$PROJECT_DIR/ios/App"
PODS_SCRIPT="$IOS_DIR/Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"
WRAPPER_SCRIPT="$IOS_DIR/embed-pods-frameworks.sh"

echo "🔧 Fixing sandbox permissions for Pods scripts..."
echo ""

# Fix wrapper script
if [ -f "$WRAPPER_SCRIPT" ]; then
    echo "1. Setting permissions for wrapper script..."
    chmod +x "$WRAPPER_SCRIPT"
    xattr -c "$WRAPPER_SCRIPT" 2>/dev/null || true
    echo "   ✓ Wrapper script permissions set"
else
    echo "   ✗ Wrapper script not found at $WRAPPER_SCRIPT"
fi

# Fix Pods script
if [ -f "$PODS_SCRIPT" ]; then
    echo "2. Setting permissions for Pods script..."
    chmod +x "$PODS_SCRIPT"
    xattr -c "$PODS_SCRIPT" 2>/dev/null || true
    echo "   ✓ Pods script permissions set"
else
    echo "   ⚠ Pods script not found (this is OK if pods haven't been installed yet)"
fi

echo ""
echo "✅ Permissions fixed!"
echo ""
echo "📱 Next steps:"
echo "   1. Close Xcode completely"
echo "   2. Open workspace: open ios/App/App.xcworkspace"
echo "   3. Clean Build Folder (Shift + Cmd + K)"
echo "   4. Build (Cmd + B)"
echo ""
echo "⚠️  If the error persists, ensure Xcode has Full Disk Access:"
echo "   System Settings → Privacy & Security → Full Disk Access → Add Xcode.app"

