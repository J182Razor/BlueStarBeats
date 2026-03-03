import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Brain, Lightbulb, Leaf, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PlayerBar } from '../components/PlayerBar';
import { useAudio } from '../contexts/AudioContext';
import { LinearGradient } from 'expo-linear-gradient';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

export default function LoungeScreen() {
  const router = useRouter();
  const { currentSession, startSession } = useAudio();

  const presets = [
    { id: 'deep-sleep', title: 'Deep Sleep', subtitle: '1.5Hz', icon: Moon, freq: 1.5 },
    { id: 'focus-flow', title: 'Focus Flow', subtitle: '14Hz', icon: Brain, freq: 14 },
    { id: 'creative-boost', title: 'Creative Boost', subtitle: '8Hz', icon: Lightbulb, freq: 8 },
    { id: 'mindful-calm', title: 'Mindful Calm', subtitle: '4Hz', icon: Leaf, freq: 4 },
  ];

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
            <View className="flex-row justify-between items-center py-6 mb-2">
              <View className="flex-row items-center gap-3">
                <LinearGradient
                  colors={['#F97316', '#B388FF']}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
                <Text className="text-2xl font-bold text-white">Loyalty Lounge</Text>
              </View>
              <TouchableOpacity 
                className="p-2 rounded-full bg-white/10"
                onPress={() => router.push('/profile')}
              >
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
                    <TouchableOpacity 
                      className="px-6 py-2 bg-[#B388FF] rounded-full"
                      onPress={() => router.push('/upgrade')}
                    >
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
                    onPress={async () => {
                      // Create a session from preset
                      const session = {
                        id: preset.id,
                        title: preset.title,
                        subtitle: preset.subtitle,
                        description: '',
                        category: 'focus' as const,
                        brainwaveType: 'alpha' as const,
                        duration: 30,
                        carrierFrequency: 200,
                        beatFrequency: preset.freq,
                        waveform: 'sine' as const,
                        mode: 'binaural' as const,
                        premium: false,
                      };
                      await startSession(session);
                      router.push('/now-playing');
                    }}
                    activeOpacity={0.7}
                  >
                    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mb-4">
                      <Icon size={20} color="#B388FF" />
                    </View>
                    <Text className="text-lg font-semibold text-white mb-1">{preset.title}</Text>
                    <Text className="text-white/50 text-sm">{preset.subtitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
        {currentSession && <PlayerBar />}
      </ImageBackground>
    </View>
  );
}

