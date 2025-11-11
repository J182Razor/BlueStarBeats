import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bluestarbeats.app',
  appName: 'Blue Star Beats',
  webDir: 'dist',
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
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#DAA520'
    }
  }
};

export default config;
