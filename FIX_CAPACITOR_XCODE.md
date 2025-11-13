# Fix "Capacitor Not Found" Error in Xcode

## The Problem
Xcode can't find Capacitor framework during build. This usually happens when:
1. Opening `.xcodeproj` instead of `.xcworkspace`
2. Pods not properly installed
3. Build cache issues

## Solution Steps

### Step 1: Clean Everything
```bash
cd "/Users/johnlawal/Desktop/2025 - 2026 Projects/BlueStarBeats/ios/App"

# Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean Pods
rm -rf Pods Podfile.lock .symlinks
```

### Step 2: Reinstall Pods
```bash
export LANG=en_US.UTF-8
pod install
```

### Step 3: Verify Installation
Check that these files exist:
- `Pods/Target Support Files/Capacitor/Capacitor.debug.xcconfig`
- `Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats.debug.xcconfig`

### Step 4: Open Correct Workspace
**CRITICAL**: Always open `App.xcworkspace`, NOT `BlueStarBeats.xcodeproj`

```bash
open ios/App/App.xcworkspace
```

Or use:
```bash
npm run ios:open
```

### Step 5: In Xcode

1. **Verify Workspace**: Check that you see both:
   - `BlueStarBeats` project
   - `Pods` project

2. **Clean Build Folder**: 
   - Product → Clean Build Folder (Shift + Cmd + K)

3. **Check Build Settings**:
   - Select `BlueStarBeats` target
   - Go to Build Settings
   - Search for "Configuration Files"
   - Should see: `Pods-BlueStarBeats.debug.xcconfig` and `Pods-BlueStarBeats.release.xcconfig`

4. **Check Framework Search Paths**:
   - Search for "Framework Search Paths"
   - Should include: `$(inherited)` and Pods paths

5. **Build**: Press Cmd + R

## Common Issues

### Issue: "No such module 'Capacitor'"
**Fix**: Make sure you opened `.xcworkspace`, not `.xcodeproj`

### Issue: Pods not found
**Fix**: Run `pod install` in `ios/App` directory

### Issue: Build settings not applied
**Fix**: The project should have `baseConfigurationReference` pointing to Pods xcconfig files

## Verification

After following these steps, the build should succeed. The Capacitor framework will be:
- Found in Pods
- Linked via Pods_BlueStarBeats.framework
- Available for import in Swift files

