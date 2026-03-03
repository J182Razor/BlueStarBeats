# Embed Pods Frameworks Script Setup

## Overview

The `embed-pods-frameworks.sh` script is a wrapper that works around Xcode's sandbox restrictions when accessing CocoaPods framework scripts. It's designed to work even with paths containing spaces.

## Features

- ✅ Uses absolute paths to avoid sandbox issues
- ✅ Changes directory before execution to handle paths with spaces
- ✅ Comprehensive error handling
- ✅ Works with Xcode's sandbox restrictions
- ✅ Automatically makes target script executable

## Quick Setup

Run the setup script:

```bash
chmod +x setup-embed-script.sh
./setup-embed-script.sh
```

Or manually:

```bash
chmod +x ios/App/embed-pods-frameworks.sh
xattr -c ios/App/embed-pods-frameworks.sh
```

## Xcode Full Disk Access

For the script to work properly, Xcode needs Full Disk Access:

1. Open **System Settings** (or System Preferences on older macOS)
2. Go to **Privacy & Security** → **Full Disk Access**
3. Click the **+** button
4. Navigate to `/Applications/Xcode.app` and add it
5. Ensure the checkbox next to Xcode is **enabled**
6. **Restart Xcode** after granting access

## How It Works

1. The script receives `SRCROOT` from Xcode's build environment
2. It resolves absolute paths to avoid relative path issues
3. It changes into the Pods script directory before execution
4. This avoids sandbox restrictions on paths containing spaces
5. It executes the CocoaPods framework embedding script

## Build Phase Configuration

The script is already configured in Xcode's build phases:
- **Build Phase**: `[CP] Embed Pods Frameworks`
- **Script**: `bash "${SRCROOT}/embed-pods-frameworks.sh"`

## Troubleshooting

### Error: "Sandbox: bash deny file-read-data"

1. Ensure Xcode has Full Disk Access (see above)
2. Close Xcode completely and reopen
3. Clean build folder: Product → Clean Build Folder (Shift + Cmd + K)
4. Try building again

### Error: "Script not found"

1. Verify the script exists: `ls -la ios/App/embed-pods-frameworks.sh`
2. Ensure it's executable: `chmod +x ios/App/embed-pods-frameworks.sh`
3. Run `pod install` in `ios/App` directory

### Error: "Pods directory not found"

1. Run `pod install` in the `ios/App` directory:
   ```bash
   cd ios/App
   pod install
   ```

## Verification

After setup, verify the script works:

```bash
# Check script exists and is executable
ls -lh ios/App/embed-pods-frameworks.sh

# Test script syntax
bash -n ios/App/embed-pods-frameworks.sh
```

If both commands succeed, the script is ready to use.

