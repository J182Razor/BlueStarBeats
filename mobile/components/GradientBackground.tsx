import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const GradientBackground = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            <LinearGradient
                colors={['#050511', '#2D1B69', '#050511']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
};
