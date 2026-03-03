-- AppleScript to configure InjectionIII with the workspace
-- This script opens InjectionIII and attempts to open the workspace

tell application "InjectionIII"
    activate
    delay 1
    
    -- Try to open the workspace file directly
    try
        set workspacePath to POSIX file "/Users/johnlawal/Desktop/2025-2026Projects/BlueStarBeats/ios/App/App.xcworkspace"
        open workspacePath
    on error
        -- If direct open doesn't work, we'll need manual selection
        display dialog "Please manually select the workspace in InjectionIII:" & return & return & "/Users/johnlawal/Desktop/2025-2026Projects/BlueStarBeats/ios/App/App.xcworkspace" buttons {"OK"} default button "OK"
    end try
end tell

