import React, { useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';

const GALAXY_BG =
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=2000';

const PRESETS = [
    { id: '1', name: 'Deep Sleep', carrier: 100, beat: 2, color: '#818cf8' },
    { id: '2', name: 'Dream State', carrier: 120, beat: 3.5, color: '#818cf8' },
    { id: '3', name: 'Meditation', carrier: 150, beat: 6, color: '#a78bfa' },
    { id: '4', name: 'Schumann', carrier: 432, beat: 7.83, color: '#a78bfa' },
    { id: '5', name: 'Relaxation', carrier: 200, beat: 10, color: '#2dd4bf' },
    { id: '6', name: 'Stress Relief', carrier: 250, beat: 9, color: '#2dd4bf' },
    { id: '7', name: 'Focus', carrier: 300, beat: 15, color: '#60a5fa' },
    { id: '8', name: 'Study Mode', carrier: 350, beat: 18, color: '#60a5fa' },
    { id: '9', name: 'Deep Focus', carrier: 400, beat: 40, color: '#60a5fa' },
];

type Preset = (typeof PRESETS)[0];

const PresetItem = memo(({ item, onPress }: { item: Preset; onPress: () => void }) => (
    <TouchableOpacity
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 14,
            padding: 12,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>{item.name}</Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginTop: 2 }}>
                {item.beat} Hz
            </Text>
        </View>
        <View
            style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: item.color,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Play size={14} color="white" fill="white" />
        </View>
    </TouchableOpacity>
));

export default function LibraryScreen() {
    const router = useRouter();
    const { updateAudioSettings, togglePlayback, isPlaying } = useAudio();

    const handlePress = useCallback(
        (p: Preset) => {
            updateAudioSettings({ carrierFrequency: p.carrier, beatFrequency: p.beat });
            if (!isPlaying) togglePlayback();
            router.push('/(tabs)/player');
        },
        [updateAudioSettings, togglePlayback, isPlaying, router]
    );

    const renderItem = useCallback(
        ({ item }: { item: Preset }) => <PresetItem item={item} onPress={() => handlePress(item)} />,
        [handlePress]
    );

    const keyExtractor = useCallback((item: Preset) => item.id, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#191121' }}>
            <ImageBackground source={{ uri: GALAXY_BG }} style={{ flex: 1 }} resizeMode="cover">
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(25, 17, 33, 0.85)' }} />
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Preset Library</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, fontSize: 12 }}>
                            Tap to play instantly
                        </Text>
                    </View>
                    <FlatList
                        data={PRESETS}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        removeClippedSubviews={true}
                    />
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
