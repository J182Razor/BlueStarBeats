#!/bin/bash
# Commit all changes script

echo "📦 Staging all changes..."
git add -A

echo ""
echo "💾 Committing changes..."
git commit -m "Fix iOS compatibility, Capacitor errors, and iPhone XR support

- Fixed CAPInstanceDescriptor.h duplicate #ifndef error
- Added CDVScreenOrientationDelegate protocol import
- Suppressed WKProcessPool deprecation warnings
- Updated Info.plist for arm64 architecture (iPhone XR compatibility)
- Added safe area CSS support for iPhone XR notch
- Updated AppDelegate to use @main instead of @UIApplicationMain
- Enhanced viewport meta tag for mobile support
- Fixed CocoaPods build phase warnings
- Improved audio engine error handling
- Added canvas resize handling for mobile devices"

echo ""
echo "✅ Commit completed!"
echo ""
echo "To push: git push origin main"

