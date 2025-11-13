#!/bin/bash
# Wrapper script to embed Pods frameworks
# Designed to work with Xcode sandbox restrictions and paths containing spaces

set -e

# Get absolute paths to avoid sandbox issues
if [ -z "${SRCROOT:-}" ]; then
    echo "Error: SRCROOT environment variable is not set"
    exit 1
fi

# Resolve absolute paths
SRCROOT_ABS=$(cd "$SRCROOT" && pwd)
PODS_ROOT="${PODS_ROOT:-${SRCROOT_ABS}/Pods}"

# Check if Pods directory exists
if [ ! -d "$PODS_ROOT" ]; then
    echo "Warning: Pods directory not found at $PODS_ROOT"
    echo "Skipping framework embedding..."
    exit 0
fi

# Navigate to the script directory to avoid path-with-spaces issues
SCRIPT_DIR="${PODS_ROOT}/Target Support Files/Pods-BlueStarBeats"
SCRIPT_NAME="Pods-BlueStarBeats-frameworks.sh"

# Check if script directory exists
if [ ! -d "$SCRIPT_DIR" ]; then
    echo "Warning: Pods script directory not found at $SCRIPT_DIR"
    echo "Skipping framework embedding..."
    exit 0
fi

# Change to script directory (this helps with sandbox and spaces in path)
cd "$SCRIPT_DIR" || {
    echo "Warning: Could not change to script directory: $SCRIPT_DIR"
    echo "Skipping framework embedding..."
    exit 0
}

# Verify script exists
if [ ! -f "$SCRIPT_NAME" ]; then
    echo "Warning: Pods script not found: $SCRIPT_NAME"
    echo "Skipping framework embedding..."
    exit 0
fi

# Make script executable (in case permissions were lost)
chmod +x "$SCRIPT_NAME" 2>/dev/null || true

# Execute the script with explicit bash
# Using ./ to ensure we're executing from current directory
exec bash "./${SCRIPT_NAME}"

