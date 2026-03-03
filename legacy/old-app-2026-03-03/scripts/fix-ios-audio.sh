#!/bin/bash

# scripts/fix-ios-audio.sh
# Fixes iOS Audio Configuration

echo "🔧 Fixing iOS Audio Configuration..."

# Navigate to iOS App directory
cd "$(dirname "$0")/../ios/App" || exit 1

# Update iOS project settings
echo "📦 Installing/updating CocoaPods dependencies..."
pod install --repo-update

# Check for required background modes in Info.plist
if ! grep -q "<string>audio</string>" App/Info.plist; then
  echo "⚠️  Warning: Background audio mode not found in Info.plist"
  echo "   Please ensure UIBackgroundModes includes 'audio' in Xcode"
  echo "   Steps:"
  echo "   1. Open BlueStarBeats.xcworkspace in Xcode"
  echo "   2. Select App target > Signing & Capabilities"
  echo "   3. Add 'Background Modes' capability"
  echo "   4. Enable 'Audio, AirPlay, and Picture in Picture'"
else
  echo "✅ Background audio mode found in Info.plist"
fi

# Check for microphone usage description
if ! grep -q "NSMicrophoneUsageDescription" App/Info.plist; then
  echo "⚠️  Warning: NSMicrophoneUsageDescription not found in Info.plist"
  echo "   This is optional but recommended for future features"
else
  echo "✅ Microphone usage description found in Info.plist"
fi

echo ""
echo "✅ iOS audio configuration check complete."
echo "📱 Please rebuild the iOS project in Xcode:"
echo "   1. Open ios/App/BlueStarBeats.xcworkspace"
echo "   2. Product > Clean Build Folder (Shift + Cmd + K)"
echo "   3. Product > Build (Cmd + B)"
echo ""

