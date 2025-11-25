import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Target, Flower2, Waves } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../components/GradientBackground';
import { PlayerBar } from '../components/PlayerBar';
import { useAudio } from '../contexts/AudioContext';
import { getSessionsByCategory } from '../lib/sessions';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

export default function HomeScreen() {
  const router = useRouter();
  const { startSession, currentSession } = useAudio();

    const categories = [
    { 
      id: 'sleep', 
      title: 'Sleep', 
      subtitle: 'Deep Delta Waves', 
      icon: Moon, 
      color: 'text-indigo-300',
      session: getSessionsByCategory('sleep')[0]
    },
    { 
      id: 'focus', 
      title: 'Focus', 
      subtitle: '40Hz Gamma\nBinaural', 
      icon: Target, 
      color: 'text-blue-300',
      session: getSessionsByCategory('focus')[0]
    },
    { 
      id: 'meditate', 
      title: 'Meditate', 
      subtitle: 'Theta Meditation', 
      icon: Flower2, 
      color: 'text-purple-300',
      session: getSessionsByCategory('meditate')[0]
    },
    { 
      id: 'relax', 
      title: 'Relax', 
      subtitle: 'Calm Alpha Flow', 
      icon: Waves, 
      color: 'text-teal-300',
      session: getSessionsByCategory('relax')[0]
    }
    ];

  const handleCategoryPress = async (category: typeof categories[0]) => {
    if (category.session) {
      await startSession(category.session);
      router.push('/now-playing');
    }
  };

    return (
        <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/60" />
            <SafeAreaView className="flex-1">
                <ScrollView className="flex-1 px-4">
                    <View className="flex-row justify-between items-center py-6">
                        <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
                  <Text className="text-white text-lg">👤</Text>
                            </View>
                            <Text className="text-2xl font-bold text-white">Good morning, Alex</Text>
                        </View>
              <TouchableOpacity 
                className="p-2 rounded-full bg-white/10 border border-white/20"
                onPress={() => router.push('/profile')}
              >
                            <Settings size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                    className="w-[48%] bg-white/5 rounded-3xl p-5 mb-4 border border-white/10 backdrop-blur-sm"
                    onPress={() => handleCategoryPress(cat)}
                    activeOpacity={0.7}
                                >
                    <View className="w-12 h-12 rounded-full bg-white/5 items-center justify-center mb-4">
                      <Icon size={24} color="white" />
                                    </View>
                                    <Text className="text-lg font-semibold text-white mb-1">{cat.title}</Text>
                                    <Text className="text-white/50 text-sm">{cat.subtitle}</Text>
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
