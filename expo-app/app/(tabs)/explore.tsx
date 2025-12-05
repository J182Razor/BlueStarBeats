import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Waves, Moon, Brain, Sparkles, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';

const GALAXY_BG =
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=2000';

// Pre-defined frequency presets for brainwave entrainment
const PRESETS = [
    // Delta (0.5-4 Hz) - Deep Sleep
    { id: 'd1', name: 'Deep Sleep', carrier: 100, beat: 2, category: 'sleep', icon: 'moon', description: 'Delta waves for restorative sleep' },
    { id: 'd2', name: 'Dream State', carrier: 120, beat: 3.5, category: 'sleep', icon: 'moon', description: 'Deep relaxation and dreaming' },

    // Theta (4-8 Hz) - Meditation, Creativity
    { id: 't1', name: 'Meditation', carrier: 150, beat: 6, category: 'meditate', icon: 'sparkles', description: 'Theta waves for deep meditation' },
    { id: 't2', name: 'Creativity', carrier: 200, beat: 7, category: 'meditate', icon: 'sparkles', description: 'Enhanced creative thinking' },
    { id: 't3', name: 'Schumann', carrier: 432, beat: 7.83, category: 'meditate', icon: 'sparkles', description: "Earth's natural frequency" },

    // Alpha (8-12 Hz) - Relaxation
    { id: 'a1', name: 'Relaxation', carrier: 200, beat: 10, category: 'relax', icon: 'heart', description: 'Alpha waves for calm alertness' },
    { id: 'a2', name: 'Stress Relief', carrier: 250, beat: 9, category: 'relax', icon: 'heart', description: 'Reduce anxiety and tension' },
    { id: 'a3', name: 'Light Meditation', carrier: 180, beat: 11, category: 'relax', icon: 'heart', description: 'Gentle relaxation state' },

    // Beta (12-40 Hz) - Focus, Concentration
    { id: 'b1', name: 'Focus', carrier: 300, beat: 15, category: 'focus', icon: 'brain', description: 'Beta waves for concentration' },
    { id: 'b2', name: 'Study Mode', carrier: 350, beat: 18, category: 'focus', icon: 'brain', description: 'Enhanced learning and memory' },
    { id: 'b3', name: 'Alert Mind', carrier: 400, beat: 20, category: 'focus', icon: 'brain', description: 'Mental clarity and alertness' },

    // Gamma (40+ Hz) - Peak Performance
    { id: 'g1', name: 'Deep Focus', carrier: 400, beat: 40, category: 'focus', icon: 'brain', description: 'Gamma waves for peak performance' },
    { id: 'g2', name: 'Problem Solving', carrier: 450, beat: 45, category: 'focus', icon: 'brain', description: 'Enhanced cognitive function' },
] as const;

type Preset = (typeof PRESETS)[number];

const categoryColors: Record<string, string> = {
    focus: '#60a5fa',
    relax: '#2dd4bf',
    sleep: '#818cf8',
    meditate: '#a78bfa',
};

const categoryIcons: Record<string, React.ComponentType<any>> = {
    moon: Moon,
    brain: Brain,
    sparkles: Sparkles,
    heart: Heart,
};

// Memoized preset item for performance
const PresetItem = memo(({ item, onPress }: { item: Preset; onPress: () => void }) => {
    const IconComponent = categoryIcons[item.icon] || Waves;
    const color = categoryColors[item.category];

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
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: `${color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                }}
            >
                <IconComponent size={20} color={color} />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: 'white', marginBottom: 2 }}>
                    {item.name}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }} numberOfLines={1}>
                    {item.beat} Hz · {item.description}
                </Text>
            </View>

            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Play size={16} color="white" fill="white" />
            </View>
        </TouchableOpacity>
    );
});

// Category header component
const CategoryHeader = memo(({ category }: { category: string }) => (
    <Text
        style={{
            fontSize: 18,
            fontWeight: '600',
            color: categoryColors[category],
            textTransform: 'capitalize',
            marginTop: 16,
            marginBottom: 10,
        }}
    >
        {category}
    </Text>
));

export default function LibraryScreen() {
    const router = useRouter();
    const { updateAudioSettings, togglePlayback, isPlaying } = useAudio();

    // Memoized handler for preset selection
    const handlePresetPress = useCallback(
        (preset: Preset) => {
            // Update audio settings with preset values
            updateAudioSettings({
                carrierFrequency: preset.carrier,
                beatFrequency: preset.beat,
            });

            // Start playback if not already playing
            if (!isPlaying) {
                togglePlayback();
            }

            // Navigate to Player tab
            router.push('/(tabs)/player');
        },
        [updateAudioSettings, togglePlayback, isPlaying, router]
    );

    // Group presets by category for display
    const groupedPresets = useMemo(() => {
        const categories = ['focus', 'relax', 'sleep', 'meditate'];
        return categories.map((cat) => ({
            category: cat,
            data: PRESETS.filter((p) => p.category === cat),
        }));
    }, []);

    // Render item with memoized callback
    const renderItem = useCallback(
        ({ item }: { item: Preset }) => (
            <PresetItem item={item} onPress={() => handlePresetPress(item)} />
        ),
        [handlePresetPress]
    );

    const keyExtractor = useCallback((item: Preset) => item.id, []);

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
                    {/* Header */}
                    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
                            Preset Library
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, fontSize: 13 }}>
                            Tap any preset to start playing instantly
                        </Text>
                    </View>

                    {/* Presets List - Using FlatList for performance */}
                    <FlatList
                        data={PRESETS}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={8}
                        maxToRenderPerBatch={8}
                        windowSize={5}
                        removeClippedSubviews={true}
                        getItemLayout={(_, index) => ({
                            length: 78,
                            offset: 78 * index,
                            index,
                        })}
                    />
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
