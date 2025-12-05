import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    TextInput,
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
    { value: 'binaural', label: 'Binaural' },
    { value: 'isochronic', label: 'Isochronic' },
] as const;

const PRESETS = [
    { name: 'Schumann', carrier: 432, beat: 7.83 },
    { name: 'Focus', carrier: 400, beat: 40 },
    { name: 'Relax', carrier: 200, beat: 10 },
    { name: 'Sleep', carrier: 100, beat: 2 },
    { name: 'Meditate', carrier: 150, beat: 6 },
];

// Simple frequency display - no animations
const FrequencyDisplay = memo(
    ({ carrier, beat, isPlaying }: { carrier: number; beat: number; isPlaying: boolean }) => (
        <View
            style={{
                alignItems: 'center',
                marginBottom: 16,
                padding: 20,
                backgroundColor: isPlaying ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isPlaying ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
            }}
        >
            <Waves size={28} color={isPlaying ? '#6366f1' : '#6b7280'} />
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 32 }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#6366f1', fontSize: 22, fontWeight: 'bold' }}>
                        {carrier.toFixed(2)}
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Carrier Hz</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#a78bfa', fontSize: 22, fontWeight: 'bold' }}>
                        {beat.toFixed(2)}
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Beat Hz</Text>
                </View>
            </View>
        </View>
    )
);

// Simple frequency input with text and slider
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
            <View style={{ marginBottom: 14 }}>
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
                        inset: 0,
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
                                marginVertical: 14,
                            }}
                        >
                            Brainwave Player
                        </Text>

                        {/* Frequency Display */}
                        <FrequencyDisplay carrier={carrier} beat={beat} isPlaying={isPlaying} />

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

                        {/* Mode */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                            {MODES.map((m) => (
                                <TouchableOpacity
                                    key={m.value}
                                    onPress={() => {
                                        setMode(m.value);
                                        updateAudioSettings({ mode: m.value });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 10,
                                        backgroundColor:
                                            mode === m.value ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                                        borderWidth: 1,
                                        borderColor: mode === m.value ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                    }}
                                >
                                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                                        {m.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Waveform */}
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
                                        padding: 8,
                                        borderRadius: 8,
                                        backgroundColor:
                                            waveform === w.value
                                                ? 'rgba(99, 102, 241, 0.3)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                        borderWidth: 1,
                                        borderColor: waveform === w.value ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 16 }}>{w.icon}</Text>
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
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 80 }}>
                            {PRESETS.map((p) => (
                                <TouchableOpacity
                                    key={p.name}
                                    onPress={() => handlePreset(p)}
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 14,
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
