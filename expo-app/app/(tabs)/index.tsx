import React, { useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Target, Flower2, Waves, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';

const GALAXY_BG =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000';

const CATEGORIES = [
  { id: 'sleep', title: 'Sleep', subtitle: 'Delta Waves', icon: Moon, color: '#818cf8', carrier: 100, beat: 2 },
  { id: 'focus', title: 'Focus', subtitle: 'Gamma Waves', icon: Target, color: '#60a5fa', carrier: 400, beat: 40 },
  { id: 'meditate', title: 'Meditate', subtitle: 'Theta Waves', icon: Flower2, color: '#a78bfa', carrier: 150, beat: 6 },
  { id: 'relax', title: 'Relax', subtitle: 'Alpha Waves', icon: Waves, color: '#2dd4bf', carrier: 200, beat: 10 },
];

type Category = (typeof CATEGORIES)[number];

const CategoryCard = memo(({ item, onPress }: { item: Category; onPress: () => void }) => {
  const Icon = item.icon;
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
          backgroundColor: `${item.color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Icon size={22} color={item.color} />
      </View>
      <Text style={{ fontSize: 17, fontWeight: '600', color: 'white', marginBottom: 4 }}>
        {item.title}
      </Text>
      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}>{item.subtitle}</Text>
    </TouchableOpacity>
  );
});

const FeaturedCard = memo(({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={{
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderRadius: 18,
      padding: 18,
      marginTop: 8,
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Schumann Resonance</Text>
      <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginTop: 4 }}>
        7.83Hz - Earth's healing frequency
      </Text>
    </View>
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Play size={18} color="white" fill="white" />
    </View>
  </TouchableOpacity>
));

export default function HomeScreen() {
  const router = useRouter();
  const { updateAudioSettings, togglePlayback, isPlaying } = useAudio();

  const handlePress = useCallback(
    (cat: Category) => {
      updateAudioSettings({ carrierFrequency: cat.carrier, beatFrequency: cat.beat });
      if (!isPlaying) togglePlayback();
      router.push('/(tabs)/player');
    },
    [updateAudioSettings, togglePlayback, isPlaying, router]
  );

  const handleSchumann = useCallback(() => {
    updateAudioSettings({ carrierFrequency: 432, beatFrequency: 7.83 });
    if (!isPlaying) togglePlayback();
    router.push('/(tabs)/player');
  }, [updateAudioSettings, togglePlayback, isPlaying, router]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{ flex: 1, backgroundColor: '#191121' }}>
      <ImageBackground source={{ uri: GALAXY_BG }} style={{ flex: 1 }} resizeMode="cover">
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(25, 17, 33, 0.75)',
          }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>{greeting}</Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, fontSize: 14 }}>
                Select a preset to begin
              </Text>
            </View>

            {/* Category Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.id} item={cat} onPress={() => handlePress(cat)} />
              ))}
            </View>

            {/* Featured */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                Featured
              </Text>
              <FeaturedCard onPress={handleSchumann} />
            </View>

            {/* Tip */}
            <View
              style={{
                marginTop: 20,
                padding: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13 }}>
                💡 Use headphones for the best binaural beats experience
              </Text>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
