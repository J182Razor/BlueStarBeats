import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Settings, Clock, Activity, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PlayerBar } from '../components/PlayerBar';
import { useAudio } from '../contexts/AudioContext';
import { usePremium } from '../contexts/PremiumContext';
import { SESSIONS, Session } from '../lib/sessions';
import { LinearGradient } from 'expo-linear-gradient';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

type TabType = 'for-you' | 'trending' | 'premium';

export default function SessionsScreen() {
  const router = useRouter();
  const { startSession, currentSession } = useAudio();
  const { isPremium, checkPremiumAccess } = usePremium();
  const [activeTab, setActiveTab] = useState<TabType>('for-you');

  const handleSessionPress = async (session: Session) => {
    if (session.premium && !isPremium) {
      router.push('/upgrade');
      return;
    }
    await startSession(session);
    router.push('/now-playing');
  };

  const getFilteredSessions = (): Session[] => {
    switch (activeTab) {
      case 'for-you':
        return SESSIONS.filter(s => !s.premium);
      case 'trending':
        return SESSIONS.slice(0, 5);
      case 'premium':
        return SESSIONS.filter(s => s.premium);
      default:
        return SESSIONS;
    }
  };

  const sessions = getFilteredSessions();

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/60" />
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-4">
            <TouchableOpacity className="p-2">
              <Search size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white">Sessions</Text>
            <TouchableOpacity 
              className="p-2"
              onPress={() => router.push('/profile')}
            >
              <Settings size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row px-4 mb-4 gap-6">
            {(['for-you', 'trending', 'premium'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="pb-2"
              >
                <Text
                  className={`text-base font-medium ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-[#B388FF]'
                      : 'text-[#B388FF]/70'
                  }`}
                  style={{
                    borderBottomWidth: activeTab === tab ? 2 : 0,
                    borderBottomColor: '#B388FF',
                  }}
                >
                  {tab === 'for-you' ? 'For You' : tab === 'trending' ? 'Trending' : 'Premium Peek'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                className="bg-white/5 rounded-3xl p-5 mb-4 border border-white/10 backdrop-blur-sm"
                onPress={() => handleSessionPress(session)}
                activeOpacity={0.7}
              >
                {session.premium && (
                  <View className="absolute top-4 left-4 flex-row items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                    <Star size={12} color="#FCD34D" fill="#FCD34D" />
                    <Text className="text-yellow-300 text-xs font-semibold">PREMIUM</Text>
                  </View>
                )}

                <View className="flex-row items-start justify-between mt-2">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="bg-white/10 px-2 py-1 rounded-full flex-row items-center gap-1">
                        <Activity size={12} color="white" />
                        <Text className="text-white text-xs font-medium">
                          {session.brainwaveType.toUpperCase()}
                        </Text>
                      </View>
                      <View className="bg-white/10 px-2 py-1 rounded-full flex-row items-center gap-1">
                        <Clock size={12} color="white" />
                        <Text className="text-white text-xs font-medium">
                          {session.duration} MIN
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xl font-bold text-white mb-1">{session.title}</Text>
                    <Text className="text-white/70 text-sm">{session.subtitle}</Text>
                  </View>
                  <TouchableOpacity
                    className={`px-6 py-3 rounded-full ${
                      session.premium && !isPremium
                        ? 'bg-yellow-500'
                        : 'bg-[#B388FF]'
                    }`}
                    onPress={() => handleSessionPress(session)}
                  >
                    <Text className="text-white font-semibold text-sm">
                      {session.premium && !isPremium ? 'Unlock Now' : 'Begin Session'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
        {currentSession && <PlayerBar />}
      </ImageBackground>
    </View>
  );
}

