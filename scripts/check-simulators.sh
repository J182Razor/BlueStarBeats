#!/bin/bash
# Check available iOS simulators and help set one up

echo "📱 Checking iOS Simulators..."
echo ""

# Check if xcodebuild is available
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode Command Line Tools not found!"
    echo "   Install with: xcode-select --install"
    exit 1
fi

# List available simulators
echo "Available iOS Simulators:"
echo "------------------------"
xcrun simctl list devices available | grep -i "iphone" | head -20

echo ""
echo "Booted Simulators:"
echo "------------------"
xcrun simctl list devices | grep -i "booted" || echo "No simulators currently booted"

echo ""
echo "📋 Recommendations:"
echo "   1. Open Xcode → Window → Devices and Simulators"
echo "   2. Or in Xcode, click the device selector (top toolbar)"
echo "   3. Choose an iPhone simulator (iPhone 15 Pro recommended)"
echo ""
echo "💡 If no simulators appear, download them:"
echo "   Xcode → Settings → Platforms → Download iOS Simulator"

