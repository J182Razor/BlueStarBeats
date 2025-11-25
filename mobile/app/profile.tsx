import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, Crown, Settings, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremium } from '../contexts/PremiumContext';
import { useProgress } from '../contexts/ProgressContext';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

export default function ProfileScreen() {
  const router = useRouter();
  const { isPremium, subscriptionTier } = usePremium();
  const { stats } = useProgress();

    return (
        <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/60" />
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <View className="items-center py-8">
                <View className="w-24 h-24 rounded-full p-[2px] mb-4">
                    <LinearGradient
                        colors={['#A855F7', '#3B82F6']}
                  style={{ borderRadius: 9999, padding: 2, width: '100%', height: '100%' }}
                >
                  <View className="w-full h-full rounded-full bg-black items-center justify-center">
                    <Text className="text-white text-3xl">👤</Text>
                  </View>
                    </LinearGradient>
                </View>

                <View className="items-center mb-8">
                    <Text className="text-3xl font-bold text-white mb-2">Alex Rivera</Text>
                    <Text className="text-white/50">alex.rivera@example.com</Text>
                {isPremium && (
                  <View className="mt-2 px-4 py-1 bg-yellow-500/20 rounded-full">
                    <Text className="text-yellow-300 text-sm font-semibold">
                      {subscriptionTier.toUpperCase()} Member
                    </Text>
                  </View>
                )}
                </View>

                <View className="w-full max-w-xs gap-4">
                {!isPremium && (
                  <TouchableOpacity
                    onPress={() => router.push('/upgrade')}
                    className="w-full"
                    activeOpacity={0.8}
                  >
                        <LinearGradient
                            colors={['#FDE68A', '#FACC15', '#F59E0B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                        >
                            <Crown size={20} color="black" />
                            <Text className="text-black font-bold">Upgrade to Premium</Text>
                        </LinearGradient>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => router.push('/explore')}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex-row items-center justify-center gap-2"
                  activeOpacity={0.7}
                >
                  <TrendingUp size={20} color="white" />
                  <Text className="text-white font-medium">View Progress</Text>
                </TouchableOpacity>

                <TouchableOpacity className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex-row items-center justify-center gap-2">
                  <Settings size={20} color="white" />
                  <Text className="text-white font-medium">Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex-row items-center justify-center gap-2">
                        <LogOut size={20} color="white" />
                        <Text className="text-white font-medium">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </ScrollView>
            </SafeAreaView>
      </ImageBackground>
        </View>
    );
}
