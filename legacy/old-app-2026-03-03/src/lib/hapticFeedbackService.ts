import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Haptic feedback service for mobile interactions
export class HapticFeedbackService {
  private static isAvailable(): boolean {
    return Capacitor.isNativePlatform();
  }

  static async selectionChanged(): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }

  static async impact(style: ImpactStyle = ImpactStyle.Medium): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }

  static async notification(type: NotificationType): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  }
}

