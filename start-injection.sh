#!/bin/bash
# Quick script to start InjectionIII with the correct workspace

WORKSPACE_PATH="$(cd "$(dirname "$0")" && pwd)/ios/App/App.xcworkspace"

if [ ! -d "$WORKSPACE_PATH" ]; then
    echo "❌ Workspace not found at: $WORKSPACE_PATH"
    exit 1
fi

echo "🚀 Starting InjectionIII with workspace..."
echo "   Workspace: $WORKSPACE_PATH"
echo ""

# Launch InjectionIII
open -a /Applications/InjectionIII.app

# Wait a moment for InjectionIII to launch
sleep 2

echo ""
echo "📋 In InjectionIII:"
echo "   1. Click 'Open Project' or 'Open Recent'"
echo "   2. Select: $WORKSPACE_PATH"
echo ""
echo "💡 Tip: After selecting the workspace, build and run your app in Xcode"
echo "   You should see '💉 InjectionIII connected' in the console"

