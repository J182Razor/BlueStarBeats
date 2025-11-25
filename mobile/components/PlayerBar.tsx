import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Play } from 'lucide-react-native';

export const PlayerBar = () => {
    return (
        <View className="absolute bottom-24 left-4 right-4 bg-white/10 rounded-3xl p-4 flex-row items-center border border-white/10">
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=200' }}
                className="w-12 h-12 rounded-xl"
            />

            <View className="flex-1 ml-4">
                <Text className="text-white font-semibold">Deep Delta Waves</Text>
                <Text className="text-white/50 text-xs">Sleep Session</Text>
            </View>

            <TouchableOpacity className="w-10 h-10 rounded-full bg-accent-purple items-center justify-center">
                <Play size={20} color="white" fill="white" />
            </TouchableOpacity>
        </View>
    );
};
