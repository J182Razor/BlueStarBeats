# iOS Setup Guide - Blue Star Beats

This guide will help you set up, build, and deploy the Blue Star Beats iOS app.

## Prerequisites

### Required Software

1. **macOS** (Required for iOS development)
   - macOS 12.0 (Monterey) or later
   - Xcode 14.0 or later

2. **Xcode** (Download from Mac App Store)
   - Install Xcode Command Line Tools: `xcode-select --install`
   - Open Xcode and accept the license agreement
   - Install additional components when prompted

3. **CocoaPods** (Dependency manager for iOS)
   ```bash
   sudo gem install cocoapods
   ```

4. **Node.js** (Already installed for web development)
   - Node.js 18+ and npm

5. **Apple Developer Account** (For device testing and App Store)
   - Free account for device testing
   - Paid account ($99/year) for App Store distribution

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

```bash
npm run build
```

### 3. Sync with iOS

```bash
npm run ios:sync
```

This copies your web assets to the iOS project.

## Development Workflow

### Opening in Xcode

```bash
npm run ios:open
```

This will:
- Build the web app
- Sync assets to iOS
- Open the project in Xcode

### Building and Running

1. **Open in Xcode:**
   ```bash
   npm run ios:open
   ```

2. **In Xcode:**
   - Select a simulator or connected device
   - Click the "Play" button (▶️) or press `Cmd + R`
   - The app will build and launch

### Quick Build and Open

```bash
npm run ios:run
```

This combines build, sync, and open in one command.

## iOS-Specific Configuration

### App Icon

1. Open `ios/App/App/Assets.xcassets/AppIcon.appiconset`
2. Replace the placeholder icons with your app icons
3. Required sizes:
   - 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### Splash Screen

The splash screen is configured in `capacitor.config.ts`:
- Background color: `#1c1c3c` (matches app theme)
- Auto-hide after 2 seconds
- No spinner

### Info.plist Configuration

Location: `ios/App/App/Info.plist`

Key configurations:
- **Bundle Identifier:** `com.bluestarbeats.app`
- **Display Name:** Blue Star Beats
- **Supported Interface Orientations:** Portrait (recommended)

### Audio Permissions

iOS requires explicit permission for audio playback. The app uses Web Audio API which works automatically, but you may want to add background audio capability:

1. In Xcode, go to **Signing & Capabilities**
2. Add **Background Modes**
3. Enable **Audio, AirPlay, and Picture in Picture**

## Testing on Device

### 1. Connect Your iPhone/iPad

1. Connect device via USB
2. Unlock device and trust computer if prompted
3. In Xcode, select your device from the device list

### 2. Configure Signing

1. In Xcode, select the **App** target
2. Go to **Signing & Capabilities**
3. Select your **Team** (Apple Developer account)
4. Xcode will automatically create a provisioning profile

### 3. Build and Run

1. Select your device in Xcode
2. Click **Play** or press `Cmd + R`
3. On first run, go to **Settings > General > VPN & Device Management**
4. Trust your developer certificate

## Building for App Store

### 1. Update Version and Build Number

In Xcode:
1. Select the **App** target
2. Go to **General** tab
3. Update **Version** (e.g., 1.0.0)
4. Update **Build** number (e.g., 1)

### 2. Archive the App

1. In Xcode, select **Any iOS Device** or **Generic iOS Device**
2. Go to **Product > Archive**
3. Wait for the archive to complete

### 3. Distribute to App Store

1. In the Organizer window, select your archive
2. Click **Distribute App**
3. Choose **App Store Connect**
4. Follow the distribution wizard
5. Upload to App Store Connect

### 4. Submit for Review

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app listing
3. Fill in app information, screenshots, description
4. Submit for review

## Troubleshooting

### CocoaPods Issues

If you see CocoaPods errors:

```bash
cd ios/App
pod install
pod update
```

### Build Errors

1. **Clean Build Folder:**
   - In Xcode: `Product > Clean Build Folder` (Shift + Cmd + K)

2. **Reset Simulator:**
   - In Xcode: `Device > Erase All Content and Settings`

3. **Re-sync Capacitor:**
   ```bash
   npm run ios:sync
   ```

### Audio Not Working

1. Check that device is not in silent mode
2. Ensure headphones are connected (for binaural beats)
3. Check iOS audio permissions in Settings

### Web Assets Not Updating

After making changes to the web app:

```bash
npm run build
npm run ios:sync
```

Then rebuild in Xcode.

## iOS-Specific Features

### Status Bar

The app uses automatic status bar styling. To customize:

1. In Xcode, select **App** target
2. Go to **Info** tab
3. Set **Status Bar Style** to **Light Content** (for dark background)

### Safe Area

The app automatically handles safe areas (notches, home indicators) via Capacitor's content inset.

### Background Audio

To enable background audio playback:

1. In Xcode, add **Background Modes** capability
2. Enable **Audio, AirPlay, and Picture in Picture**
3. Update `Info.plist` with `UIBackgroundModes` array containing `audio`

## Project Structure

```
ios/
├── App/
│   ├── App/
│   │   ├── Assets.xcassets/    # App icons and images
│   │   ├── Info.plist          # App configuration
│   │   └── Main.storyboard     # Main interface (if used)
│   ├── App.xcodeproj/          # Xcode project file
│   └── Podfile                 # CocoaPods dependencies
└── App/public/                 # Web assets (synced from dist/)
```

## Useful Commands

```bash
# Build web app and sync to iOS
npm run ios:build

# Open in Xcode
npm run ios:open

# Sync web assets only
npm run ios:sync

# Build, sync, and open
npm run ios:run

# Install CocoaPods dependencies
cd ios/App && pod install

# Update CocoaPods dependencies
cd ios/App && pod update
```

## Next Steps

1. **Customize App Icon:** Replace placeholder icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset`
2. **Configure App Store Listing:** Prepare screenshots, description, and metadata
3. **Test on Real Device:** Test audio functionality on physical iPhone/iPad
4. **Set Up Analytics:** Consider adding analytics for usage tracking
5. **Configure Push Notifications:** If needed for session reminders

## Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Xcode User Guide](https://developer.apple.com/xcode/)

---

**Note:** iOS development requires a Mac with Xcode. You cannot build iOS apps on Windows or Linux.

