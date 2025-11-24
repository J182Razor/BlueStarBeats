import React, { useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { premiumService } from '../lib/premiumService';
import { userPreferences } from '../lib/userPreferences';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { AUDIO_PRESETS } from '../lib/audioPresets';
import { AudioPreset } from '../lib/types';
import SessionHistory from './SessionHistory';
import PremiumModal from './PremiumModal';

interface ProfileViewProps {
  initialShowHistory?: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ initialShowHistory = false }) => {
  const { settings, updateSettings } = useAppState();
  const [showHistory, setShowHistory] = useState(initialShowHistory);
  
  useEffect(() => {
    if (initialShowHistory) {
      setShowHistory(true);
    }
  }, [initialShowHistory]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const isIOS = Capacitor.getPlatform() === 'ios';
  const isPremium = premiumService.isPremium();
  const history = userPreferences.getSessionHistory();

  const stats = {
    totalSessions: history.length,
    completedSessions: history.filter(e => e.completed).length,
    totalDuration: history.filter(e => e.completed).reduce((sum, e) => sum + e.duration, 0),
    averageRating: (() => {
      const ratings = history
        .map(e => e.effectivenessRating)
        .filter((r): r is number => r !== undefined);
      return ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;
    })()
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handlePresetSelect = (preset: AudioPreset) => {
    updateSettings({
      carrierFrequency: preset.carrierFrequency,
      beatFrequency: preset.beatFrequency,
      waveform: preset.waveform,
      mode: preset.mode,
      volume: settings.volume
    });
    setShowPresets(false);
    if (isIOS) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }
  };

  const handleUpgrade = (tier: 'monthly' | 'annual' | 'lifetime') => {
    premiumService.setTier(tier);
    setShowPremiumModal(false);
    if (isIOS) {
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 p-4 sm:p-6 safe-area-inset overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-purple-200 text-sm">Settings and preferences</p>
        </div>

        {/* Premium Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                {isPremium ? '⭐ Premium Member' : 'Free Account'}
              </h2>
              <p className="text-purple-200 text-sm">
                {isPremium ? 'Thank you for your support!' : 'Upgrade to unlock all features'}
              </p>
            </div>
            {!isPremium && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold text-sm active:scale-95 transition-transform"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalSessions}</div>
            <div className="text-xs sm:text-sm text-purple-200">Total Sessions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">{stats.completedSessions}</div>
            <div className="text-xs sm:text-sm text-purple-200">Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{formatDuration(stats.totalDuration)}</div>
            <div className="text-xs sm:text-sm text-purple-200">Total Time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-1">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-xs sm:text-sm text-purple-200">Avg Rating</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-4">
          <button
            onClick={() => setShowHistory(true)}
            className="w-full bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Session History</h3>
                <p className="text-purple-200 text-xs">View all your sessions</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setShowPresets(!showPresets)}
            className="w-full bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Audio Presets</h3>
                <p className="text-purple-200 text-xs">Quick-start configurations</p>
              </div>
            </div>
            <svg className={`w-5 h-5 text-purple-300 transition-transform ${showPresets ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Audio Presets */}
        {showPresets && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-4">
            <h3 className="text-white font-semibold mb-3">Select Preset</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {AUDIO_PRESETS.map(preset => {
                const isActive = 
                  Math.abs(settings.carrierFrequency - preset.carrierFrequency) < 1 &&
                  Math.abs(settings.beatFrequency - preset.beatFrequency) < 0.1 &&
                  settings.waveform === preset.waveform &&
                  settings.mode === preset.mode;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-3 rounded-lg text-left border-2 transition-all ${
                      isActive
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <div className="text-white font-medium text-sm mb-1">{preset.name}</div>
                    <div className="text-purple-200 text-xs">{preset.targetBrainwave}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-4">
          <h3 className="text-white font-semibold mb-4">Audio Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-purple-200 mb-2">Volume</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.volume}
                  onChange={(e) => {
                    updateSettings({ ...settings, volume: parseFloat(e.target.value) });
                    if (isIOS) {
                      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
                    }
                  }}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none accent-purple-500"
                />
                <span className="text-white font-medium text-sm min-w-[3rem] text-right">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-purple-200 text-xs mt-auto pt-4">
          <p>Blue Star Beats v0.0.0</p>
          <p className="mt-1">Precision Brainwave Entrainment</p>
        </div>
      </div>

      {showHistory && (
        <SessionHistory
          onClose={() => setShowHistory(false)}
        />
      )}

      {showPremiumModal && (
        <PremiumModal
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </>
  );
};

export default ProfileView;

