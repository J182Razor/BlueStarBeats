import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    TextInput,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, Volume2, Waves } from 'lucide-react-native';
import { useAudio } from '../../contexts/AudioContext';
import Slider from '@react-native-community/slider';

const GALAXY_BG =
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2000';

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

// Frequency Visualizer Component
const FrequencyVisualizer = ({
    carrierFreq,
    beatFreq,
    isPlaying,
}: {
    carrierFreq: number;
    beatFreq: number;
    isPlaying: boolean;
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isPlaying) {
            // Pulse animation based on beat frequency
            const pulseDuration = beatFreq > 0 ? 1000 / beatFreq : 1000;
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: pulseDuration / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: pulseDuration / 2,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Rotation based on carrier frequency
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: Math.max(1000, 10000 / Math.max(carrierFreq / 100, 1)),
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            pulseAnim.setValue(1);
            rotateAnim.setValue(0);
        }

        return () => {
            pulseAnim.stopAnimation();
            rotateAnim.stopAnimation();
        };
    }, [isPlaying, beatFreq, carrierFreq]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Animated.View
                style={{
                    width: 180,
                    height: 180,
                    borderRadius: 90,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: pulseAnim }, { rotate: rotation }],
                }}
            >
                {/* Outer ring */}
                <View
                    style={{
                        position: 'absolute',
                        width: 180,
                        height: 180,
                        borderRadius: 90,
                        borderWidth: 2,
                        borderColor: isPlaying ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                    }}
                />
                {/* Middle ring */}
                <View
                    style={{
                        position: 'absolute',
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        borderWidth: 2,
                        borderColor: isPlaying ? '#a78bfa' : 'rgba(167, 139, 250, 0.3)',
                    }}
                />
                {/* Inner ring */}
                <View
                    style={{
                        position: 'absolute',
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        borderWidth: 2,
                        borderColor: isPlaying ? '#818cf8' : 'rgba(129, 140, 248, 0.3)',
                    }}
                />
                {/* Center */}
                <View
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: isPlaying ? '#6366f1' : 'rgba(99, 102, 241, 0.5)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Waves size={24} color="white" />
                </View>
            </Animated.View>
            {/* Frequency labels */}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 24 }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#6366f1', fontSize: 20, fontWeight: 'bold' }}>
                        {carrierFreq.toFixed(2)}
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Carrier Hz</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#a78bfa', fontSize: 20, fontWeight: 'bold' }}>
                        {beatFreq.toFixed(2)}
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Beat Hz</Text>
                </View>
            </View>
        </View>
    );
};

// Number Input Component
const FrequencyInput = ({
    label,
    value,
    onChange,
    color = '#6366f1',
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    color?: string;
}) => {
    const [inputValue, setInputValue] = useState(value.toFixed(3));

    useEffect(() => {
        setInputValue(value.toFixed(3));
    }, [value]);

    const handleChangeText = (text: string) => {
        // Allow only numbers and one decimal point
        const cleaned = text.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
        setInputValue(formatted);
    };

    const handleBlur = () => {
        const num = parseFloat(inputValue);
        if (!isNaN(num) && num >= 0 && num <= 99999.999) {
            onChange(num);
        } else {
            setInputValue(value.toFixed(3));
        }
    };

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: 'white', fontWeight: '600', marginBottom: 8 }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TextInput
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: 12,
                        color: 'white',
                        fontSize: 18,
                        fontFamily: 'monospace',
                        borderWidth: 1,
                        borderColor: color,
                    }}
                    value={inputValue}
                    onChangeText={handleChangeText}
                    onBlur={handleBlur}
                    keyboardType="decimal-pad"
                    placeholder="0.000"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
                <Text style={{ color: color, fontWeight: '600' }}>Hz</Text>
            </View>
            <Slider
                style={{ marginTop: 8 }}
                value={value}
                onValueChange={onChange}
                minimumValue={0}
                maximumValue={99999.999}
                step={0.001}
                minimumTrackTintColor={color}
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor={color}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10 }}>0.000 Hz</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10 }}>99999.999 Hz</Text>
            </View>
        </View>
    );
};

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
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>
                                Brainwave Entrainment
                            </Text>
                        </View>

                        {/* Frequency Visualizer */}
                        <FrequencyVisualizer
                            carrierFreq={carrierFreq}
                            beatFreq={beatFreq}
                            isPlaying={isPlaying}
                        />

                        {/* Play/Pause Button */}
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity
                                onPress={togglePlayback}
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 36,
                                    backgroundColor: isPlaying ? '#ef4444' : '#6366f1',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                activeOpacity={0.8}
                            >
                                {isPlaying ? (
                                    <Pause size={28} color="white" fill="white" />
                                ) : (
                                    <Play size={28} color="white" fill="white" />
                                )}
                            </TouchableOpacity>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: 8, fontSize: 12 }}>
                                {isPlaying ? 'Playing' : 'Tap to Start'}
                            </Text>
                        </View>

                        {/* Mode Selection */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: 'white', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
                                Mode
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {MODES.map((m) => (
                                    <TouchableOpacity
                                        key={m.value}
                                        onPress={() => handleModeChange(m.value)}
                                        style={{
                                            flex: 1,
                                            padding: 12,
                                            borderRadius: 12,
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
                                        <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                                            {m.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Waveform Selection */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: 'white', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
                                Waveform
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                {WAVEFORMS.map((wf) => (
                                    <TouchableOpacity
                                        key={wf.value}
                                        onPress={() => handleWaveformChange(wf.value)}
                                        style={{
                                            flex: 1,
                                            padding: 10,
                                            borderRadius: 10,
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
                                        <Text style={{ color: 'white', fontSize: 18 }}>{wf.icon}</Text>
                                        <Text style={{ color: 'white', fontSize: 10, marginTop: 2 }}>{wf.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Carrier Frequency Input */}
                        <FrequencyInput
                            label="Carrier Frequency"
                            value={carrierFreq}
                            onChange={handleCarrierChange}
                            color="#6366f1"
                        />

                        {/* Beat Frequency Input */}
                        <FrequencyInput
                            label={selectedMode === 'binaural' ? 'Beat Frequency' : 'Pulse Frequency'}
                            value={beatFreq}
                            onChange={handleBeatChange}
                            color="#a78bfa"
                        />

                        {/* Volume Control */}
                        <View style={{ marginBottom: 16 }}>
                            <View
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Volume2 size={16} color="white" />
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
                            <Text style={{ color: 'white', fontWeight: '600', marginBottom: 10, fontSize: 14 }}>
                                Quick Presets
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {PRESETS.map((preset) => (
                                    <TouchableOpacity
                                        key={preset.name}
                                        onPress={() => handlePresetSelect(preset)}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 16,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={{ color: 'white', fontWeight: '500', fontSize: 13 }}>
                                            {preset.name}
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
