import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play, Pause, Volume2 } from 'lucide-react-native';
import { useAudio } from '../contexts/AudioContext';
import Slider from '@react-native-community/slider';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

const WAVEFORMS = [
  { value: 'sine', label: 'Sine', icon: '~' },
  { value: 'square', label: 'Square', icon: '⎍' },
  { value: 'sawtooth', label: 'Sawtooth', icon: '⟋' },
  { value: 'triangle', label: 'Triangle', icon: '△' }
] as const;

const MODES = [
  { value: 'binaural', label: 'Binaural', description: 'Stereo beats' },
  { value: 'isochronic', label: 'Isochronic', description: 'Pulsed tones' }
] as const;

export default function NowPlayingScreen() {
  const router = useRouter();
  const { currentSession, isPlaying, togglePlayback, audioSettings, updateAudioSettings } = useAudio();

  const [carrierFreq, setCarrierFreq] = useState(audioSettings?.carrierFrequency || 440);
  const [beatFreq, setBeatFreq] = useState(audioSettings?.beatFrequency || 7.83);
  const [volume, setVolume] = useState(audioSettings?.volume || 0.7);

  useEffect(() => {
    if (audioSettings) {
      setCarrierFreq(audioSettings.carrierFrequency);
      setBeatFreq(audioSettings.beatFrequency);
      setVolume(audioSettings.volume);
    }
  }, [audioSettings]);

  const handleCarrierChange = (value: number) => {
    setCarrierFreq(value);
    updateAudioSettings?.({ carrierFrequency: value });
  };

  const handleBeatChange = (value: number) => {
    setBeatFreq(value);
    updateAudioSettings?.({ beatFrequency: value });
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    updateAudioSettings?.({ volume: value });
  };

  const handleWaveformChange = (waveform: typeof WAVEFORMS[number]['value']) => {
    updateAudioSettings?.({ waveform });
  };

  const handleModeChange = (mode: typeof MODES[number]['value']) => {
    updateAudioSettings?.({ mode });
  };

  if (!currentSession) {
    return (
      <View className="flex-1 items-center justify-center bg-[#191121]">
        <Text className="text-white text-lg">No session playing</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 bg-[#B388FF] rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/70" />
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center py-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 rounded-full bg-white/10"
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-xl font-bold text-white pr-10">
                Now Playing
              </Text>
            </View>

            {/* Session Info */}
            <View className="items-center py-8">
              <View className="w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 items-center justify-center mb-6">
                <Text className="text-6xl">🎵</Text>
              </View>
              <Text className="text-2xl font-bold text-white mb-2">{currentSession.title}</Text>
              <Text className="text-white/60">{currentSession.subtitle}</Text>
            </View>

            {/* Play/Pause Button */}
            <View className="items-center mb-8">
              <TouchableOpacity
                onPress={togglePlayback}
                className="w-20 h-20 rounded-full bg-[#B388FF] items-center justify-center"
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <Pause size={32} color="white" fill="white" />
                ) : (
                  <Play size={32} color="white" fill="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Audio Mode Selection */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">Mode</Text>
              <View className="flex-row gap-3">
                {MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode.value}
                    onPress={() => handleModeChange(mode.value)}
                    className={`flex-1 p-4 rounded-2xl ${audioSettings?.mode === mode.value
                        ? 'bg-[#B388FF]'
                        : 'bg-white/5'
                      }`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold text-center">{mode.label}</Text>
                    <Text className="text-white/50 text-xs text-center mt-1">{mode.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Waveform Selection */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">Waveform</Text>
              <View className="flex-row gap-2">
                {WAVEFORMS.map((wf) => (
                  <TouchableOpacity
                    key={wf.value}
                    onPress={() => handleWaveformChange(wf.value)}
                    className={`flex-1 p-3 rounded-xl ${audioSettings?.waveform === wf.value
                        ? 'bg-[#B388FF]'
                        : 'bg-white/5'
                      }`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-2xl text-center">{wf.icon}</Text>
                    <Text className="text-white text-xs text-center mt-1">{wf.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Carrier Frequency */}
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-semibold">Carrier Frequency</Text>
                <Text className="text-[#B388FF] font-mono">{carrierFreq.toFixed(3)} Hz</Text>
              </View>
              <Slider
                value={carrierFreq}
                onValueChange={handleCarrierChange}
                minimumValue={1}
                maximumValue={1000}
                step={0.001}
                minimumTrackTintColor="#B388FF"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor="#B388FF"
              />
            </View>

            {/* Beat Frequency */}
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-semibold">
                  {audioSettings?.mode === 'binaural' ? 'Beat' : 'Pulse'} Frequency
                </Text>
                <Text className="text-[#B388FF] font-mono">{beatFreq.toFixed(3)} Hz</Text>
              </View>
              <Slider
                value={beatFreq}
                onValueChange={handleBeatChange}
                minimumValue={0.1}
                maximumValue={40}
                step={0.001}
                minimumTrackTintColor="#B388FF"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor="#B388FF"
              />
            </View>

            {/* Volume Control */}
            <View className="mb-8">
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Volume2 size={20} color="white" />
                  <Text className="text-white font-semibold">Volume</Text>
                </View>
                <Text className="text-[#B388FF]">{Math.round(volume * 100)}%</Text>
              </View>
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                minimumTrackTintColor="#B388FF"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor="#B388FF"
              />
            </View>

            {/* Spacer for bottom padding */}
            <View className="h-24" />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
