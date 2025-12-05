import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
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
    { value: 'binaural', label: 'Binaural', desc: 'Stereo beats' },
    { value: 'isochronic', label: 'Isochronic', desc: 'Pulsed tones' },
] as const;

const PRESETS = [
    { name: 'Schumann', carrier: 432, beat: 7.83 },
    { name: 'Focus', carrier: 400, beat: 40 },
    { name: 'Relax', carrier: 200, beat: 10 },
    { name: 'Sleep', carrier: 100, beat: 2 },
    { name: 'Meditate', carrier: 150, beat: 6 },
    { name: 'Creative', carrier: 300, beat: 7 },
];

// Animated Visualizer
const FrequencyVisualizer = memo(
    ({ carrier, beat, isPlaying }: { carrier: number; beat: number; isPlaying: boolean }) => {
        const pulseAnim = useRef(new Animated.Value(1)).current;
        const rotateAnim = useRef(new Animated.Value(0)).current;
        const glowAnim = useRef(new Animated.Value(0.3)).current;

        useEffect(() => {
            if (isPlaying) {
                // Pulse animation - speed based on beat frequency (clamped for performance)
                const pulseDuration = Math.max(100, Math.min(2000, 1000 / Math.max(beat, 0.5)));

                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.1,
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

                // Rotation - slower, based on carrier
                Animated.loop(
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: Math.max(3000, 20000 / Math.max(carrier / 50, 1)),
                        easing: Easing.linear,
                        useNativeDriver: true,
                    })
                ).start();

                // Glow pulse
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(glowAnim, {
                            toValue: 1,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(glowAnim, {
                            toValue: 0.3,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            } else {
                pulseAnim.setValue(1);
                rotateAnim.setValue(0);
                glowAnim.setValue(0.3);
            }

            return () => {
                pulseAnim.stopAnimation();
                rotateAnim.stopAnimation();
                glowAnim.stopAnimation();
            };
        }, [isPlaying, beat, carrier]);

        const rotation = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Animated.View
                    style={{
                        width: 160,
                        height: 160,
                        borderRadius: 80,
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{ scale: pulseAnim }, { rotate: rotation }],
                    }}
                >
                    <View
                        style={{
                            position: 'absolute',
                            width: 160,
                            height: 160,
                            borderRadius: 80,
                            borderWidth: 2,
                            borderColor: isPlaying ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                        }}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            borderWidth: 2,
                            borderColor: isPlaying ? '#a78bfa' : 'rgba(167, 139, 250, 0.3)',
                        }}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            borderWidth: 2,
                            borderColor: isPlaying ? '#818cf8' : 'rgba(129, 140, 248, 0.3)',
                        }}
                    />
                    <View
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: isPlaying ? '#6366f1' : 'rgba(99, 102, 241, 0.5)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Waves size={22} color="white" />
                    </View>
                </Animated.View>

                {/* Frequency Display */}
                <View style={{ flexDirection: 'row', marginTop: 14, gap: 28 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#6366f1', fontSize: 20, fontWeight: 'bold' }}>
                            {carrier.toFixed(2)}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Carrier Hz</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#a78bfa', fontSize: 20, fontWeight: 'bold' }}>
                            {beat.toFixed(2)}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Beat Hz</Text>
                    </View>
                </View>
            </View>
        );
    }
);

// Frequency Input Component
const FrequencyInput = memo(
    ({
        label,
        value,
        onChange,
        color = '#6366f1',
    }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
        color?: string;
    }) => {
        const [text, setText] = useState(value.toFixed(3));

        useEffect(() => {
            setText(value.toFixed(3));
        }, [value]);

        const handleSubmit = useCallback(() => {
            const num = parseFloat(text);
            if (!isNaN(num) && num >= 0 && num <= 99999.999) {
                onChange(num);
            } else {
                setText(value.toFixed(3));
            }
        }, [text, value, onChange]);

        return (
            <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>{label}</Text>
                    <Text style={{ color, fontSize: 13 }}>{value.toFixed(3)} Hz</Text>
                </View>
                <TextInput
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 10,
                        padding: 10,
                        color: 'white',
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                    }}
                    value={text}
                    onChangeText={setText}
                    onBlur={handleSubmit}
                    onSubmitEditing={handleSubmit}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                />
                <Slider
                    style={{ marginTop: 6 }}
                    value={Math.min(value, 1000)}
                    onValueChange={onChange}
                    minimumValue={0}
                    maximumValue={1000}
                    step={0.1}
                    minimumTrackTintColor={color}
                    maximumTrackTintColor="rgba(255,255,255,0.15)"
                    thumbTintColor={color}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}>0</Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}>1000 Hz (slider)</Text>
                </View>
            </View>
        );
    }
);

export default function PlayerScreen() {
    const { isPlaying, togglePlayback, audioSettings, updateAudioSettings } = useAudio();

    const [carrier, setCarrier] = useState(audioSettings?.carrierFrequency || 440);
    const [beat, setBeat] = useState(audioSettings?.beatFrequency || 7.83);
    const [volume, setVolume] = useState(audioSettings?.volume || 0.7);
    const [mode, setMode] = useState<'binaural' | 'isochronic'>(audioSettings?.mode || 'binaural');
    const [waveform, setWaveform] = useState(audioSettings?.waveform || 'sine');

    useEffect(() => {
        if (audioSettings) {
            setCarrier(audioSettings.carrierFrequency);
            setBeat(audioSettings.beatFrequency);
            setVolume(audioSettings.volume);
            setMode(audioSettings.mode);
            setWaveform(audioSettings.waveform);
        }
    }, [audioSettings]);

    const handleCarrierChange = useCallback(
        (v: number) => {
            setCarrier(v);
            updateAudioSettings({ carrierFrequency: v });
        },
        [updateAudioSettings]
    );

    const handleBeatChange = useCallback(
        (v: number) => {
            setBeat(v);
            updateAudioSettings({ beatFrequency: v });
        },
        [updateAudioSettings]
    );

    const handleVolumeChange = useCallback(
        (v: number) => {
            setVolume(v);
            updateAudioSettings({ volume: v });
        },
        [updateAudioSettings]
    );

    const handlePreset = useCallback(
        (p: (typeof PRESETS)[0]) => {
            setCarrier(p.carrier);
            setBeat(p.beat);
            updateAudioSettings({ carrierFrequency: p.carrier, beatFrequency: p.beat });
        },
        [updateAudioSettings]
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#191121' }}>
            <ImageBackground source={{ uri: GALAXY_BG }} style={{ flex: 1 }} resizeMode="cover">
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(25, 17, 33, 0.88)',
                    }}
                />
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView
                        style={{ flex: 1, paddingHorizontal: 16 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: 'white',
                                textAlign: 'center',
                                marginTop: 12,
                            }}
                        >
                            Brainwave Entrainment
                        </Text>

                        {/* Animated Visualizer */}
                        <FrequencyVisualizer carrier={carrier} beat={beat} isPlaying={isPlaying} />

                        {/* Play Button */}
                        <TouchableOpacity
                            onPress={togglePlayback}
                            style={{
                                alignSelf: 'center',
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: isPlaying ? '#ef4444' : '#6366f1',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                            }}
                            activeOpacity={0.8}
                        >
                            {isPlaying ? (
                                <Pause size={26} color="white" fill="white" />
                            ) : (
                                <Play size={26} color="white" fill="white" />
                            )}
                        </TouchableOpacity>

                        {/* Mode Selection */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                            {MODES.map((m) => (
                                <TouchableOpacity
                                    key={m.value}
                                    onPress={() => {
                                        setMode(m.value);
                                        updateAudioSettings({ mode: m.value });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 12,
                                        backgroundColor:
                                            mode === m.value ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                                        borderWidth: 1,
                                        borderColor: mode === m.value ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                    }}
                                >
                                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                                        {m.label}
                                    </Text>
                                    <Text
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            textAlign: 'center',
                                            fontSize: 10,
                                            marginTop: 2,
                                        }}
                                    >
                                        {m.desc}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Waveform Selection */}
                        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                            {WAVEFORMS.map((w) => (
                                <TouchableOpacity
                                    key={w.value}
                                    onPress={() => {
                                        setWaveform(w.value);
                                        updateAudioSettings({ waveform: w.value as any });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 10,
                                        backgroundColor:
                                            waveform === w.value
                                                ? 'rgba(99, 102, 241, 0.3)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                        borderWidth: 1,
                                        borderColor: waveform === w.value ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 18 }}>{w.icon}</Text>
                                    <Text style={{ color: 'white', fontSize: 10, marginTop: 2 }}>{w.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Frequency Inputs */}
                        <FrequencyInput
                            label="Carrier Frequency"
                            value={carrier}
                            onChange={handleCarrierChange}
                            color="#6366f1"
                        />
                        <FrequencyInput
                            label="Beat Frequency"
                            value={beat}
                            onChange={handleBeatChange}
                            color="#a78bfa"
                        />

                        {/* Volume */}
                        <View style={{ marginBottom: 14 }}>
                            <View
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Volume2 size={14} color="white" />
                                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Volume</Text>
                                </View>
                                <Text style={{ color: '#6366f1', fontSize: 13 }}>{Math.round(volume * 100)}%</Text>
                            </View>
                            <Slider
                                value={volume}
                                onValueChange={handleVolumeChange}
                                minimumValue={0}
                                maximumValue={1}
                                step={0.01}
                                minimumTrackTintColor="#6366f1"
                                maximumTrackTintColor="rgba(255,255,255,0.15)"
                                thumbTintColor="#6366f1"
                            />
                        </View>

                        {/* Presets */}
                        <Text style={{ color: 'white', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
                            Quick Presets
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 100 }}>
                            {PRESETS.map((p) => (
                                <TouchableOpacity
                                    key={p.name}
                                    onPress={() => handlePreset(p)}
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 16,
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>{p.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
