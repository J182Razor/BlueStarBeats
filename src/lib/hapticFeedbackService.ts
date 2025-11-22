import { Capacitor } from '@capacitor/core';

// Haptic feedback service for mobile interactions
export class HapticFeedbackService {
  private static isAvailable(): boolean {
    return Capacitor.isNativePlatform();
  }

  static async selectionChanged(): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      // Use Capacitor Haptics plugin if available
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.selectionChanged();
    } catch (error) {
      // Fallback: Haptics plugin not installed, continue silently
      console.debug('Haptics not available:', error);
    }
  }

  static async impact(style: 'heavy' | 'medium' | 'light' = 'medium'): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.impact({ style });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }

  static async notification(type: 'success' | 'warning' | 'error'): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.notification({ type });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }
}

