#!/bin/bash
# Clean build script to fix Capacitor build errors

echo "Cleaning Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "Cleaning Pods..."
cd ios/App
rm -rf Pods
rm -rf Podfile.lock
rm -rf .symlinks

echo "Reinstalling Pods..."
export LANG=en_US.UTF-8
pod install

echo "Done! Now try building in Xcode again."

