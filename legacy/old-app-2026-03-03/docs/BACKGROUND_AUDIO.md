# Background Audio Implementation - Blue Star Beats

This document describes the background audio functionality and how it works across platforms.

## Overview

Blue Star Beats is configured to:
1. **Play audio in the background** when the app is minimized or the screen is locked
2. **Mix with other audio apps** simultaneously (e.g., Spotify, Apple Music, podcasts)
3. **Continue playing** during phone calls and interruptions (with proper handling)

## iOS Implementation

### 1. Info.plist Configuration

The `Info.plist` file includes:
- **UIBackgroundModes** with `audio` - Enables background audio playback

### 2. Audio Session Configuration (AppDelegate.swift)

The app configures the AVAudioSession with:
- **Category:** `.playback` - Allows audio playback
- **Options:**
  - `.mixWithOthers` - Allows mixing with other audio apps
  - `.duckOthers` - Temporarily reduces volume of other audio when this app plays

```swift
try audioSession.setCategory(.playback, mode: .default, options: [.mixWithOthers, .duckOthers])
```

### 3. Audio Context Configuration

The Web Audio API context is configured with:
- **latencyHint:** `'playback'` - Optimized for background playback
- **State monitoring** - Automatically resumes if suspended

## Web Audio Engine

### Background Playback Support

The `AudioEngine` class includes:

1. **Audio Context State Management:**
   - Monitors audio context state changes
   - Automatically resumes if suspended
   - Handles visibility changes

2. **Page Visibility Handling:**
   - Continues playing when page is hidden
   - Resumes properly when page becomes visible again

3. **Lifecycle Management:**
   - Properly cleans up on app termination
   - Handles app state transitions

## Testing Background Audio

### On iOS Device:

1. **Start a session** in Blue Star Beats
2. **Press the home button** or swipe up (app goes to background)
3. **Open another audio app** (Spotify, Apple Music, etc.)
4. **Play audio** in the other app
5. **Both should play simultaneously** - Blue Star Beats will mix with the other audio

### Verification:

- ✅ Audio continues when app is in background
- ✅ Audio continues when screen is locked
- ✅ Audio mixes with other apps
- ✅ Audio resumes after interruptions (calls, notifications)
- ✅ Audio stops properly when session ends

## Troubleshooting

### Audio Stops in Background

**Possible causes:**
1. Audio session not properly configured
2. Audio context suspended
3. iOS killing the app due to memory pressure

**Solutions:**
- Check that `UIBackgroundModes` includes `audio` in Info.plist
- Verify audio session is configured in AppDelegate
- Ensure audio context is in 'running' state

### Audio Doesn't Mix with Other Apps

**Possible causes:**
1. Missing `.mixWithOthers` option
2. Other app using exclusive audio category

**Solutions:**
- Verify AppDelegate has `.mixWithOthers` option
- Some apps (like phone calls) will interrupt - this is expected

### Audio Stops on Lock Screen

**Possible causes:**
1. Missing background mode
2. Audio context not properly initialized

**Solutions:**
- Ensure `UIBackgroundModes` is set in Info.plist
- Check that audio context uses `latencyHint: 'playback'`

## Technical Details

### Audio Session Categories

- **`.playback`** - Best for music/audio apps
  - Allows background playback
  - Respects silent switch (can be overridden)
  - Works with lock screen controls

### Mixing Options

- **`.mixWithOthers`** - Allows simultaneous playback
  - Your app's audio plays alongside other apps
  - Both audio streams are mixed by iOS

- **`.duckOthers`** - Temporarily reduces other audio
  - When your app starts, other audio volume is reduced
  - Other audio resumes full volume when your app stops

### Web Audio API

- **AudioContext** - Main audio processing context
- **latencyHint: 'playback'** - Optimized for continuous playback
- **State management** - Monitors and maintains 'running' state

## Best Practices

1. **Always check audio context state** before playing
2. **Resume audio context** when app becomes active
3. **Handle interruptions gracefully** (calls, notifications)
4. **Clean up resources** when stopping playback
5. **Test on real devices** - Simulators may not accurately test background audio

## Platform Differences

### iOS
- Requires `UIBackgroundModes` in Info.plist
- Requires AVAudioSession configuration
- Web Audio API works well with proper configuration

### Web Browser
- Background playback depends on browser policies
- Some browsers pause audio when tab is inactive
- Mobile browsers may have stricter policies

### Android (Future)
- Will require similar background audio configuration
- Uses Android AudioManager instead of AVAudioSession

---

**Note:** Background audio requires proper iOS configuration and testing on real devices. The simulator may not accurately reflect background audio behavior.

