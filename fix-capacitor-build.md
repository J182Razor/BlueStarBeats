# Fix Capacitor Build Errors

The build error is caused by Xcode using cached build artifacts. Follow these steps:

## Step 1: Clean Xcode Build Cache

In Xcode:
1. **Product → Clean Build Folder** (Shift + Cmd + K)
2. Close Xcode completely

## Step 2: Clean Derived Data

Run in Terminal:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

## Step 3: Reinstall Capacitor Dependencies

```bash
cd "/Users/johnlawal/Desktop/2025 - 2026 Projects/BlueStarBeats"
npm install
```

## Step 4: Clean and Reinstall Pods

```bash
cd ios/App
rm -rf Pods Podfile.lock .symlinks
export LANG=en_US.UTF-8
pod install
```

## Step 5: Reopen and Build

1. Open Xcode: `npm run ios:open`
2. **Product → Clean Build Folder** again (Shift + Cmd + K)
3. Build: Press Cmd + R

## Alternative: Reinstall All Dependencies

If the above doesn't work:
```bash
cd "/Users/johnlawal/Desktop/2025 - 2026 Projects/BlueStarBeats"
rm -rf node_modules package-lock.json
npm install
cd ios/App
rm -rf Pods Podfile.lock
pod install
```

