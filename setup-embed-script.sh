#!/bin/bash
# Setup script for embed-pods-frameworks.sh
# This ensures proper permissions and verifies the script is ready for Xcode

set -e

PROJECT_DIR="/Users/johnlawal/Desktop/2025 - 2026 Projects/BlueStarBeats"
SCRIPT_PATH="$PROJECT_DIR/ios/App/embed-pods-frameworks.sh"

echo "🔧 Setting up embed-pods-frameworks.sh for Xcode..."
echo ""

# Check if script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: Script not found at $SCRIPT_PATH"
    exit 1
fi

# Make script executable
echo "1. Setting execute permissions..."
chmod +x "$SCRIPT_PATH"
echo "   ✓ Execute permissions set"

# Remove extended attributes that might cause sandbox issues
echo "2. Removing extended attributes..."
xattr -c "$SCRIPT_PATH" 2>/dev/null || true
echo "   ✓ Extended attributes removed"

# Verify script syntax
echo "3. Verifying script syntax..."
if bash -n "$SCRIPT_PATH" 2>/dev/null; then
    echo "   ✓ Script syntax is valid"
else
    echo "   ❌ Script syntax error!"
    bash -n "$SCRIPT_PATH"
    exit 1
fi

# Display script info
echo ""
echo "📄 Script Information:"
ls -lh "$SCRIPT_PATH"
echo ""

echo "✅ Script is ready for Xcode!"
echo ""
echo "📱 Next steps:"
echo "   1. Ensure Xcode has Full Disk Access:"
echo "      System Settings → Privacy & Security → Full Disk Access"
echo "      → Add Xcode.app (if not already added)"
echo ""
echo "   2. Close Xcode completely (if open)"
echo ""
echo "   3. Open workspace:"
echo "      open ios/App/App.xcworkspace"
echo ""
echo "   4. Clean and build:"
echo "      Product → Clean Build Folder (Shift + Cmd + K)"
echo "      Product → Build (Cmd + B)"

