import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Target, Flower2, Waves } from 'lucide-react-native';
import { GradientBackground } from '../components/GradientBackground';
import { PlayerBar } from '../components/PlayerBar';

export default function HomeScreen() {
    const categories = [
        { id: 'sleep', title: 'Sleep', subtitle: 'Deep Delta Waves', icon: Moon, color: 'text-indigo-300' },
        { id: 'focus', title: 'Focus', subtitle: '40Hz Gamma', icon: Target, color: 'text-blue-300' },
        { id: 'meditate', title: 'Meditate', subtitle: 'Theta Meditation', icon: Flower2, color: 'text-purple-300' },
        { id: 'relax', title: 'Relax', subtitle: 'Calm Alpha Flow', icon: Waves, color: 'text-teal-300' }
    ];

    return (
        <View className="flex-1">
            <GradientBackground />
            <SafeAreaView className="flex-1">
                <ScrollView className="flex-1 px-4">
                    <View className="flex-row justify-between items-center py-6">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
                                <Text>👤</Text>
                            </View>
                            <Text className="text-2xl font-bold text-white">Good morning, Alex</Text>
                        </View>
                        <TouchableOpacity className="p-2 rounded-full bg-white/10">
                            <Settings size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    className="w-[48%] bg-white/5 rounded-3xl p-5 mb-4 border border-white/10"
                                >
                                    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mb-4">
                                        <Icon size={20} color="white" />
                                    </View>
                                    <Text className="text-lg font-semibold text-white mb-1">{cat.title}</Text>
                                    <Text className="text-white/50 text-sm">{cat.subtitle}</Text>
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
