# Installation Guide - Blue Star Beats

This guide will walk you through installing and setting up Blue Star Beats on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`
   - Should output: `v18.x.x` or higher

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`
   - Should output: `9.x.x` or higher

3. **Git** (optional, for cloning)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **Modern Web Browser**
   - Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
   - Web Audio API support required

## Installation Steps

### Step 1: Clone or Download the Repository

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/J182Razor/BlueStarBeats.git
cd BlueStarBeats
```

**Option B: Download ZIP**
1. Visit the repository on GitHub
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal/command prompt in the extracted folder

### Step 2: Install Dependencies

Navigate to the project directory and install all required packages:

```bash
npm install
```

This will install:
- React and React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- ESLint
- And all other dependencies

**Expected Output:**
```
added 234 packages, and audited 235 packages in 15s
```

### Step 3: Verify Installation

Check that all dependencies are installed correctly:

```bash
npm list --depth=0
```

You should see a list of installed packages without errors.

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

The application will be available at `http://localhost:5173/`

### Production Build

Build the application for production:

```bash
npm run build
```

**Expected Output:**
```
vite v5.x.x building for production...
✓ 234 modules transformed.
dist/index.html                   0.xx kB
dist/assets/index-xxxxx.js        xxx kB
dist/assets/index-xxxxx.css       xx.x kB
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Configuration

### Environment Variables

Currently, no environment variables are required. Future versions may include:
- API keys for payment processing
- Analytics tracking IDs
- Feature flags

### Browser Configuration

For the best experience:

1. **Enable Web Audio API:**
   - Most modern browsers enable this by default
   - No additional configuration needed

2. **Allow Audio Autoplay (if needed):**
   - Some browsers block autoplay
   - User interaction is required to start audio (this is by design)

3. **Use Headphones:**
   - Binaural beats require stereo headphones
   - Connect headphones before starting a session

## Troubleshooting Installation

### Issue: `npm install` fails

**Solution 1: Clear npm cache**
```bash
npm cache clean --force
npm install
```

**Solution 2: Delete node_modules and package-lock.json**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Solution 3: Use different Node version**
```bash
# Using nvm (Node Version Manager)
nvm install 18
nvm use 18
npm install
```

### Issue: Port 5173 already in use

**Solution: Use a different port**
```bash
npm run dev -- --port 3000
```

Or modify `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Issue: TypeScript errors

**Solution: Reinstall TypeScript**
```bash
npm install --save-dev typescript @types/react @types/react-dom
```

### Issue: Tailwind CSS not working

**Solution: Rebuild CSS**
```bash
npm run build
```

Or check that `tailwind.config.js` exists and is properly configured.

### Issue: Audio not playing

**Solution:**
1. Check browser console for errors
2. Ensure browser supports Web Audio API
3. Try a different browser
4. Check system audio settings
5. Ensure headphones are connected (for binaural beats)

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Browser DevTools

- Chrome DevTools (recommended)
- React Developer Tools extension
- Web Audio API inspector

## Next Steps

After successful installation:

1. Read [USAGE.md](./USAGE.md) for usage instructions
2. Explore the codebase structure
3. Check `package.json` for available scripts
4. Review component documentation in `src/components/`

## System Requirements

### Minimum Requirements
- **OS:** Windows 10, macOS 10.15, or Linux (Ubuntu 20.04+)
- **RAM:** 4GB
- **Storage:** 500MB free space
- **Browser:** Modern browser with Web Audio API support

### Recommended Requirements
- **OS:** Latest version of Windows, macOS, or Linux
- **RAM:** 8GB+
- **Storage:** 1GB+ free space
- **Browser:** Latest Chrome or Firefox
- **Audio:** Stereo headphones or speakers

## Support

If you encounter issues during installation:

1. Check the [Troubleshooting](#troubleshooting-installation) section
2. Review browser console for errors
3. Ensure all prerequisites are met
4. Open an issue on GitHub with:
   - Your OS and version
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Error messages or logs

---

**Installation complete!** You're ready to start using Blue Star Beats. 🎵

