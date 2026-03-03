# Troubleshooting Guide

Common issues and solutions for BlueStarBeats development.

## Build Errors

### PhaseScriptExecution Failed

**Symptom:** `Command PhaseScriptExecution failed with a nonzero exit code`

**Solutions:**

1. **Diagnose the issue:**
   ```bash
   ./scripts/diagnose-build-error.sh
   ```

2. **Clean and rebuild:**
   ```bash
   ./scripts/clean-and-rebuild.sh
   ```

3. **Verify workspace:**
   - Open `ios/App/BlueStarBeats.xcworkspace` (NOT `.xcodeproj`)
   - Close Xcode completely before reopening

4. **Check build log:**
   - Look at the exact error message in Xcode's build log
   - It will tell you which script phase failed

### Sandbox Error: _CodeSignature

**Symptom:** `[Sandbox: rsync(XXXXX) deny(1) file-write-create .../_CodeSignature]`

**Root Cause:** Xcode's sandbox denies file-write-create operations for `_CodeSignature` directories when rsync tries to copy them from frameworks.

**Solution:**

The fix is automatically applied via Podfile post_install hook. If it persists:

1. **Manual patch:**
   ```bash
   ./scripts/fix-pods-script.sh
   ```

2. **Clean build:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   ```
   Then in Xcode: Product → Clean Build Folder (Shift + Cmd + K)

3. **Reinstall Pods:**
   ```bash
   cd ios/App
   rm -rf Pods Podfile.lock
   export LANG=en_US.UTF-8
   pod install
   ```

**How the Fix Works:**

The Podfile includes a `post_install` hook that automatically patches the Pods-generated framework script to add `--filter "- _CodeSignature"` to all rsync commands. This prevents rsync from attempting to copy `_CodeSignature` directories, which resolves the sandbox error.

**Verification:**

After running `pod install`, verify the fix:
```bash
cd ios/App
grep "_CodeSignature" "Pods/Target Support Files/Pods-BlueStarBeats/Pods-BlueStarBeats-frameworks.sh"
```

You should see `--filter "- _CodeSignature"` in the rsync commands.

### Capacitor Not Found

**Symptom:** `Cannot find module '@capacitor/core'` or similar

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   npm install
   npm run ios:sync
   ```

2. **Check node_modules:**
   ```bash
   ls node_modules/@capacitor
   ```
   If missing, run `npm install` again

3. **Verify Capacitor sync:**
   ```bash
   npm run ios:sync
   ```

## Pod Install Errors

### Encoding Error

**Symptom:** `Unicode Normalization not appropriate for ASCII-8BIT`

**Solution:**
```bash
export LANG=en_US.UTF-8
cd ios/App
pod install
```

### Missing Pods_helpers

**Symptom:** `cannot load such file -- .../pods_helpers`

**Solution:**
```bash
# Install npm dependencies first
npm install
cd ios/App
pod install
```

### Podfile.lock Mismatch

**Symptom:** `The sandbox is not in sync with the Podfile.lock`

**Solution:**
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install
```

## Audio Issues

### Audio Not Playing

1. Check browser console for errors
2. Ensure Web Audio API is supported
3. Try clicking play to resume audio context
4. Check browser permissions for audio

### Headphones Not Working

- Binaural beats require stereo headphones
- Check system audio settings
- Ensure headphones are properly connected

## Performance Issues

1. Close other browser tabs
2. Disable browser extensions
3. Use a modern browser (Chrome, Firefox, Edge, Safari)
4. Check for memory leaks in browser DevTools

## Getting Help

1. Check the build log in Xcode for specific error messages
2. Run diagnostic scripts: `./scripts/diagnose-build-error.sh`
3. Check documentation in `docs/` directory
4. Review GitHub issues (if applicable)

