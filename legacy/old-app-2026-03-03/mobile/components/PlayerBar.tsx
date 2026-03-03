import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Pause } from 'lucide-react-native';
import { useAudio } from '../contexts/AudioContext';

export const PlayerBar = () => {
  const router = useRouter();
  const { isPlaying, currentSession, togglePlayback } = useAudio();

  if (!currentSession) return null;

    return (
    <TouchableOpacity
      onPress={() => router.push('/now-playing')}
      className="absolute bottom-24 left-4 right-4 bg-white/10 rounded-3xl p-4 flex-row items-center border border-white/10 backdrop-blur-sm"
      activeOpacity={0.8}
    >
            <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=200',
        }}
                className="w-12 h-12 rounded-xl"
            />

            <View className="flex-1 ml-4">
        <Text className="text-white font-semibold" numberOfLines={1}>
          {currentSession.subtitle || currentSession.title}
        </Text>
        <Text className="text-white/50 text-xs" numberOfLines={1}>
          {currentSession.category} Session
        </Text>
            </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          togglePlayback();
        }}
        className="w-10 h-10 rounded-full bg-[#B388FF] items-center justify-center"
        activeOpacity={0.8}
      >
        {isPlaying ? (
          <Pause size={20} color="white" fill="white" />
        ) : (
                <Play size={20} color="white" fill="white" />
        )}
      </TouchableOpacity>
            </TouchableOpacity>
    );
};
