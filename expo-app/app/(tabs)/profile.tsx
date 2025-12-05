import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Clock, Flame, Crown, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../contexts/ProgressContext';
import { usePremium } from '../../contexts/PremiumContext';

const GALAXY_BG = 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=2000';

export default function ProfileScreen() {
    const router = useRouter();
    const { totalMinutes, streak, sessionHistory } = useProgress();
    const { isPremium } = usePremium();

    const stats = [
        { icon: Clock, label: 'Total Time', value: `${totalMinutes}m`, color: '#60a5fa' },
        { icon: Flame, label: 'Day Streak', value: streak.toString(), color: '#f97316' },
        { icon: User, label: 'Sessions', value: sessionHistory.length.toString(), color: '#a78bfa' },
    ];

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
                        backgroundColor: 'rgba(25, 17, 33, 0.85)',
                    }}
                />
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                        {/* Header */}
                        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: 'rgba(99, 102, 241, 0.3)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 2,
                                    borderColor: '#6366f1',
                                    marginBottom: 16,
                                }}
                            >
                                <User size={40} color="#6366f1" />
                            </View>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Alex</Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 8,
                                    backgroundColor: isPremium ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                }}
                            >
                                <Crown size={14} color={isPremium ? '#eab308' : '#6b7280'} />
                                <Text
                                    style={{
                                        color: isPremium ? '#eab308' : '#6b7280',
                                        marginLeft: 6,
                                        fontSize: 12,
                                        fontWeight: '600',
                                    }}
                                >
                                    {isPremium ? 'Premium Member' : 'Free Plan'}
                                </Text>
                            </View>
                        </View>

                        {/* Stats */}
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 32,
                            }}
                        >
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <View
                                        key={stat.label}
                                        style={{
                                            flex: 1,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: 16,
                                            padding: 16,
                                            marginHorizontal: 4,
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                        }}
                                    >
                                        <Icon size={24} color={stat.color} />
                                        <Text
                                            style={{
                                                fontSize: 24,
                                                fontWeight: 'bold',
                                                color: 'white',
                                                marginTop: 8,
                                            }}
                                        >
                                            {stat.value}
                                        </Text>
                                        <Text
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                fontSize: 12,
                                                marginTop: 4,
                                            }}
                                        >
                                            {stat.label}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Menu Items */}
                        {!isPremium && (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#6366f1',
                                }}
                            >
                                <Crown size={24} color="#eab308" />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                                        Upgrade to Premium
                                    </Text>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                                        Unlock all sessions and features
                                    </Text>
                                </View>
                                <ChevronRight size={20} color="rgba(255, 255, 255, 0.4)" />
                            </TouchableOpacity>
                        )}

                        {/* Recent Sessions */}
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: 12,
                            }}
                        >
                            Recent Sessions
                        </Text>
                        {sessionHistory.length === 0 ? (
                            <View
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 16,
                                    padding: 24,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No sessions yet</Text>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 12, marginTop: 4 }}>
                                    Start your first session to see history
                                </Text>
                            </View>
                        ) : (
                            sessionHistory.slice(-5).reverse().map((record, index) => (
                                <View
                                    key={index}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 12,
                                        padding: 12,
                                        marginBottom: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: 'white', fontWeight: '500' }}>{record.sessionName}</Text>
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>
                                            {Math.floor(record.duration / 60)}m • {record.category}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
