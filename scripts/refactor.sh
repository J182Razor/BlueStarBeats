#!/bin/bash
# Refactor and clean up codebase
# Run this script from the project root

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🧹 Starting codebase refactoring..."
echo ""

# Create directories
echo "Creating directories..."
mkdir -p docs scripts
echo "✓ Directories created"
echo ""

# Move documentation files
echo "Moving documentation files..."
mv FIX_SANDBOX_ERROR.md FIX_CAPACITOR.md FIX_CAPACITOR_XCODE.md RESOLVE_CAPACITOR_ERROR.md fix-capacitor-build.md docs/ 2>/dev/null || true
mv IOS_SETUP.md SETUP_IOS_SIMULATOR.md INSTALLATION.md EMBED_SCRIPT_SETUP.md INJECT_SETUP.md INJECTION_SETUP_COMPLETE.md docs/ 2>/dev/null || true
mv BACKGROUND_AUDIO.md USAGE.md UI_UX_UPGRADE_SUMMARY.md CLEAN_BUILD_INSTRUCTIONS.txt docs/ 2>/dev/null || true
echo "✓ Documentation moved"
echo ""

# Move scripts
echo "Moving scripts..."
mv diagnose-build-error.sh clean-and-rebuild.sh fix-pods-script.sh fix-phase-script-error.sh scripts/ 2>/dev/null || true
mv build-ios.sh run-build.sh clean-build.sh scripts/ 2>/dev/null || true
mv git-push.sh commit-changes.sh scripts/ 2>/dev/null || true
mv fix-capacitor-error.sh fix-capacitor-not-found.sh fix-capacitor-xcode.sh fix-sandbox-permissions.sh scripts/ 2>/dev/null || true
mv setup-embed-script.sh setup-injection.sh start-injection.sh check-simulators.sh scripts/ 2>/dev/null || true
echo "✓ Scripts moved"
echo ""

# Make scripts executable
echo "Making scripts executable..."
chmod +x scripts/*.sh 2>/dev/null || true
echo "✓ Scripts made executable"
echo ""

# Delete duplicate audioEngine.ts (already deleted)
echo "Checking for duplicate files..."
if [ -f "audioEngine.ts" ]; then
    echo "⚠️  Found duplicate audioEngine.ts - delete manually if not needed"
fi
echo ""

echo "✅ Refactoring complete!"
echo ""
echo "Next steps:"
echo "1. Review moved files in docs/ and scripts/ directories"
echo "2. Update README.md with new paths"
echo "3. Update script references in documentation"
echo "4. Test that scripts still work with new paths"
echo "5. Delete obsolete files if confirmed not needed"
echo ""


