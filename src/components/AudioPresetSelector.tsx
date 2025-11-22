import React, { useState, useMemo } from 'react';
import { AudioPreset } from '../lib/types';
import { AUDIO_PRESETS, getPresetsByCategory, getPresetsByBrainwave, getPresetsByIntensity } from '../lib/audioPresets';
import { HapticFeedbackService } from '../lib/hapticFeedbackService';

interface AudioPresetSelectorProps {
  onPresetSelect: (preset: AudioPreset) => void;
  currentSettings?: {
    carrierFrequency: number;
    beatFrequency: number;
    waveform: string;
    mode: string;
  };
}

const AudioPresetSelector: React.FC<AudioPresetSelectorProps> = ({ onPresetSelect, currentSettings }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrainwave, setSelectedBrainwave] = useState<string>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'sleep', 'focus', 'meditation', 'anxiety', 'creativity', 'learning'];
  const brainwaves = ['all', 'delta', 'theta', 'alpha', 'beta', 'gamma'];
  const intensities = ['all', 'gentle', 'moderate', 'intense'];

  const filteredPresets = useMemo(() => {
    let presets = AUDIO_PRESETS;

    // Filter by category
    if (selectedCategory !== 'all') {
      presets = getPresetsByCategory(selectedCategory as any);
    }

    // Filter by brainwave
    if (selectedBrainwave !== 'all') {
      const brainwavePresets = getPresetsByBrainwave(selectedBrainwave as any);
      presets = presets.filter(p => brainwavePresets.includes(p));
    }

    // Filter by intensity
    if (selectedIntensity !== 'all') {
      const intensityPresets = getPresetsByIntensity(selectedIntensity as any);
      presets = presets.filter(p => intensityPresets.includes(p));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      presets = presets.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.targetBrainwave.toLowerCase().includes(query)
      );
    }

    return presets;
  }, [selectedCategory, selectedBrainwave, selectedIntensity, searchQuery]);

  const handlePresetSelect = (preset: AudioPreset) => {
    HapticFeedbackService.selectionChanged();
    onPresetSelect(preset);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'gentle': return 'from-green-500 to-emerald-600';
      case 'moderate': return 'from-blue-500 to-cyan-600';
      case 'intense': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getBrainwaveColor = (brainwave: string) => {
    switch (brainwave) {
      case 'delta': return 'text-indigo-400';
      case 'theta': return 'text-purple-400';
      case 'alpha': return 'text-blue-400';
      case 'beta': return 'text-cyan-400';
      case 'gamma': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-silver-light mb-2">
          <span className="text-gradient-silver">Audio Presets</span>
        </h2>
        <p className="text-sm text-gray-400">Quick-start configurations for different states</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search presets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
        />
        <svg className="absolute right-4 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Brainwave Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Brainwave</label>
          <div className="flex flex-wrap gap-2">
            {brainwaves.map(bw => (
              <button
                key={bw}
                onClick={() => setSelectedBrainwave(bw)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedBrainwave === bw
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
              >
                {bw.charAt(0).toUpperCase() + bw.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Intensity</label>
          <div className="flex flex-wrap gap-2">
            {intensities.map(int => (
              <button
                key={int}
                onClick={() => setSelectedIntensity(int)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedIntensity === int
                    ? `bg-gradient-to-r ${getIntensityColor(int)} text-white shadow-lg`
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
              >
                {int.charAt(0).toUpperCase() + int.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredPresets.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-400">
            No presets found matching your filters
          </div>
        ) : (
          filteredPresets.map((preset) => {
            const isActive = currentSettings &&
              Math.abs(currentSettings.carrierFrequency - preset.carrierFrequency) < 1 &&
              Math.abs(currentSettings.beatFrequency - preset.beatFrequency) < 0.1 &&
              currentSettings.waveform === preset.waveform &&
              currentSettings.mode === preset.mode;

            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`
                  text-left p-4 rounded-xl
                  transition-all duration-300
                  border-2
                  ${isActive
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-gray-700/50 bg-gray-800/30 hover:border-purple-500/50 hover:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white text-lg">{preset.name}</h3>
                  {isActive && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">{preset.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${getBrainwaveColor(preset.targetBrainwave)} bg-gray-800/50`}>
                    {preset.targetBrainwave.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded bg-gradient-to-r ${getIntensityColor(preset.intensity)} text-white`}>
                    {preset.intensity}
                  </span>
                  <span className="px-2 py-1 rounded text-gray-300 bg-gray-800/50">
                    {preset.mode}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {preset.carrierFrequency}Hz • {preset.beatFrequency}Hz beat
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AudioPresetSelector;

