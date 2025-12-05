import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, Volume2, Waves } from 'lucide-react-native';
import { useAudio } from '../../contexts/AudioContext';
import Slider from '@react-native-community/slider';

const GALAXY_BG = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2000';

const WAVEFORMS = [
    { value: 'sine', label: 'Sine', icon: '~' },
    { value: 'square', label: 'Square', icon: '⎍' },
    { value: 'sawtooth', label: 'Saw', icon: '⟋' },
    { value: 'triangle', label: 'Tri', icon: '△' },
] as const;

const MODES = [
    { value: 'binaural', label: 'Binaural', description: 'Stereo beats for deep entrainment' },
    { value: 'isochronic', label: 'Isochronic', description: 'Pulsed tones for focus' },
] as const;

const PRESETS = [
    { name: 'Schumann', carrier: 440, beat: 7.83, description: "Earth's frequency" },
    { name: 'Deep Focus', carrier: 400, beat: 40, description: 'Gamma waves' },
    { name: 'Relaxation', carrier: 200, beat: 10, description: 'Alpha waves' },
    { name: 'Deep Sleep', carrier: 100, beat: 2, description: 'Delta waves' },
    { name: 'Meditation', carrier: 150, beat: 6, description: 'Theta waves' },
    { name: 'Creativity', carrier: 300, beat: 7, description: 'Theta/Alpha border' },
];

export default function PlayerScreen() {
    const { isPlaying, togglePlayback, audioSettings, updateAudioSettings } = useAudio();

    const [carrierFreq, setCarrierFreq] = useState(audioSettings?.carrierFrequency || 440);
    const [beatFreq, setBeatFreq] = useState(audioSettings?.beatFrequency || 7.83);
    const [volume, setVolume] = useState(audioSettings?.volume || 0.7);
    const [selectedMode, setSelectedMode] = useState<'binaural' | 'isochronic'>(
        audioSettings?.mode || 'binaural'
    );
    const [selectedWaveform, setSelectedWaveform] = useState<string>(
        audioSettings?.waveform || 'sine'
    );

    useEffect(() => {
        if (audioSettings) {
            setCarrierFreq(audioSettings.carrierFrequency);
            setBeatFreq(audioSettings.beatFrequency);
            setVolume(audioSettings.volume);
            setSelectedMode(audioSettings.mode);
            setSelectedWaveform(audioSettings.waveform);
        }
    }, [audioSettings]);

    const handleCarrierChange = (value: number) => {
        setCarrierFreq(value);
        updateAudioSettings({ carrierFrequency: value });
    };

    const handleBeatChange = (value: number) => {
        setBeatFreq(value);
        updateAudioSettings({ beatFrequency: value });
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
        updateAudioSettings({ volume: value });
    };

    const handleWaveformChange = (wf: string) => {
        setSelectedWaveform(wf);
        updateAudioSettings({ waveform: wf as any });
    };

    const handleModeChange = (newMode: 'binaural' | 'isochronic') => {
        setSelectedMode(newMode);
        updateAudioSettings({ mode: newMode });
    };

    const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
        setCarrierFreq(preset.carrier);
        setBeatFreq(preset.beat);
        updateAudioSettings({
            carrierFrequency: preset.carrier,
            beatFrequency: preset.beat,
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground source={{ uri: GALAXY_BG }} style={{ flex: 1 }} resizeMode="cover">
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(25, 17, 33, 0.85)',
                    }}
                />
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView
                        style={{ flex: 1, paddingHorizontal: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <Waves size={32} color="#6366f1" />
                            <Text
                                style={{
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    marginTop: 8,
                                }}
                            >
                                Brainwave Entrainment
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4 }}>
                                Precision frequency control
                            </Text>
                        </View>

                        {/* Play/Pause Button */}
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <TouchableOpacity
                                onPress={togglePlayback}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: isPlaying ? '#ef4444' : '#6366f1',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                activeOpacity={0.8}
                            >
                                {isPlaying ? (
                                    <Pause size={32} color="white" fill="white" />
                                ) : (
                                    <Play size={32} color="white" fill="white" />
                                )}
                            </TouchableOpacity>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: 8 }}>
                                {isPlaying ? 'Playing' : 'Tap to Start'}
                            </Text>
                        </View>

                        {/* Frequency Display */}
                        <View
                            style={{
                                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 20,
                                borderWidth: 1,
                                borderColor: 'rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                }}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                                        Carrier
                                    </Text>
                                    <Text style={{ color: '#6366f1', fontSize: 24, fontWeight: 'bold' }}>
                                        {carrierFreq.toFixed(1)}
                                    </Text>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>Hz</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                                        {selectedMode === 'binaural' ? 'Beat' : 'Pulse'}
                                    </Text>
                                    <Text style={{ color: '#a78bfa', fontSize: 24, fontWeight: 'bold' }}>
                                        {beatFreq.toFixed(2)}
                                    </Text>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>Hz</Text>
                                </View>
                            </View>
                        </View>

                        {/* Mode Selection */}
                        <View style={{ marginBottom: 20 }}>
                            <Text
                                style={{ color: 'white', fontWeight: '600', marginBottom: 12, fontSize: 16 }}
                            >
                                Mode
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {MODES.map((m) => (
                                    <TouchableOpacity
                                        key={m.value}
                                        onPress={() => handleModeChange(m.value)}
                                        style={{
                                            flex: 1,
                                            padding: 16,
                                            borderRadius: 16,
                                            backgroundColor:
                                                selectedMode === m.value
                                                    ? 'rgba(99, 102, 241, 0.3)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                            borderWidth: 1,
                                            borderColor:
                                                selectedMode === m.value ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {m.label}
                                        </Text>
                                        <Text
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.4)',
                                                fontSize: 11,
                                                textAlign: 'center',
                                                marginTop: 4,
                                            }}
                                        >
                                            {m.description}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Waveform Selection */}
                        <View style={{ marginBottom: 20 }}>
                            <Text
                                style={{ color: 'white', fontWeight: '600', marginBottom: 12, fontSize: 16 }}
                            >
                                Waveform
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {WAVEFORMS.map((wf) => (
                                    <TouchableOpacity
                                        key={wf.value}
                                        onPress={() => handleWaveformChange(wf.value)}
                                        style={{
                                            flex: 1,
                                            padding: 12,
                                            borderRadius: 12,
                                            backgroundColor:
                                                selectedWaveform === wf.value
                                                    ? 'rgba(99, 102, 241, 0.3)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                            borderWidth: 1,
                                            borderColor:
                                                selectedWaveform === wf.value ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                            alignItems: 'center',
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={{ color: 'white', fontSize: 20 }}>{wf.icon}</Text>
                                        <Text style={{ color: 'white', fontSize: 11, marginTop: 4 }}>
                                            {wf.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Carrier Frequency Slider */}
                        <View style={{ marginBottom: 16 }}>
                            <View
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>Carrier Frequency</Text>
                                <Text style={{ color: '#6366f1', fontFamily: 'monospace' }}>
                                    {carrierFreq.toFixed(1)} Hz
                                </Text>
                            </View>
                            <Slider
                                value={carrierFreq}
                                onValueChange={handleCarrierChange}
                                minimumValue={20}
                                maximumValue={1000}
                                step={0.1}
                                minimumTrackTintColor="#6366f1"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="#6366f1"
                            />
                        </View>

                        {/* Beat Frequency Slider */}
                        <View style={{ marginBottom: 16 }}>
                            <View
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>
                                    {selectedMode === 'binaural' ? 'Beat' : 'Pulse'} Frequency
                                </Text>
                                <Text style={{ color: '#a78bfa', fontFamily: 'monospace' }}>
                                    {beatFreq.toFixed(2)} Hz
                                </Text>
                            </View>
                            <Slider
                                value={beatFreq}
                                onValueChange={handleBeatChange}
                                minimumValue={0.5}
                                maximumValue={40}
                                step={0.01}
                                minimumTrackTintColor="#a78bfa"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="#a78bfa"
                            />
                            <View
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}
                            >
                                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10 }}>
                                    Delta (0.5-4Hz)
                                </Text>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10 }}>
                                    Gamma (40Hz)
                                </Text>
                            </View>
                        </View>

                        {/* Volume Control */}
                        <View style={{ marginBottom: 20 }}>
                            <View
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Volume2 size={18} color="white" />
                                    <Text style={{ color: 'white', fontWeight: '600' }}>Volume</Text>
                                </View>
                                <Text style={{ color: '#6366f1' }}>{Math.round(volume * 100)}%</Text>
                            </View>
                            <Slider
                                value={volume}
                                onValueChange={handleVolumeChange}
                                minimumValue={0}
                                maximumValue={1}
                                step={0.01}
                                minimumTrackTintColor="#6366f1"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="#6366f1"
                            />
                        </View>

                        {/* Presets */}
                        <View style={{ marginBottom: 32 }}>
                            <Text
                                style={{ color: 'white', fontWeight: '600', marginBottom: 12, fontSize: 16 }}
                            >
                                Quick Presets
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {PRESETS.map((preset) => (
                                    <TouchableOpacity
                                        key={preset.name}
                                        onPress={() => handlePresetSelect(preset)}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 20,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={{ color: 'white', fontWeight: '500' }}>{preset.name}</Text>
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10 }}>
                                            {preset.description}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Spacer for bottom */}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
