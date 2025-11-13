#!/bin/bash
# Setup script for InjectionIII hot reloading

set -e

echo "🔧 Setting up InjectionIII for Hot Reloading..."
echo ""

# Check if InjectionIII is already installed
if [ -d "/Applications/InjectionIII.app" ]; then
    echo "✅ InjectionIII is already installed at /Applications/InjectionIII.app"
else
    echo "📦 Installing InjectionIII..."
    
    # Check if we have the downloaded app
    if [ -d "/tmp/InjectionIII.app" ]; then
        # Try to copy without sudo first
        if cp -R /tmp/InjectionIII.app /Applications/ 2>/dev/null; then
            echo "✅ InjectionIII installed successfully!"
        else
            echo "⚠️  Need administrator privileges to install to /Applications/"
            echo "   Please run: sudo cp -R /tmp/InjectionIII.app /Applications/"
            echo "   Or manually drag InjectionIII.app from /tmp to /Applications/"
            exit 1
        fi
    else
        echo "❌ InjectionIII.app not found in /tmp"
        echo "   Downloading from GitHub..."
        cd /tmp
        curl -L -o InjectionIII.zip "https://github.com/johnno1962/InjectionIII/releases/latest/download/InjectionIII.app.zip"
        unzip -q -o InjectionIII.zip
        if cp -R InjectionIII.app /Applications/ 2>/dev/null; then
            echo "✅ InjectionIII installed successfully!"
        else
            echo "⚠️  Need administrator privileges. Please run:"
            echo "   sudo cp -R /tmp/InjectionIII.app /Applications/"
            exit 1
        fi
    fi
fi

# Verify Xcode location
if [ -d "/Applications/Xcode.app" ]; then
    echo "✅ Xcode found at default location: /Applications/Xcode.app"
else
    echo "⚠️  Warning: Xcode not found at /Applications/Xcode.app"
    echo "   InjectionIII may not work correctly if Xcode is in a different location"
fi

# Find workspace file
WORKSPACE_PATH=""
if [ -f "ios/App/App.xcworkspace/contents.xcworkspacedata" ]; then
    WORKSPACE_PATH="$(pwd)/ios/App/App.xcworkspace"
    echo "✅ Found workspace: $WORKSPACE_PATH"
elif [ -f "ios/App/BlueStarBeats.xcworkspace/contents.xcworkspacedata" ]; then
    WORKSPACE_PATH="$(pwd)/ios/App/BlueStarBeats.xcworkspace"
    echo "✅ Found workspace: $WORKSPACE_PATH"
else
    echo "❌ Could not find workspace file"
    exit 1
fi

echo ""
echo "🚀 Launching InjectionIII..."
open -a /Applications/InjectionIII.app

echo ""
echo "📋 Next steps:"
echo "   1. In InjectionIII, click 'Open Project' or 'Open Recent'"
echo "   2. Select this workspace file:"
echo "      $WORKSPACE_PATH"
echo "   3. Build and run your app in Xcode (Cmd + R)"
echo "   4. Look for this message in Xcode console:"
echo "      💉 InjectionIII connected"
echo ""
echo "✨ Setup complete! You can now use hot reloading in your iOS app."

