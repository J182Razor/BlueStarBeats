import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';
import { sessions, Session } from '../../lib/sessions';

const GALAXY_BG = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=2000';

export default function ExploreScreen() {
    const router = useRouter();
    const { startSession } = useAudio();

    const categories = ['focus', 'relax', 'sleep', 'meditate'] as const;

    const categoryColors: Record<string, string> = {
        focus: '#60a5fa',
        relax: '#2dd4bf',
        sleep: '#818cf8',
        meditate: '#a78bfa',
    };

    const handleSessionPress = async (session: Session) => {
        await startSession(session);
        router.push('/now-playing');
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
                    <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                        {/* Header */}
                        <View style={{ paddingVertical: 24 }}>
                            <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
                                Session Library
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 }}>
                                Find the perfect frequency for your mood
                            </Text>
                        </View>

                        {/* Sessions by Category */}
                        {categories.map((category) => {
                            const categorySessions = sessions.filter((s) => s.category === category);
                            return (
                                <View key={category} style={{ marginBottom: 32 }}>
                                    <Text
                                        style={{
                                            fontSize: 20,
                                            fontWeight: '600',
                                            color: categoryColors[category],
                                            textTransform: 'capitalize',
                                            marginBottom: 12,
                                        }}
                                    >
                                        {category}
                                    </Text>

                                    {categorySessions.map((session) => (
                                        <TouchableOpacity
                                            key={session.id}
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: 16,
                                                padding: 16,
                                                marginBottom: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                borderWidth: 1,
                                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                            }}
                                            onPress={() => handleSessionPress(session)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 24,
                                                    backgroundColor: `${categoryColors[category]}20`,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 16,
                                                }}
                                            >
                                                <Play size={20} color={categoryColors[category]} />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {session.name}
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: 'rgba(255, 255, 255, 0.5)',
                                                        fontSize: 13,
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    {session.description}
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Clock size={14} color="rgba(255, 255, 255, 0.4)" />
                                                <Text
                                                    style={{
                                                        color: 'rgba(255, 255, 255, 0.4)',
                                                        fontSize: 12,
                                                        marginLeft: 4,
                                                    }}
                                                >
                                                    {session.duration}m
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            );
                        })}
                    </ScrollView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
