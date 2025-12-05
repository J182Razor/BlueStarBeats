import React, { useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Moon, Brain, Heart, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';

const GALAXY_BG =
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=2000';

const PRESETS = [
    { id: '1', name: 'Deep Sleep', desc: 'Delta waves', carrier: 100, beat: 2, color: '#818cf8', icon: Moon },
    { id: '2', name: 'Dream State', desc: 'Light delta', carrier: 120, beat: 3.5, color: '#818cf8', icon: Moon },
    { id: '3', name: 'Meditation', desc: 'Theta waves', carrier: 150, beat: 6, color: '#a78bfa', icon: Sparkles },
    { id: '4', name: 'Schumann', desc: "Earth's frequency", carrier: 432, beat: 7.83, color: '#a78bfa', icon: Sparkles },
    { id: '5', name: 'Creativity', desc: 'Theta/Alpha', carrier: 300, beat: 7, color: '#a78bfa', icon: Sparkles },
    { id: '6', name: 'Relaxation', desc: 'Alpha waves', carrier: 200, beat: 10, color: '#2dd4bf', icon: Heart },
    { id: '7', name: 'Stress Relief', desc: 'Calm alpha', carrier: 250, beat: 9, color: '#2dd4bf', icon: Heart },
    { id: '8', name: 'Focus', desc: 'Beta waves', carrier: 300, beat: 15, color: '#60a5fa', icon: Brain },
    { id: '9', name: 'Study Mode', desc: 'High beta', carrier: 350, beat: 18, color: '#60a5fa', icon: Brain },
    { id: '10', name: 'Deep Focus', desc: 'Gamma waves', carrier: 400, beat: 40, color: '#60a5fa', icon: Brain },
    { id: '11', name: 'Peak Performance', desc: 'High gamma', carrier: 450, beat: 45, color: '#60a5fa', icon: Brain },
];

type Preset = (typeof PRESETS)[number];

const PresetItem = memo(({ item, onPress }: { item: Preset; onPress: () => void }) => {
    const Icon = item.icon;
    return (
        <TouchableOpacity
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${item.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                }}
            >
                <Icon size={18} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>{item.name}</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                    {item.beat} Hz · {item.desc}
                </Text>
            </View>
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: item.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Play size={16} color="white" fill="white" />
            </View>
        </TouchableOpacity>
    );
});

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
                    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Preset Library</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, fontSize: 13 }}>
                            Tap any preset to start playing
                        </Text>
                    </View>
                    <FlatList
                        data={PRESETS}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={8}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={true}
                    />
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
