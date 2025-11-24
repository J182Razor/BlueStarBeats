import { SessionProtocol } from './sessionProtocols';

declare global {
  interface Window {
    Capacitor?: any;
  }
}

// Device audio controls synchronization
export class DeviceControls {
  private static instance: DeviceControls;

  public static getInstance(): DeviceControls {
    if (!DeviceControls.instance) {
      DeviceControls.instance = new DeviceControls();
    }
    return DeviceControls.instance;
  }

  constructor() {
    this.setupMediaSession();
    this.setupIOSControls();
  }

  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      this.handleDevicePlay();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      this.handleDevicePause();
    });

    
    // Add seek handlers
    navigator.mediaSession.setActionHandler('stop', () => {
        this.handleDevicePause();
    });
  }

  private setupIOSControls() {
    // Listen for iOS native control events
    if (window.Capacitor) {
      window.addEventListener('playAudio', () => this.handleDevicePlay());
      window.addEventListener('pauseAudio', () => this.handleDevicePause());
      window.addEventListener('togglePlayPause', () => this.handleDeviceToggle());
    }
  }

  public updateNowPlaying(session: SessionProtocol | null, isPlaying: boolean) {
    // Store state for potential future use in device control handlers

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: session?.name || 'Blue Star Beats',
        artist: 'Binaural Beats',
        album: 'Focus & Meditation',
        artwork: [
            { src: '/logo-main.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }

  private handleDevicePlay() {
    window.dispatchEvent(new CustomEvent('devicePlay'));
  }

  private handleDevicePause() {
    window.dispatchEvent(new CustomEvent('devicePause'));
  }

  private handleDeviceToggle() {
    window.dispatchEvent(new CustomEvent('deviceToggle'));
  }

  public destroy() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }
}

export const deviceControls = DeviceControls.getInstance();
