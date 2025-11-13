# Fix Sandbox Error for CocoaPods Frameworks

If you're getting this error:
```
[Sandbox: rsync(XXXXX) deny(1) file-write-create /Users/.../BlueStarBeats.app/Frameworks/Capacitor.framework/_CodeSignature]
```

## Solution Applied

The issue is that rsync is trying to copy `_CodeSignature` directories from frameworks, which Xcode's sandbox denies. We've implemented two fixes:

1. **Podfile post_install hook** - Automatically patches the Pods-generated framework script to exclude `_CodeSignature` from rsync operations. This runs every time you run `pod install`.

2. **Updated embed script** - The `embed_frameworks_temp.sh` script has been updated to exclude `_CodeSignature` directories.

## How to Apply the Fix

### Step 1: Run pod install

The Podfile now includes a post_install hook that automatically patches the Pods script. Run:

```bash
cd ios/App
pod install
```

This will regenerate the Pods script with the `_CodeSignature` filter applied.

### Step 2: Clean Build

After running `pod install`, clean your build:

1. In Xcode, select **Product → Clean Build Folder** (`Shift + Cmd + K`)
2. Or delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   ```

### Step 3: Rebuild

Re-open the workspace and build again. The sandbox error should be resolved.

## Manual Fix (If Needed)

If the post_install hook doesn't work or you need to manually patch the script, you can edit the Pods script directly:

1. Open the Pods script:
   ```bash
   open ios/App/Pods/Target\ Support\ Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh
   ```

2. Find all `rsync` commands that have `--filter` options

3. Add `--filter "- _CodeSignature"` after the last `--filter` option in each rsync command

   For example, change:
   ```bash
   rsync --delete -av ... --filter "- Modules" "${source}" "${destination}"
   ```
   
   To:
   ```bash
   rsync --delete -av ... --filter "- Modules" --filter "- _CodeSignature" "${source}" "${destination}"
   ```

## Alternative Solutions

If the error persists after applying the fix:

### Option 1: Disable User Script Sandboxing (Not Recommended for Production)

In Xcode:
1. Select your project in the navigator
2. Select the **BlueStarBeats** target
3. Go to **Build Settings**
4. Search for "User Script Sandboxing"
5. Set it to **No** for Debug configuration only

⚠️ **Warning:** Only disable for Debug builds, never for Release!

### Option 2: Full Clean and Reinstall

```bash
cd ios/App
rm -rf Pods Podfile.lock ~/Library/Developer/Xcode/DerivedData/App-*
export LANG=en_US.UTF-8
pod install
```

Then rebuild in Xcode.

## Troubleshooting PhaseScriptExecution Errors

If you get a "Command PhaseScriptExecution failed with a nonzero exit code" error:

**Most Common Cause:** The Pods directory doesn't exist or the Pods script is missing. Xcode is trying to run a script that doesn't exist.

### Quick Fix Script

Run the automated fix script:

```bash
./fix-phase-script-error.sh
```

This will:
1. Check if Pods are installed
2. Install Pods if missing
3. Verify the framework script exists
4. Patch the script if needed

### Manual Fix Steps

If the script doesn't work, follow these steps:

#### Step 1: Install Pods

The Pods directory and scripts must exist before building:

```bash
cd ios/App
pod install
```

**Important:** You must run `pod install` in the `ios/App` directory, not the root directory.

#### Step 2: Verify Pods Script Exists

Check if the script was created:

```bash
cd ios/App
ls -la "Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"
```

If this file doesn't exist, `pod install` didn't complete successfully. Check for errors in the pod install output.

#### Step 3: Verify Script Was Patched

Check if the Pods script has the _CodeSignature filter:

```bash
cd ios/App
grep "_CodeSignature" "Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"
```

You should see `--filter "- _CodeSignature"` in the rsync commands.

If not, run the manual patch:

```bash
cd ../..
./fix-pods-script.sh
```

#### Step 4: Clean Build

After fixing:

1. In Xcode: **Product → Clean Build Folder** (`Shift + Cmd + K`)
2. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   ```
3. Close and reopen Xcode workspace
4. Rebuild the project

### Common Issues

**Error: "Pods directory not found"**
- Run `pod install` in `ios/App` directory
- Make sure you're using the workspace (`.xcworkspace`), not the project (`.xcodeproj`)

**Error: "Script not found"**
- Pods weren't installed correctly
- Check `pod install` output for errors
- Try: `rm -rf Pods Podfile.lock && pod install`

**Error persists after pod install**
- The post_install hook may have failed silently
- Run `./fix-pods-script.sh` to manually patch
- Check Podfile syntax: `ruby -c ios/App/Podfile`

## Verification

After applying the fix, try building again. The sandbox error should be resolved because rsync will no longer attempt to copy `_CodeSignature` directories.
