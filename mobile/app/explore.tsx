import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, Activity, Moon, Zap, Brain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PlayerBar } from '../components/PlayerBar';
import { useAudio } from '../contexts/AudioContext';
import { useProgress } from '../contexts/ProgressContext';
import Svg, { Circle } from 'react-native-svg';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

export default function ProgressDashboardScreen() {
  const router = useRouter();
  const { currentSession } = useAudio();
  const { stats, recentActivity } = useProgress();

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const getActivityIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sleep':
        return Moon;
      case 'focus':
      case 'productivity':
        return Brain;
      case 'meditate':
        return Activity;
      default:
        return Zap;
    }
  };

  const streakProgress = (stats.currentStreak / 7) * 100;
  const timeProgress = Math.min((stats.totalTimeMeditated / 1000) * 100, 100);

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
            <View className="flex-row items-center py-6 mb-6">
              <TouchableOpacity 
                className="p-2 rounded-full bg-white/10 mr-4"
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/');
                  }
                }}
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white flex-1 text-center pr-10">
                Progress Dashboard
              </Text>
            </View>

            {/* Circular Progress Section */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-white/5 rounded-3xl p-4 items-center aspect-square justify-center border border-white/10">
                <View className="relative items-center justify-center mb-2">
                  <Svg width={96} height={96}>
                    <Circle
                      cx="48"
                      cy="48"
                      r="44"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <Circle
                      cx="48"
                      cy="48"
                      r="44"
                      fill="none"
                      stroke="#B388FF"
                      strokeWidth="4"
                      strokeDasharray={276}
                      strokeDashoffset={276 * (1 - streakProgress / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 48 48)"
                    />
                  </Svg>
                  <View className="absolute items-center justify-center">
                    <Text className="text-2xl font-bold text-white">{stats.currentStreak}/7</Text>
                    <Text className="text-xs text-white/50">Days</Text>
                  </View>
                </View>
                <Text className="text-sm font-medium text-white mt-2">Current Streak</Text>
              </View>

              <View className="flex-1 bg-white/5 rounded-3xl p-4 items-center aspect-square justify-center border border-white/10">
                <View className="relative items-center justify-center mb-2">
                  <Svg width={96} height={96}>
                    <Circle
                      cx="48"
                      cy="48"
                      r="44"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <Circle
                      cx="48"
                      cy="48"
                      r="44"
                      fill="none"
                      stroke="#00E5FF"
                      strokeWidth="4"
                      strokeDasharray={276}
                      strokeDashoffset={276 * (1 - timeProgress / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 48 48)"
                    />
                  </Svg>
                  <View className="absolute items-center justify-center">
                    <Text className="text-xl font-bold text-white">
                      {Math.floor(stats.totalTimeMeditated / 60)}h
                    </Text>
                    <Text className="text-xs text-white/50">
                      {stats.totalTimeMeditated % 60}m
                    </Text>
                  </View>
                </View>
                <Text className="text-sm font-medium text-white mt-2">Time Meditated</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row gap-4 mb-8">
              <View className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10">
                <Text className="text-white/50 text-sm mb-1">Total Sessions</Text>
                <Text className="text-3xl font-bold text-white">{stats.totalSessions}</Text>
              </View>
              <View className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10">
                <Text className="text-white/50 text-sm mb-1">Favorite</Text>
                <Text className="text-2xl font-bold text-white capitalize">{stats.favoriteCategory}</Text>
              </View>
            </View>

            {/* Recent Activity */}
            <Text className="text-lg font-bold text-white mb-4">Recent Activity</Text>
            <View className="gap-3 mb-24">
              {recentActivity.slice(0, 10).map((activity, index) => {
                const Icon = getActivityIcon(activity.category);
                return (
                  <View
                    key={index}
                    className="bg-white/5 rounded-2xl p-4 flex-row items-center gap-4 border border-white/10"
                  >
                    <View className="w-12 h-12 rounded-xl items-center justify-center bg-[#B388FF]/20">
                      <Icon size={24} color="#B388FF" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium" numberOfLines={1}>
                        {activity.sessionTitle}
                      </Text>
                      <Text className="text-white/50 text-xs">
                        {activity.category} · {activity.duration} min · {getTimeAgo(activity.completedAt)}
                      </Text>
                    </View>
                    {activity.notes && (
                      <TouchableOpacity className="px-3 py-1.5 rounded-lg bg-white/5 flex-row items-center gap-2">
                        <FileText size={14} color="rgba(255,255,255,0.7)" />
                        <Text className="text-xs text-white/70">Notes</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              {recentActivity.length === 0 && (
                <Text className="text-white/50 text-center py-8">
                  No sessions yet. Start your first session!
                </Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
        {currentSession && <PlayerBar />}
      </ImageBackground>
    </View>
  );
}
