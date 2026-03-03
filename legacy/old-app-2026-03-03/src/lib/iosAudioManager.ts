import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export class IOSAudioManager {
  private static instance: IOSAudioManager;
  private audioContext: AudioContext | null = null;
  private isIOSAudioConfigured = false;

  private constructor() {}

  static getInstance(): IOSAudioManager {
    if (!IOSAudioManager.instance) {
      IOSAudioManager.instance = new IOSAudioManager();
    }
    return IOSAudioManager.instance;
  }

  async initializeIOSAudio(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (!Capacitor.isNativePlatform() || platform !== 'ios') {
      return;
    }

    try {
      // Configure iOS audio session through Capacitor
      await this.configureIOSAudioSession();
      
      // Handle audio interruptions
      this.setupAudioInterruptionHandlers();
      
      // Enable background audio
      this.enableBackgroundAudio();
      
      this.isIOSAudioConfigured = true;
    } catch (error) {
      console.error('Failed to configure iOS audio:', error);
      throw new Error(`iOS Audio Setup Failed: ${error}`);
    }
  }

  private async configureIOSAudioSession(): Promise<void> {
    // This would typically involve a native plugin or Capacitor bridge
    // For now, we'll simulate the required setup
    
    if (typeof window !== 'undefined') {
      // Request microphone permission (if needed for certain features)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          console.warn('Microphone access denied, continuing without it');
        }
      }
    }

    // Configure Web Audio API for iOS compatibility
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    // Resume audio context on first user interaction (iOS requirement)
    const resumeContext = async () => {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      document.removeEventListener('touchstart', resumeContext);
      document.removeEventListener('click', resumeContext);
    };

    document.addEventListener('touchstart', resumeContext, { once: true });
    document.addEventListener('click', resumeContext, { once: true });
  }

  private setupAudioInterruptionHandlers(): void {
    // Handle phone calls, Siri, etc.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.audioContext?.state === 'running') {
        // Pause audio when app goes to background
        this.handleAudioInterruption('begin');
      } else if (!document.hidden) {
        // Resume after interruption ends
        this.handleAudioInterruption('end');
      }
    });
  }

  private enableBackgroundAudio(): void {
    // This requires proper iOS configuration in Info.plist
    // We'll add hooks for when the app moves to background/foreground
    
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        // App moved to background
        console.log('App moving to background - managing audio state');
        // Don't stop audio here - let iOS handle it with proper background modes
      } else {
        // App returned to foreground
        console.log('App returning to foreground - resuming audio if needed');
        this.resumeAudioIfNeeded();
      }
    });
  }

  private handleAudioInterruption(type: 'begin' | 'end'): void {
    // Notify audio engine about interruption
    const event = new CustomEvent('audioInterruption', {
      detail: { type }
    });
    window.dispatchEvent(event);
  }

  private async resumeAudioIfNeeded(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'interrupted') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  isConfigured(): boolean {
    return this.isIOSAudioConfigured;
  }
}

