import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Target, Flower2, Waves } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';

const GALAXY_BG =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000';

// Pre-defined category presets
const CATEGORIES = [
  {
    id: 'sleep',
    title: 'Sleep',
    subtitle: 'Deep Delta Waves',
    icon: Moon,
    color: '#818cf8',
    carrier: 100,
    beat: 2,
  },
  {
    id: 'focus',
    title: 'Focus',
    subtitle: '40Hz Gamma Binaural',
    icon: Target,
    color: '#60a5fa',
    carrier: 400,
    beat: 40,
  },
  {
    id: 'meditate',
    title: 'Meditate',
    subtitle: 'Theta Meditation',
    icon: Flower2,
    color: '#a78bfa',
    carrier: 150,
    beat: 6,
  },
  {
    id: 'relax',
    title: 'Relax',
    subtitle: 'Calm Alpha Flow',
    icon: Waves,
    color: '#2dd4bf',
    carrier: 200,
    beat: 10,
  },
] as const;

type Category = (typeof CATEGORIES)[number];

// Memoized category card
const CategoryCard = memo(
  ({ category, onPress }: { category: Category; onPress: () => void }) => {
    const Icon = category.icon;
    return (
      <TouchableOpacity
        style={{
          width: '48%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 20,
          padding: 18,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Icon size={22} color={category.color} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '600', color: 'white', marginBottom: 4 }}>
          {category.title}
        </Text>
        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}>
          {category.subtitle}
        </Text>
      </TouchableOpacity>
    );
  }
);

// Featured preset component
const FeaturedPreset = memo(({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={{
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.3)',
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={{ fontSize: 17, fontWeight: '600', color: 'white', marginBottom: 6 }}>
      Schumann Resonance
    </Text>
    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
      7.83Hz - Earth's natural healing frequency
    </Text>
  </TouchableOpacity>
));

export default function HomeScreen() {
  const router = useRouter();
  const { updateAudioSettings, togglePlayback, isPlaying } = useAudio();

  // Memoized handler
  const handleCategoryPress = useCallback(
    (category: Category) => {
      updateAudioSettings({
        carrierFrequency: category.carrier,
        beatFrequency: category.beat,
      });
      if (!isPlaying) {
        togglePlayback();
      }
      router.push('/(tabs)/player');
    },
    [updateAudioSettings, togglePlayback, isPlaying, router]
  );

  const handleSchumannPress = useCallback(() => {
    updateAudioSettings({
      carrierFrequency: 432,
      beatFrequency: 7.83,
    });
    if (!isPlaying) {
      togglePlayback();
    }
    router.push('/(tabs)/player');
  }, [updateAudioSettings, togglePlayback, isPlaying, router]);

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={{ uri: GALAXY_BG }} style={{ flex: 1 }} resizeMode="cover">
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(25, 17, 33, 0.7)',
          }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
                {greeting}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, fontSize: 14 }}>
                Select a preset to start
              </Text>
            </View>

            {/* Category Grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onPress={() => handleCategoryPress(cat)}
                />
              ))}
            </View>

            {/* Featured Section */}
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 12,
                }}
              >
                Featured
              </Text>
              <FeaturedPreset onPress={handleSchumannPress} />
            </View>

            {/* Quick tip */}
            <View
              style={{
                marginTop: 20,
                padding: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                💡 Tip: Use headphones for best binaural beats experience
              </Text>
            </View>

            {/* Spacer */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
