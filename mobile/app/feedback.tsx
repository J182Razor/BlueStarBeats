import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Star } from 'lucide-react-native';
import { useAudio } from '../contexts/AudioContext';
import { useProgress } from '../contexts/ProgressContext';

const GALAXY_BG = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=2000';

export default function FeedbackScreen() {
  const router = useRouter();
  const { currentSession, stopSession } = useAudio();
  const { updateSessionRating } = useProgress();
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (currentSession && rating > 0) {
      await updateSessionRating(currentSession.id, rating, notes);
    }
    await stopSession();
    router.replace('/');
  };

  const handleSkip = async () => {
    await stopSession();
    router.replace('/');
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: GALAXY_BG }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-[#191121]/80" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <SafeAreaView className="flex-1">
            <View className="flex-1 items-center justify-center px-6">
              <View className="w-full max-w-sm bg-white/10 rounded-3xl p-6 border border-white/20 backdrop-blur-xl">
                <View className="flex-row justify-end mb-4">
                  <TouchableOpacity
                    onPress={handleSkip}
                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>

                <Text className="text-2xl font-bold text-white mb-6 text-center">
                  How was your session?
                </Text>

                {/* Star Rating */}
                <View className="flex-row justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      activeOpacity={0.7}
                    >
                      <Star
                        size={40}
                        color={star <= rating ? '#FCD34D' : 'rgba(255,255,255,0.3)'}
                        fill={star <= rating ? '#FCD34D' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Notes Input */}
                <TextInput
                  className="bg-white/10 rounded-2xl p-4 text-white mb-6 border border-white/20 min-h-[100]"
                  placeholder="Add a reflection..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textAlignVertical="top"
                />

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  className="bg-[#B388FF] rounded-2xl py-4 mb-4"
                  activeOpacity={0.8}
                  disabled={rating === 0}
                  style={{ opacity: rating === 0 ? 0.5 : 1 }}
                >
                  <Text className="text-white font-bold text-center text-lg">
                    Submit Feedback
                  </Text>
                </TouchableOpacity>

                {/* Skip Link */}
                <TouchableOpacity onPress={handleSkip}>
                  <Text className="text-white/50 text-center text-sm underline">
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

