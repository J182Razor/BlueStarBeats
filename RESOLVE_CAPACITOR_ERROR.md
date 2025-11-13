# Resolve "Capacitor Not Found" Error in Xcode

## Quick Fix (Run in Terminal)

```bash
cd "/Users/johnlawal/Desktop/2025 - 2026 Projects/BlueStarBeats/ios/App"

# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf Pods Podfile.lock .symlinks

# Reinstall Pods
export LANG=en_US.UTF-8
pod install

# Open workspace (NOT project!)
open App.xcworkspace
```

## Most Common Cause

**Opening `.xcodeproj` instead of `.xcworkspace`**

CocoaPods requires you to open the **workspace** file, not the project file.

### ✅ CORRECT:
- Open: `ios/App/App.xcworkspace`
- Or run: `npm run ios:open`

### ❌ WRONG:
- Opening: `ios/App/BlueStarBeats.xcodeproj`

## Verification in Xcode

When you open the workspace, you should see in the Project Navigator:
- 📁 BlueStarBeats (your app)
- 📁 Pods (CocoaPods dependencies)
  - 📁 Capacitor
  - 📁 CapacitorCordova
  - 📁 CapacitorSplashScreen

If you only see "BlueStarBeats" and no "Pods", you opened the wrong file!

## Build Settings Check

1. Select **BlueStarBeats** target
2. Go to **Build Settings**
3. Search for "Configuration Files"
4. Should show:
   - `Pods-BlueStarBeats.debug.xcconfig`
   - `Pods-BlueStarBeats.release.xcconfig`

If these are missing, the Pods configuration isn't being used.

## After Fixing

1. **Clean Build Folder**: Product → Clean Build Folder (Shift + Cmd + K)
2. **Build**: Press Cmd + R
3. The "Capacitor not found" error should be resolved

## Still Not Working?

Try the automated fix script:
```bash
chmod +x fix-capacitor-not-found.sh
./fix-capacitor-not-found.sh
```

