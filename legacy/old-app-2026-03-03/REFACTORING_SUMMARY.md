# Codebase Refactoring Summary

## ✅ Completed

1. **Created directory structure:**
   - `docs/` - For all documentation
   - `scripts/` - For all shell scripts

2. **Created consolidated documentation:**
   - `docs/IOS_SETUP.md` - Consolidated iOS setup guide
   - `docs/TROUBLESHOOTING.md` - Consolidated troubleshooting guide (includes sandbox error fix)

3. **Deleted duplicate files:**
   - `audioEngine.ts` (root) - duplicate of `src/lib/audioEngine.ts`

4. **Updated README.md:**
   - Updated all documentation links to point to `docs/` directory
   - Added troubleshooting section with links

5. **Created refactoring script:**
   - `scripts/refactor.sh` - Automated script to move files

## 📋 To Do (Run refactor.sh)

Run the refactoring script to complete the cleanup:

```bash
chmod +x scripts/refactor.sh
./scripts/refactor.sh
```

This will:
- Move all documentation files to `docs/`
- Move all scripts to `scripts/`
- Make scripts executable

## 🗑️ Files to Review for Deletion

After running the refactor script, review these files and delete if obsolete:

### Potentially Obsolete Scripts:
- `fix-phase-script-error.sh` - functionality merged into `clean-and-rebuild.sh`
- `fix-capacitor-error.sh` - check if still needed
- `fix-capacitor-not-found.sh` - check if still needed
- `fix-capacitor-xcode.sh` - check if still needed
- `fix-sandbox-permissions.sh` - functionality in `fix-pods-script.sh`

### Documentation Already Consolidated:
These will be moved by the script, but can be deleted after confirming content is in consolidated docs:
- `FIX_SANDBOX_ERROR.md` → merged into `docs/TROUBLESHOOTING.md`
- `FIX_CAPACITOR.md` → merged into `docs/TROUBLESHOOTING.md`
- `FIX_CAPACITOR_XCODE.md` → merged into `docs/TROUBLESHOOTING.md`
- `RESOLVE_CAPACITOR_ERROR.md` → merged into `docs/TROUBLESHOOTING.md`
- `fix-capacitor-build.md` → merged into `docs/TROUBLESHOOTING.md`
- `EMBED_SCRIPT_SETUP.md` → merged into `docs/IOS_SETUP.md`
- `INJECT_SETUP.md` → merged into `docs/IOS_SETUP.md`
- `INJECTION_SETUP_COMPLETE.md` → merged into `docs/IOS_SETUP.md`
- `SETUP_IOS_SIMULATOR.md` → merged into `docs/IOS_SETUP.md`
- `INSTALLATION.md` → merged into `docs/IOS_SETUP.md`
- `CLEAN_BUILD_INSTRUCTIONS.txt` → merged into `docs/TROUBLESHOOTING.md`

## 📝 Script Path Updates Needed

After moving scripts, update these files to use new paths:

1. **Update script references in documentation:**
   - `docs/TROUBLESHOOTING.md` - Update `./scripts/fix-pods-script.sh`
   - `docs/IOS_SETUP.md` - Update script paths

2. **Update scripts that call other scripts:**
   - `scripts/diagnose-build-error.sh` - Update any internal script calls
   - `scripts/clean-and-rebuild.sh` - Update any internal script calls

## 📁 Final Structure

```
BlueStarBeats/
├── docs/                      # All documentation
│   ├── IOS_SETUP.md
│   ├── TROUBLESHOOTING.md
│   ├── USAGE.md
│   ├── BACKGROUND_AUDIO.md
│   └── UI_UX_UPGRADE_SUMMARY.md
├── scripts/                   # All shell scripts
│   ├── refactor.sh
│   ├── diagnose-build-error.sh
│   ├── clean-and-rebuild.sh
│   ├── fix-pods-script.sh
│   └── ... (other scripts)
├── src/                       # Source code
├── ios/                       # iOS app
├── public/                    # Static assets
├── dist/                      # Build output
├── README.md                  # Main readme
└── package.json
```

## ✅ Verification Checklist

After refactoring:

- [ ] Run `./scripts/refactor.sh`
- [ ] Verify all scripts in `scripts/` are executable
- [ ] Test key scripts: `./scripts/diagnose-build-error.sh`
- [ ] Update any remaining script path references
- [ ] Delete obsolete files after confirming
- [ ] Update `.gitignore` if needed
- [ ] Commit changes

## 🎯 Benefits

1. **Cleaner root directory** - Only essential files at root
2. **Better organization** - Related files grouped together
3. **Easier navigation** - Clear structure for new developers
4. **Reduced duplication** - Consolidated documentation
5. **Maintainability** - Easier to find and update files


