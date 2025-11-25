import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Brain, Lightbulb, Leaf } from 'lucide-react-native';
import { GradientBackground } from '../components/GradientBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayerBar } from '../components/PlayerBar';

export default function LibraryScreen() {
    const presets = [
        { id: 1, title: 'Deep Sleep', subtitle: '1.5Hz', icon: Moon },
        { id: 2, title: 'Focus Flow', subtitle: '14Hz', icon: Brain },
        { id: 3, title: 'Creative Boost', subtitle: '8Hz', icon: Lightbulb },
        { id: 4, title: 'Mindful Calm', subtitle: '4Hz', icon: Leaf }
    ];

    return (
        <View className="flex-1">
            <GradientBackground />
            <SafeAreaView className="flex-1">
                <ScrollView className="flex-1 px-4">
                    <View className="flex-row justify-between items-center py-6 mb-2">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center">
                                <View className="w-full h-full rounded-full bg-black/20" />
                            </View>
                            <Text className="text-2xl font-bold text-white">Loyalty Lounge</Text>
                        </View>
                        <TouchableOpacity className="p-2 rounded-full bg-white/10">
                            <Settings size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Gold Card */}
                    <View className="w-full aspect-[1.6] rounded-3xl overflow-hidden mb-8">
                        <LinearGradient
                            colors={['#FBBF24', '#F97316', '#CA8A04']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}
                        >
                            <View />
                            <View>
                                <Text className="text-2xl font-bold text-white mb-1">Alex Rivera</Text>
                                <Text className="text-white/80 font-medium mb-4">Gamma Tier</Text>

                                <View className="flex-row items-end justify-between">
                                    <Text className="text-white/70 text-sm max-w-[60%]">
                                        Unlock exclusive access to Gamma wave frequencies.
                                    </Text>
                                    <TouchableOpacity className="px-6 py-2 bg-accent-purple rounded-full">
                                        <Text className="text-white font-semibold">Unlock ...</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    <Text className="text-lg font-bold text-white mb-4">Your Audio Presets</Text>
                    <View className="flex-row flex-wrap justify-between mb-24">
                        {presets.map((preset) => {
                            const Icon = preset.icon;
                            return (
                                <TouchableOpacity
                                    key={preset.id}
                                    className="w-[48%] bg-white/5 rounded-3xl p-5 mb-4 border border-white/10"
                                >
                                    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mb-4">
                                        <Icon size={20} color="white" />
                                    </View>
                                    <Text className="text-lg font-semibold text-white mb-1">{preset.title}</Text>
                                    <Text className="text-white/50 text-sm">{preset.subtitle}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
            <PlayerBar />
        </View>
    );
}
