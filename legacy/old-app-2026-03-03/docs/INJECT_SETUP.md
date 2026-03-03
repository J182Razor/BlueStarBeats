# Inject Hot Reloading Setup Guide

Inject has been successfully integrated into your iOS app! This guide will help you complete the setup and start using hot reloading.

## What is Inject?

Inject is a hot reloading library that allows you to see Swift code changes in real-time without rebuilding and restarting your app. This can save hours of development time each week!

**Reference:** [Inject GitHub Repository](https://github.com/krzysztofzablocki/Inject)

## ✅ Completed Setup Steps

1. ✅ Added `InjectHotReload` pod to Podfile
2. ✅ Added `-Xlinker -interposable` linker flags for Debug simulator builds
3. ✅ Added `import Inject` to AppDelegate.swift
4. ✅ Installed CocoaPods dependencies

## 🔧 Individual Developer Setup (Required Once Per Machine)

Each developer needs to complete these steps on their machine:

### Step 1: Download InjectionIII

1. Go to the [InjectionIII GitHub Releases](https://github.com/johnno1962/InjectionIII/releases)
2. Download the latest version
3. Unpack the `.app` file
4. Move it to `/Applications/` folder

### Step 2: Verify Xcode Location

Make sure Xcode is installed at the default location:
- `/Applications/Xcode.app`

If it's in a different location, InjectionIII may not work properly.

### Step 3: Configure InjectionIII

1. **Launch InjectionIII** from Applications
2. **Select your project:**
   - Click "Open Project" or "Open Recent"
   - Navigate to and select: `ios/App/App.xcworkspace`
   - ⚠️ **Important:** Select the `.xcworkspace` file, NOT the `.xcodeproj` file!

3. **Launch your app** from Xcode (Cmd + R)

4. **Verify connection:**
   - You should see a message in the Xcode console:
   ```
   💉 InjectionIII connected /path/to/App.xcworkspace
   💉 Watching files under /path/to/project
   ```

## 🚀 Using Hot Reloading

### For UIKit/AppKit Views

Since your app uses Capacitor with UIKit, you can use `Inject.ViewHost` or `Inject.ViewControllerHost` to wrap view controllers that you want to hot reload.

**Example usage in your code:**

```swift
// If you create a view controller programmatically:
let myViewController = Inject.ViewControllerHost(MyViewController())
navigationController?.pushViewController(myViewController, animated: true)

// For views:
let myView = Inject.ViewHost(MyCustomView())
```

**Important:** Always call the initializer inside the `Inject.ViewControllerHost()` or `Inject.ViewHost()` wrapper:

```swift
// ✅ CORRECT
let vc = Inject.ViewControllerHost(MyViewController())

// ❌ WRONG
let vc = MyViewController()
let wrapped = Inject.ViewControllerHost(vc)
```

### For SwiftUI Views (if you add any)

If you add SwiftUI views in the future:

1. Add `@ObserveInjection var inject` to your view struct
2. Add `.enableInjection()` at the end of your body definition

```swift
import SwiftUI
import Inject

struct MyView: View {
    @ObserveInjection var inject
    
    var body: some View {
        Text("Hello, World!")
            .enableInjection()
    }
}
```

## 🎯 Workflow

1. **Build and run** your app once in Xcode (Cmd + R)
2. **Make changes** to your Swift code
3. **Save the file** (Cmd + S)
4. **Watch the magic!** Your changes appear in the running app almost instantly

## ⚙️ Optional Configuration

### Add Animation for Reloads

You can add smooth animations when code is injected:

```swift
// In AppDelegate.swift, didFinishLaunchingWithOptions:
InjectConfiguration.animation = .interactiveSpring()
```

### Injection Hooks for UIKit

If you need to re-bind view controllers after injection:

```swift
myView.onInjectionHook = { hostedViewController in
    // This runs each time the controller is reloaded
    presenter.ui = hostedViewController
}
```

## 🐛 Troubleshooting

### InjectionIII not connecting?

1. Make sure you selected the `.xcworkspace` file, not `.xcodeproj`
2. Verify Xcode is at `/Applications/Xcode.app`
3. Check that the app is running in Debug configuration
4. Restart InjectionIII and try again

### Changes not appearing?

1. Make sure you're editing files within the watched directory
2. Verify the file is saved (Cmd + S)
3. Check Xcode console for error messages
4. Try rebuilding the app once (Cmd + R) and then make changes

### Build errors after adding Inject?

1. Clean build folder: Product → Clean Build Folder (Shift + Cmd + K)
2. Rebuild: Cmd + R
3. Verify linker flags are set correctly in Build Settings

## 📝 Notes

- **No production impact:** Inject code is automatically stripped in Release builds, so you can leave it in your code
- **Works in Debug only:** Hot reloading only works in Debug configuration with simulator builds
- **File watching:** InjectionIII watches all Swift files in your project directory

## 🎉 You're All Set!

Once InjectionIII is running and connected, you can start making changes to your Swift code and see them reflected in real-time. This will significantly speed up your iOS development workflow!

