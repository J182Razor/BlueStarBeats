//
//  PresetsView.swift
//  BlueStarBeats
//
//  Preset configurations for quick access
//

import SwiftUI

struct PresetsView: View {
    @ObservedObject var audioSettings: AudioSettings
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Quick Presets")
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(Array(AudioSettings.presets.keys.sorted()), id: \.self) { presetName in
                    PresetCard(
                        name: presetName,
                        preset: AudioSettings.presets[presetName]!,
                        action: {
                            withAnimation(.easeInOut(duration: 0.5)) {
                                audioSettings.applyPreset(presetName)
                            }
                        }
                    )
                }
            }
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
}

struct PresetCard: View {
    let name: String
    let preset: (carrier: Double, beat: Double, mode: AudioMode)
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                Text(name)
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.leading)
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Carrier:")
                            .font(.system(size: 11, weight: .regular, design: .rounded))
                            .foregroundColor(.white.opacity(0.7))
                        
                        Spacer()
                        
                        Text("\(Int(preset.carrier)) Hz")
                            .font(.system(size: 11, weight: .medium, design: .rounded))
                            .foregroundColor(Color(red: 0.85, green: 0.65, blue: 0.13))
                    }
                    
                    HStack {
                        Text("Beat:")
                            .font(.system(size: 11, weight: .regular, design: .rounded))
                            .foregroundColor(.white.opacity(0.7))
                        
                        Spacer()
                        
                        Text("\(preset.beat, specifier: "%.1f") Hz")
                            .font(.system(size: 11, weight: .medium, design: .rounded))
                            .foregroundColor(Color(red: 0.23, green: 0.51, blue: 0.96))
                    }
                    
                    HStack {
                        Text("Mode:")
                            .font(.system(size: 11, weight: .regular, design: .rounded))
                            .foregroundColor(.white.opacity(0.7))
                        
                        Spacer()
                        
                        Text(preset.mode.displayName)
                            .font(.system(size: 11, weight: .medium, design: .rounded))
                            .foregroundColor(.white.opacity(0.9))
                    }
                }
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(.ultraThinMaterial)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct PresetsView_Previews: PreviewProvider {
    static var previews: some View {
        PresetsView(audioSettings: AudioSettings())
            .preferredColorScheme(.dark)
            .background(Color.black)
    }
}
