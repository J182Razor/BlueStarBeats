//
//  ContentView.swift
//  BlueStarBeats
//
//  Main application interface with premium branding
//

import SwiftUI

struct ContentView: View {
    @StateObject private var audioSettings = AudioSettings()
    @StateObject private var audioEngine = AudioEngine()
    @State private var showingPresets = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Premium gradient background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.11, green: 0.11, blue: 0.24),
                        Color(red: 0.24, green: 0.11, blue: 0.36)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                // Animated stars background
                StarsBackgroundView()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header with logo
                        HeaderView()
                        
                        // Waveform visualization
                        WaveformVisualizationView(isPlaying: audioSettings.isPlaying)
                        
                        // Audio controls
                        AudioControlsView(
                            audioSettings: audioSettings,
                            audioEngine: audioEngine
                        )
                        
                        // Mode and waveform selection
                        HStack(spacing: 16) {
                            ModeSelectionView(audioSettings: audioSettings)
                            WaveformSelectionView(audioSettings: audioSettings)
                        }
                        
                        // Frequency controls
                        FrequencyControlsView(audioSettings: audioSettings)
                        
                        // Presets
                        PresetsView(audioSettings: audioSettings)
                        
                        Spacer(minLength: 100)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onChange(of: audioSettings.carrierFrequency) { _ in
            if audioSettings.isPlaying {
                audioEngine.updateSettings(audioSettings)
            }
        }
        .onChange(of: audioSettings.beatFrequency) { _ in
            if audioSettings.isPlaying {
                audioEngine.updateSettings(audioSettings)
            }
        }
        .onChange(of: audioSettings.mode) { _ in
            if audioSettings.isPlaying {
                audioEngine.updateSettings(audioSettings)
            }
        }
        .onChange(of: audioSettings.waveform) { _ in
            if audioSettings.isPlaying {
                audioEngine.updateSettings(audioSettings)
            }
        }
        .onChange(of: audioSettings.volume) { _ in
            if audioSettings.isPlaying {
                audioEngine.updateSettings(audioSettings)
            }
        }
    }
}
