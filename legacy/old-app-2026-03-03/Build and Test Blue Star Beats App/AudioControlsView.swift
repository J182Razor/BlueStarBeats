//
//  AudioControlsView.swift
//  BlueStarBeats
//
//  Premium audio control interface
//

import SwiftUI

struct AudioControlsView: View {
    @ObservedObject var audioSettings: AudioSettings
    @ObservedObject var audioEngine: AudioEngine
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Audio Controls")
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            HStack(spacing: 40) {
                // Play/Pause Button
                Button(action: togglePlayback) {
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0.23, green: 0.51, blue: 0.96),
                                        Color(red: 0.85, green: 0.65, blue: 0.13)
                                    ]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 80, height: 80)
                            .shadow(
                                color: Color(red: 0.85, green: 0.65, blue: 0.13).opacity(0.4),
                                radius: audioSettings.isPlaying ? 20 : 10,
                                x: 0,
                                y: 0
                            )
                            .scaleEffect(audioSettings.isPlaying ? 1.1 : 1.0)
                            .animation(.easeInOut(duration: 0.3), value: audioSettings.isPlaying)
                        
                        Image(systemName: audioSettings.isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                            .offset(x: audioSettings.isPlaying ? 0 : 3, y: 0) // Center the play triangle
                    }
                }
                .buttonStyle(PressedButtonStyle())
                
                // Volume Control
                VStack(spacing: 12) {
                    HStack {
                        Text("Volume")
                            .font(.system(size: 16, weight: .medium, design: .rounded))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        Text("\(Int(audioSettings.volume * 100))%")
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundColor(Color(red: 0.85, green: 0.65, blue: 0.13))
                    }
                    
                    CustomSlider(
                        value: $audioSettings.volume,
                        range: audioSettings.volumeRange,
                        trackColor: Color.gray.opacity(0.3),
                        fillColor: LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.85, green: 0.65, blue: 0.13),
                                Color(red: 0.23, green: 0.51, blue: 0.96)
                            ]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                }
                .frame(maxWidth: 200)
            }
            
            // Status Display
            HStack {
                Image(systemName: "circle.fill")
                    .foregroundColor(audioSettings.isPlaying ? .green : .gray)
                    .font(.system(size: 12))
                
                Text(audioSettings.isPlaying ? "Playing" : "Stopped")
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(.ultraThinMaterial)
            .clipShape(Capsule())
        }
        .padding(20)
        .background(.ultraThinMaterial)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.black.opacity(0.3),
                            Color(red: 0.23, green: 0.51, blue: 0.96).opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
    
    private func togglePlayback() {
        if audioSettings.isPlaying {
            audioEngine.stop()
            audioSettings.isPlaying = false
        } else {
            audioEngine.start(with: audioSettings)
            audioSettings.isPlaying = true
        }
    }
}

struct PressedButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct AudioControlsView_Previews: PreviewProvider {
    static var previews: some View {
        AudioControlsView(
            audioSettings: AudioSettings(),
            audioEngine: AudioEngine()
        )
        .preferredColorScheme(.dark)
        .background(Color.black)
    }
}
