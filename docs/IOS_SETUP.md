# iOS Setup Guide

Complete guide for setting up and building the BlueStarBeats iOS app.

## Prerequisites

- macOS with Xcode 14+ installed
- Node.js 18+ and npm
- CocoaPods installed: `sudo gem install cocoapods`
- Xcode Command Line Tools: `xcode-select --install`

## Initial Setup

### 1. Install Dependencies

```bash
# Install npm dependencies
npm install

# Install iOS dependencies (CocoaPods)
cd ios/App
export LANG=en_US.UTF-8
pod install
cd ../..
```

### 2. Open Workspace

**IMPORTANT:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file:

```bash
open ios/App/BlueStarBeats.xcworkspace
```

## Building

### Development Build

```bash
npm run build
npm run ios:sync
```

Then build in Xcode (Cmd + B)

### Production Build

1. In Xcode, select the "Any iOS Device" target
2. Product → Archive
3. Distribute App

## Troubleshooting

### PhaseScriptExecution Errors

If you get "Command PhaseScriptExecution failed with a nonzero exit code":

1. **Run diagnostic script:**
   ```bash
   ./scripts/diagnose-build-error.sh
   ```

2. **Clean and rebuild:**
   ```bash
   ./scripts/clean-and-rebuild.sh
   ```

3. **Verify workspace:**
   - Make sure you're opening `BlueStarBeats.xcworkspace`
   - NOT `BlueStarBeats.xcodeproj`

### Sandbox Errors

If you get sandbox errors about `_CodeSignature`:

1. The fix is automatically applied via Podfile post_install hook
2. If needed, manually patch:
   ```bash
   ./scripts/fix-pods-script.sh
   ```

3. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions

### Pod Install Errors

If `pod install` fails:

1. **Encoding error:**
   ```bash
   export LANG=en_US.UTF-8
   pod install
   ```

2. **Missing node_modules:**
   ```bash
   npm install
   cd ios/App
   pod install
   ```

3. **Clean reinstall:**
   ```bash
   cd ios/App
   rm -rf Pods Podfile.lock
   pod install
   ```

## Simulator Setup

See [SIMULATOR.md](./SIMULATOR.md) for simulator setup and testing.

## Additional Resources

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [CAPACITOR.md](./CAPACITOR.md) - Capacitor-specific setup


