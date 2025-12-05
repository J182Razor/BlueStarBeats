import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Moon, Target, Flower2, Waves } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudio } from '../../contexts/AudioContext';
import { getSessionsByCategory } from '../../lib/sessions';

const GALAXY_BG = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000';

export default function HomeScreen() {
  const router = useRouter();
  const { startSession, currentSession } = useAudio();

  const categories = [
    {
      id: 'sleep',
      title: 'Sleep',
      subtitle: 'Deep Delta Waves',
      icon: Moon,
      color: '#818cf8',
      session: getSessionsByCategory('sleep')[0],
    },
    {
      id: 'focus',
      title: 'Focus',
      subtitle: '40Hz Gamma Binaural',
      icon: Target,
      color: '#60a5fa',
      session: getSessionsByCategory('focus')[0],
    },
    {
      id: 'meditate',
      title: 'Meditate',
      subtitle: 'Theta Meditation',
      icon: Flower2,
      color: '#a78bfa',
      session: getSessionsByCategory('meditate')[0],
    },
    {
      id: 'relax',
      title: 'Relax',
      subtitle: 'Calm Alpha Flow',
      icon: Waves,
      color: '#2dd4bf',
      session: getSessionsByCategory('relax')[0],
    },
  ];

  const handleCategoryPress = async (category: (typeof categories)[0]) => {
    if (category.session) {
      await startSession(category.session);
      router.push('/now-playing');
    }
  };

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
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>👤</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
                  Good morning, Alex
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                onPress={() => router.push('/profile')}
              >
                <Settings size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Category Grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={{
                      width: '48%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 24,
                      padding: 20,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                    onPress={() => handleCategoryPress(cat)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Icon size={24} color={cat.color} />
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: 4,
                      }}
                    >
                      {cat.title}
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
                      {cat.subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Featured Section */}
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 16,
                }}
              >
                Featured Sessions
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                }}
                onPress={() => {
                  const session = getSessionsByCategory('meditate')[1];
                  if (session) {
                    startSession(session);
                    router.push('/now-playing');
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: 8,
                  }}
                >
                  Schumann Resonance
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}>
                  7.83Hz - Earth's natural healing frequency
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
