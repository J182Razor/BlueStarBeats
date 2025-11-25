import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Clock, TrendingUp } from 'lucide-react-native';
import { PlayerBar } from '../components/PlayerBar';
import { useAudio } from '../contexts/AudioContext';
import { useProgress } from '../contexts/ProgressContext';
import { SESSIONS } from '../lib/sessions';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

export default function LibraryScreen() {
  const router = useRouter();
  const { currentSession, startSession } = useAudio();
  const { recentActivity } = useProgress();

  const favoriteSessions = recentActivity
    .slice(0, 5)
    .map(activity => SESSIONS.find(s => s.id === activity.sessionId))
    .filter(Boolean);

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/60" />
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-center py-6">
              <Text className="text-2xl font-bold text-white">Library</Text>
              <TouchableOpacity
                onPress={() => router.push('/explore')}
                className="p-2"
              >
                <TrendingUp size={24} color="white" />
              </TouchableOpacity>
            </View>

            {favoriteSessions.length > 0 && (
              <>
                <Text className="text-lg font-bold text-white mb-4">Recently Played</Text>
                <View className="gap-3 mb-8">
                  {favoriteSessions.map((session) => (
                    <TouchableOpacity
                      key={session!.id}
                      className="bg-white/5 rounded-2xl p-4 flex-row items-center gap-4 border border-white/10"
                      onPress={async () => {
                        await startSession(session!);
                        router.push('/now-playing');
                      }}
                      activeOpacity={0.7}
                    >
                      <View className="w-12 h-12 rounded-xl items-center justify-center bg-[#B388FF]/20">
                        <BookOpen size={24} color="#B388FF" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-medium">{session!.title}</Text>
                        <Text className="text-white/50 text-xs">{session!.subtitle}</Text>
                      </View>
                      <Clock size={16} color="rgba(255,255,255,0.5)" />
                      <Text className="text-white/50 text-xs">{session!.duration}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text className="text-lg font-bold text-white mb-4">All Sessions</Text>
            <View className="gap-3 mb-24">
              {SESSIONS.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  className="bg-white/5 rounded-2xl p-4 flex-row items-center gap-4 border border-white/10"
                  onPress={async () => {
                    await startSession(session);
                    router.push('/now-playing');
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 rounded-xl items-center justify-center bg-[#B388FF]/20">
                    <BookOpen size={24} color="#B388FF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium">{session.title}</Text>
                    <Text className="text-white/50 text-xs">{session.subtitle}</Text>
                  </View>
                  <Clock size={16} color="rgba(255,255,255,0.5)" />
                  <Text className="text-white/50 text-xs">{session.duration}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
        {currentSession && <PlayerBar />}
      </ImageBackground>
    </View>
  );
}
