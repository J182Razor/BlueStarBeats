import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bluestarbeats.app',
  appName: 'Blue Star Beats',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    android: {
      allowMixedContent: true
    },
    ios: {
      allowMixedContent: true
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#1c1c3c',
    allowsLinkPreview: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1c1c3c',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: false
    }
  }
};

export default config;
