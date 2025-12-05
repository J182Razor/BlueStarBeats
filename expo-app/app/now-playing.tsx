import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../contexts/AudioContext';
import { useProgress } from '../contexts/ProgressContext';
import Slider from '@react-native-community/slider';

const GALAXY_BG = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=2000';

export default function NowPlayingScreen() {
    const router = useRouter();
    const { currentSession, isPlaying, togglePlayback, setVolume, volume, stopSession } = useAudio();
    const { addSession } = useProgress();
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying) {
            interval = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying]);

    const handleClose = async () => {
        if (currentSession && elapsed > 0) {
            await addSession({
                sessionId: currentSession.id,
                sessionName: currentSession.name,
                category: currentSession.category,
                duration: elapsed,
            });
        }
        await stopSession();
        setElapsed(0);
        router.back();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentSession) {
        return (
            <View style={{ flex: 1, backgroundColor: '#191121', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>No session selected</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: '#6366f1' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                        backgroundColor: 'rgba(25, 17, 33, 0.8)',
                    }}
                />
                <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 16 }}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={{
                                padding: 12,
                                borderRadius: 24,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Session Info */}
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        {/* Visualizer Circle */}
                        <View
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 100,
                                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                borderWidth: 3,
                                borderColor: isPlaying ? '#6366f1' : 'rgba(99, 102, 241, 0.5)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 32,
                            }}
                        >
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>
                                {currentSession.beatFrequency}Hz
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4 }}>
                                {currentSession.mode === 'binaural' ? 'Binaural' : 'Isochronic'}
                            </Text>
                        </View>

                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                            {currentSession.name}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, textAlign: 'center' }}>
                            {currentSession.description}
                        </Text>

                        {/* Timer */}
                        <Text style={{ fontSize: 48, fontWeight: '200', color: 'white', marginTop: 32 }}>
                            {formatTime(elapsed)}
                        </Text>
                    </View>

                    {/* Controls */}
                    <View style={{ paddingBottom: 48 }}>
                        {/* Volume Slider */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 32,
                                paddingHorizontal: 16,
                            }}
                        >
                            <Volume2 size={20} color="rgba(255, 255, 255, 0.5)" />
                            <Slider
                                style={{ flex: 1, marginHorizontal: 16 }}
                                minimumValue={0}
                                maximumValue={1}
                                value={volume}
                                onValueChange={setVolume}
                                minimumTrackTintColor="#6366f1"
                                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                                thumbTintColor="#6366f1"
                            />
                        </View>

                        {/* Playback Controls */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 32,
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    padding: 16,
                                    borderRadius: 32,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <SkipBack size={28} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={togglePlayback}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: '#6366f1',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {isPlaying ? <Pause size={36} color="white" /> : <Play size={36} color="white" />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    padding: 16,
                                    borderRadius: 32,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <SkipForward size={28} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
