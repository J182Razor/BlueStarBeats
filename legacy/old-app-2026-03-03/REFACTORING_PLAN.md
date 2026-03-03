# Codebase Refactoring Plan

## Overview
This document outlines the refactoring plan to consolidate and clean up the BlueStarBeats codebase.

## Directory Structure

### New Structure
```
BlueStarBeats/
├── docs/                    # All documentation
│   ├── IOS_SETUP.md        # iOS setup (consolidated)
│   ├── TROUBLESHOOTING.md  # All troubleshooting (consolidated)
│   └── ...
├── scripts/                 # All shell scripts
│   ├── build.sh            # Consolidated build scripts
│   ├── fix-pods-script.sh  # Pods fix script
│   └── ...
├── src/                     # Source code (unchanged)
├── ios/                     # iOS app (unchanged)
└── README.md               # Main readme
```

## Files to Delete

### Duplicate Files
- `audioEngine.ts` (root) - duplicate of `src/lib/audioEngine.ts`

### Obsolete Scripts (if not needed)
- `fix-phase-script-error.sh` - functionality merged into `clean-and-rebuild.sh`
- `fix-capacitor-error.sh` - if obsolete
- `fix-capacitor-not-found.sh` - if obsolete
- `fix-capacitor-xcode.sh` - if obsolete
- `fix-sandbox-permissions.sh` - functionality in `fix-pods-script.sh`

### Obsolete Documentation
- `FIX_SANDBOX_ERROR.md` - merged into `docs/TROUBLESHOOTING.md`
- `FIX_CAPACITOR.md` - merged into `docs/TROUBLESHOOTING.md`
- `FIX_CAPACITOR_XCODE.md` - merged into `docs/TROUBLESHOOTING.md`
- `RESOLVE_CAPACITOR_ERROR.md` - merged into `docs/TROUBLESHOOTING.md`
- `fix-capacitor-build.md` - merged into `docs/TROUBLESHOOTING.md`
- `EMBED_SCRIPT_SETUP.md` - merged into `docs/IOS_SETUP.md`
- `INJECT_SETUP.md` - merged into `docs/IOS_SETUP.md`
- `INJECTION_SETUP_COMPLETE.md` - merged into `docs/IOS_SETUP.md`
- `SETUP_IOS_SIMULATOR.md` - merged into `docs/IOS_SETUP.md`
- `INSTALLATION.md` - merged into `docs/IOS_SETUP.md`
- `CLEAN_BUILD_INSTRUCTIONS.txt` - merged into `docs/TROUBLESHOOTING.md`

## Files to Consolidate

### Scripts
- `build-ios.sh` + `run-build.sh` → `scripts/build.sh`
- `clean-build.sh` + `clean-and-rebuild.sh` → `scripts/clean.sh`
- `git-push.sh` + `commit-changes.sh` → `scripts/git-utils.sh` (or delete if not needed)

### Documentation
- All iOS setup docs → `docs/IOS_SETUP.md`
- All troubleshooting docs → `docs/TROUBLESHOOTING.md`
- Keep `USAGE.md`, `BACKGROUND_AUDIO.md`, `UI_UX_UPGRADE_SUMMARY.md` as separate docs

## Implementation Steps

1. ✅ Create `docs/` and `scripts/` directories
2. ✅ Move documentation files to `docs/`
3. ✅ Move script files to `scripts/`
4. ⏳ Delete duplicate files
5. ⏳ Consolidate scripts
6. ⏳ Update README.md with new paths
7. ⏳ Update all script paths in documentation
8. ⏳ Test that all scripts still work

## Script Path Updates Needed

All scripts that reference other scripts need path updates:
- `scripts/diagnose-build-error.sh` - update paths
- `scripts/clean-and-rebuild.sh` - update paths
- Any scripts that call `./fix-pods-script.sh` need to use `./scripts/fix-pods-script.sh`

## README Updates

Update README.md to:
- Reference `docs/IOS_SETUP.md` instead of `IOS_SETUP.md`
- Reference `docs/TROUBLESHOOTING.md` for troubleshooting
- Update script paths to `scripts/`


