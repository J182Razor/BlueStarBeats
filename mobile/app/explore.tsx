import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, Activity, Moon, Zap } from 'lucide-react-native';
import { GradientBackground } from '../components/GradientBackground';
import { PlayerBar } from '../components/PlayerBar';

export default function ExploreScreen() {
    const recentActivity = [
        { id: 1, title: 'Alpha Waves for Creativity', subtitle: 'Deep Focus • 30 min • 2 days ago', icon: Activity },
        { id: 2, title: 'Theta for Deep Meditation', subtitle: 'Meditation • 45 min • Yesterday', icon: Zap },
        { id: 3, title: 'Binaural Beats for Sleep', subtitle: 'Sleep • 60 min • 4 days ago', icon: Moon }
    ];

    return (
        <View className="flex-1">
            <GradientBackground />
            <SafeAreaView className="flex-1">
                <ScrollView className="flex-1 px-4">
                    <View className="flex-row items-center py-6 mb-6">
                        <TouchableOpacity className="p-2 rounded-full bg-white/10 mr-4">
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-white flex-1 text-center pr-10">Progress Dashboard</Text>
                    </View>

                    {/* Circular Progress Section */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1 bg-white/5 rounded-3xl p-4 items-center aspect-square justify-center border border-white/10">
                            <View className="w-24 h-24 rounded-full border-4 border-accent-purple items-center justify-center">
                                <Text className="text-2xl font-bold text-white">5/7</Text>
                                <Text className="text-xs text-white/50">Days</Text>
                            </View>
                            <Text className="text-sm font-medium text-white mt-2">Current Streak</Text>
                        </View>

                        <View className="flex-1 bg-white/5 rounded-3xl p-4 items-center aspect-square justify-center border border-white/10">
                            <View className="w-24 h-24 rounded-full border-4 border-accent-cyan items-center justify-center">
                                <Text className="text-2xl font-bold text-white">12h</Text>
                                <Text className="text-xs text-white/50">30m</Text>
                            </View>
                            <Text className="text-sm font-medium text-white mt-2">Time Meditated</Text>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row gap-4 mb-8">
                        <View className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10">
                            <Text className="text-white/50 text-sm mb-1">Total Sessions</Text>
                            <Text className="text-3xl font-bold text-white">42</Text>
                        </View>
                        <View className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10">
                            <Text className="text-white/50 text-sm mb-1">Favorite</Text>
                            <Text className="text-2xl font-bold text-white">Focus</Text>
                        </View>
                    </View>

                    {/* Recent Activity */}
                    <Text className="text-lg font-bold text-white mb-4">Recent Activity</Text>
                    <View className="gap-3 mb-24">
                        {recentActivity.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <View key={activity.id} className="bg-white/5 rounded-2xl p-4 flex-row items-center gap-4 border border-white/10">
                                    <View className="w-12 h-12 rounded-xl items-center justify-center bg-white/10">
                                        <Icon size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-medium" numberOfLines={1}>{activity.title}</Text>
                                        <Text className="text-white/50 text-xs">{activity.subtitle}</Text>
                                    </View>
                                    <TouchableOpacity className="px-3 py-1.5 rounded-lg bg-white/5 flex-row items-center gap-2">
                                        <FileText size={14} color="rgba(255,255,255,0.7)" />
                                        <Text className="text-xs text-white/70">Notes</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
            <PlayerBar />
        </View>
    );
}
