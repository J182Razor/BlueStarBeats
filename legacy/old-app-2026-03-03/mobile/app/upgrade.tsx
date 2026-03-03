import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, Download, TrendingUp, Sparkles } from 'lucide-react-native';
import { usePremium } from '../contexts/PremiumContext';
import { LinearGradient } from 'expo-linear-gradient';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

type PlanType = 'monthly' | 'annual' | 'lifetime';

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  savings?: string;
  popular?: boolean;
}

export default function UpgradeScreen() {
  const router = useRouter();
  const { setSubscriptionTier } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'MONTHLY',
      price: '$12.99',
      period: 'per month',
    },
    {
      id: 'annual',
      name: 'ANNUAL',
      price: '$69.99',
      period: 'Save 55%',
      savings: 'Save 55%',
      popular: true,
    },
    {
      id: 'lifetime',
      name: 'LIFETIME',
      price: '$199.99',
      period: 'one-time',
    },
  ];

  const features = [
    { icon: Sparkles, text: 'Unlimited access to all brainwave sessions' },
    { icon: TrendingUp, text: 'Exclusive guided meditations & courses' },
    { icon: Download, text: 'Offline mode for mindful journeys' },
    { icon: TrendingUp, text: 'Advanced session tracking & insights' },
  ];

  const handleUpgrade = async () => {
    await setSubscriptionTier(selectedPlan);
    router.back();
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/80" />
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-end mb-6">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-bold text-white mb-2 text-center">
              Unlock Your Full Potential
            </Text>
            <Text className="text-white/70 text-center mb-8">
              Experience unlimited access to our entire library of transformative soundscapes.
            </Text>

            {/* Features */}
            <View className="mb-8 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <View key={index} className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-full bg-[#B388FF]/20 items-center justify-center">
                      <Icon size={20} color="#B388FF" />
                    </View>
                    <Text className="text-white/90 flex-1">{feature.text}</Text>
                  </View>
                );
              })}
            </View>

            {/* Pricing Plans */}
            <View className="flex-row gap-4 mb-6">
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  className="flex-1"
                  activeOpacity={0.8}
                >
                  {plan.popular && (
                    <View className="bg-[#B388FF] px-3 py-1 rounded-t-lg mb-[-1]">
                      <Text className="text-white text-xs font-bold text-center">MOST POPULAR</Text>
                    </View>
                  )}
                  <View
                    className={`rounded-2xl p-4 border-2 ${
                      selectedPlan === plan.id
                        ? 'border-[#B388FF] bg-[#B388FF]/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <Text className="text-white/70 text-xs font-semibold mb-2">{plan.name}</Text>
                    <Text className="text-2xl font-bold text-white mb-1">{plan.price}</Text>
                    <Text className="text-white/50 text-xs">{plan.period}</Text>
                    {plan.savings && (
                      <Text className="text-[#B388FF] text-xs font-semibold mt-1">{plan.savings}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Upgrade Button */}
            <TouchableOpacity
              onPress={handleUpgrade}
              className="mb-4"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FCD34D', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  padding: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                }}
              >
                <Text className="text-black font-bold text-lg">Upgrade Now</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text className="text-white/50 text-xs text-center mb-8">
              Your free 7-day trial begins upon confirmation. Cancel anytime.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

