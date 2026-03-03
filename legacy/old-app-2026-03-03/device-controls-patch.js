// Simple patch to add device control integration
const fs = require('fs');
const path = './src/App.tsx';

let content = fs.readFileSync(path, 'utf8');

// Add device controls import
content = content.replace(
  "import { AudioEngine, AudioSettings } from './lib/audioEngine';",
  "import { AudioEngine, AudioSettings } from './lib/audioEngine';\nimport { deviceControls } from './lib/deviceControls';"
);

// Add device controls setup in useEffect
content = content.replace(
  /useEffect\(\(\) => \{\s*audioEngine\.initialize\(\)/,
  `useEffect(() => {
    audioEngine.initialize()
      .then(() => {
        // Setup device controls after audio engine is ready
        deviceControls.updateNowPlaying(currentSession, isPlaying);
      })
      .catch(error => {
        console.error('Failed to initialize audio engine:', error);
      });
    
    // Listen for device control events
    const handleDevicePlay = () => {
      if (!audioEngine.getIsPlaying()) {
        handlePlay();
      }
    };
    
    const handleDevicePause = () => {
      if (audioEngine.getIsPlaying()) {
        handlePlay();
      }
    };
    
    const handleDeviceToggle = () => {
      handlePlay();
    };
    
    window.addEventListener('devicePlay', handleDevicePlay);
    window.addEventListener('devicePause', handleDevicePause);
    window.addEventListener('deviceToggle', handleDeviceToggle);
    
    return () => {
      window.removeEventListener('devicePlay', handleDevicePlay);
      window.removeEventListener('devicePause', handleDevicePause);
      window.removeEventListener('deviceToggle', handleDeviceToggle);
      deviceControls.destroy();
    };`
);

// Update device controls when session or play state changes
content = content.replace(
  /setIsPlaying\(true\);/g,
  `setIsPlaying(true);
    deviceControls.updateNowPlaying(currentSession, true);`
);

content = content.replace(
  /setIsPlaying\(false\);/g,
  `setIsPlaying(false);
    deviceControls.updateNowPlaying(currentSession, false);`
);

content = content.replace(
  /setCurrentSession\((.*?)\);/g,
  `setCurrentSession($1);
    if ($1) {
      deviceControls.updateNowPlaying($1, isPlaying);
    }`
);

fs.writeFileSync(path, content);
console.log('Device controls integration added to App.tsx');
