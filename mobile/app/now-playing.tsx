import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pause, Play, ChevronDown } from 'lucide-react-native';
import { useAudio } from '../contexts/AudioContext';
import { useProgress } from '../contexts/ProgressContext';
import Svg, { Circle } from 'react-native-svg';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';
const WAVEFORM_BG = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1000';

const { width } = Dimensions.get('window');

export default function NowPlayingScreen() {
  const router = useRouter();
  const { isPlaying, currentSession, togglePlayback, stopSession, setVolume, volume } = useAudio();
  const { addSession } = useProgress();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!currentSession) {
      router.back();
      return;
    }

    setTimeLeft(currentSession.duration * 60); // Convert to seconds

    const interval = setInterval(() => {
      if (isPlaying) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Session completed
            addSession(currentSession, currentSession.duration);
            stopSession();
            router.push('/feedback');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentSession]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentSession
    ? 1 - timeLeft / (currentSession.duration * 60)
    : 0;

  const circumference = 2 * Math.PI * 48;
  const strokeDashoffset = circumference * (1 - progress);

  const handleEnd = async () => {
    if (currentSession && timeLeft < currentSession.duration * 60) {
      const completedMinutes = Math.floor((currentSession.duration * 60 - timeLeft) / 60);
      if (completedMinutes > 0) {
        await addSession(currentSession, completedMinutes);
      }
    }
    await stopSession();
    router.back();
  };

  if (!currentSession) return null;

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/50" />
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2"
            >
              <ChevronDown size={28} color="white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white">{currentSession.title}</Text>
            <TouchableOpacity
              onPress={handleEnd}
              className="p-2"
            >
              <Text className="text-base font-bold text-white/80">End</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-6 pb-20">
            {/* Waveform Visualization */}
            <View className="w-full max-w-sm aspect-square items-center justify-center mb-8">
              <ImageBackground
                source={{ uri: WAVEFORM_BG }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              >
                <View className="absolute inset-0 bg-black/20" />
              </ImageBackground>
            </View>

            {/* Play/Pause Button with Progress Ring */}
            <View className="relative items-center justify-center mb-8">
              <Svg width={96} height={96} className="absolute">
                <Circle
                  cx="48"
                  cy="48"
                  r="48"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                />
                <Circle
                  cx="48"
                  cy="48"
                  r="48"
                  fill="none"
                  stroke="#FCD34D"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
              </Svg>
              <TouchableOpacity
                onPress={togglePlayback}
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{
                  backgroundColor: '#FCD34D',
                  shadowColor: '#FCD34D',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {isPlaying ? (
                  <Pause size={40} color="black" fill="black" />
                ) : (
                  <Play size={40} color="black" fill="black" />
                )}
              </TouchableOpacity>
            </View>

            {/* Volume Control - Hidden for now, can be shown on long press */}
            {false && showVolume && (
              <View className="absolute right-6 top-1/3 items-center gap-3">
                <Volume2 size={20} color="rgba(255,255,255,0.5)" />
                <View className="h-24 w-1 rounded-full bg-white/10">
                  <View
                    className="w-full rounded-full"
                    style={{
                      height: `${volume * 100}%`,
                      backgroundColor: '#FCD34D',
                    }}
                  />
                </View>
                <Volume1 size={20} color="rgba(255,255,255,0.5)" />
              </View>
            )}
          </View>

          {/* Bottom Info */}
          <View className="flex-row justify-between items-center px-6 pb-4">
            <Text className="text-base font-medium text-white/90">{currentSession.subtitle}</Text>
            <Text className="text-sm text-white/70">{formatTime(timeLeft)} left</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

