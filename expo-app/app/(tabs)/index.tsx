import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Target, Flower2, Waves } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';

const GALAXY_BG =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000';

const CATEGORIES = [
  { id: 'sleep', title: 'Sleep', icon: Moon, color: '#818cf8', carrier: 100, beat: 2 },
  { id: 'focus', title: 'Focus', icon: Target, color: '#60a5fa', carrier: 400, beat: 40 },
  { id: 'meditate', title: 'Meditate', icon: Flower2, color: '#a78bfa', carrier: 150, beat: 6 },
  { id: 'relax', title: 'Relax', icon: Waves, color: '#2dd4bf', carrier: 200, beat: 10 },
];

const CategoryCard = memo(
  ({
    item,
    onPress,
  }: {
    item: (typeof CATEGORIES)[0];
    onPress: () => void;
  }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        style={{
          width: '48%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Icon size={20} color={item.color} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>{item.title}</Text>
      </TouchableOpacity>
    );
  }
);

export default function HomeScreen() {
  const router = useRouter();
  const { updateAudioSettings, togglePlayback, isPlaying } = useAudio();

  const handlePress = useCallback(
    (cat: (typeof CATEGORIES)[0]) => {
      updateAudioSettings({ carrierFrequency: cat.carrier, beatFrequency: cat.beat });
      if (!isPlaying) togglePlayback();
      router.push('/(tabs)/player');
    },
    [updateAudioSettings, togglePlayback, isPlaying, router]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{ flex: 1, backgroundColor: '#191121' }}>
      <ImageBackground source={{ uri: GALAXY_BG }} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(25, 17, 33, 0.75)' }} />
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
          {/* Header */}
          <View style={{ paddingVertical: 18 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{greeting}</Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, fontSize: 13 }}>
              Select a preset to start
            </Text>
          </View>

          {/* Category Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.id} item={cat} onPress={() => handlePress(cat)} />
            ))}
          </View>

          {/* Featured */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderRadius: 16,
              padding: 16,
              marginTop: 16,
              borderWidth: 1,
              borderColor: 'rgba(99, 102, 241, 0.3)',
            }}
            onPress={() => {
              updateAudioSettings({ carrierFrequency: 432, beatFrequency: 7.83 });
              if (!isPlaying) togglePlayback();
              router.push('/(tabs)/player');
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'white' }}>
              Schumann Resonance
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, marginTop: 4 }}>
              7.83Hz - Earth's healing frequency
            </Text>
          </TouchableOpacity>

          {/* Tip */}
          <View
            style={{
              marginTop: 16,
              padding: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 12,
            }}
          >
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}>
              💡 Use headphones for best binaural beats experience
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
