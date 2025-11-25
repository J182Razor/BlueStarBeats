import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Crown } from 'lucide-react-native';
import { GradientBackground } from '../components/GradientBackground';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    return (
        <View className="flex-1">
            <GradientBackground />
            <SafeAreaView className="flex-1 items-center justify-center px-6">
                <View className="w-24 h-24 rounded-full p-[2px] mb-4">
                    <LinearGradient
                        colors={['#A855F7', '#3B82F6']}
                        style={{ borderRadius: 9999, padding: 2 }}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' }}
                            className="w-full h-full rounded-full border-4 border-black"
                        />
                    </LinearGradient>
                </View>

                <View className="items-center mb-8">
                    <Text className="text-3xl font-bold text-white mb-2">Alex Rivera</Text>
                    <Text className="text-white/50">alex.rivera@example.com</Text>
                </View>

                <View className="w-full max-w-xs gap-4">
                    <TouchableOpacity className="w-full">
                        <LinearGradient
                            colors={['#FDE68A', '#FACC15', '#F59E0B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <Crown size={20} color="black" />
                            <Text className="text-black font-bold">Upgrade to Premium</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex-row items-center justify-center gap-2">
                        <LogOut size={20} color="white" />
                        <Text className="text-white font-medium">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
