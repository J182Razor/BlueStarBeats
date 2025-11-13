# Setup iOS Simulator for BlueStarBeats

## Problem
"No supported iOS devices are available. Connect a device to run your application or choose a simulated device as the destination."

## Solution

### Option 1: Select a Simulator in Xcode (Easiest)

1. **Open Xcode** with your workspace:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. **Look at the top toolbar** in Xcode, next to the Play/Stop buttons
   - You should see a device selector (e.g., "iPhone 15 Pro" or "Any iOS Device")

3. **Click the device selector** and choose:
   - **iPhone 15 Pro** (recommended for iPhone XR compatibility)
   - **iPhone 14 Pro**
   - **iPhone 13 Pro**
   - Or any iPhone simulator that supports iOS 14.0+

4. **If no simulators appear**, continue to Option 2

### Option 2: Download iOS Simulators

1. In Xcode, go to **Xcode → Settings** (or **Preferences** on older versions)
2. Click the **Platforms** (or **Components**) tab
3. You'll see a list of available iOS simulators
4. Click the **+** button or **Download** next to:
   - **iOS 17.x** (recommended)
   - **iOS 16.x**
   - **iOS 15.x**
5. Wait for the download to complete (this may take several minutes)

### Option 3: Use Command Line to List Available Simulators

Run this command in Terminal to see what simulators you have:

```bash
xcrun simctl list devices available
```

This will show all available iOS simulators. If the list is empty, you need to download simulators (Option 2).

### Option 4: Create a Specific Simulator (iPhone XR)

If you want to test specifically on iPhone XR:

1. In Xcode, go to **Window → Devices and Simulators**
2. Click the **+** button in the bottom left
3. Choose:
   - **Device Type**: iPhone XR
   - **OS Version**: iOS 14.0 or later (download if needed)
4. Click **Create**

### Option 5: Use Physical iPhone

If you have an iPhone XR or any iPhone:

1. **Connect your iPhone** to your Mac via USB
2. **Unlock your iPhone** and trust the computer if prompted
3. In Xcode, the device selector should show your iPhone
4. Select your iPhone from the device list
5. You may need to:
   - Sign in with your Apple ID in Xcode
   - Enable Developer Mode on your iPhone (Settings → Privacy & Security → Developer Mode)

## Quick Fix Script

Run this to check your simulator setup:

```bash
# List available simulators
xcrun simctl list devices available | grep -i "iphone"

# Boot a simulator (if available)
xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || echo "Simulator not available"
```

## Verification

After selecting a simulator:

1. The device selector in Xcode should show the simulator name
2. Click **Run** (Cmd + R) or the Play button
3. The simulator should launch and your app should build and run

## Troubleshooting

### "No simulators available"
- Download simulators via Xcode → Settings → Platforms
- Or install Xcode Command Line Tools: `xcode-select --install`

### "Simulator won't boot"
- Close all simulators
- Reset: `xcrun simctl shutdown all`
- Try booting again

### "Code signing error"
- Go to Signing & Capabilities in Xcode
- Select "Automatically manage signing"
- Choose your Apple ID team

## Recommended Simulator for iPhone XR Testing

- **iPhone 15 Pro** (closest to XR in terms of screen size and capabilities)
- **iPhone 14** 
- **iPhone 13**

All of these support iOS 14.0+ and will work with your app.

