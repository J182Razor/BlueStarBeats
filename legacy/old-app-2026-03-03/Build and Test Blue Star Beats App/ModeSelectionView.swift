//
//  ModeSelectionView.swift
//  BlueStarBeats
//
//  Audio mode selection interface
//

import SwiftUI

struct ModeSelectionView: View {
    @ObservedObject var audioSettings: AudioSettings
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Audio Mode")
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            VStack(spacing: 12) {
                ForEach(AudioMode.allCases, id: \.self) { mode in
                    ModeCard(
                        mode: mode,
                        isSelected: audioSettings.mode == mode,
                        action: {
                            withAnimation(.easeInOut(duration: 0.3)) {
                                audioSettings.mode = mode
                            }
                        }
                    )
                }
            }
        }
        .padding(16)
        .background(.ultraThinMaterial)
        .background(
            RoundedRectangle(cornerRadius: 16)
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
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct ModeCard: View {
    let mode: AudioMode
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(mode.displayName)
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(Color(red: 0.85, green: 0.65, blue: 0.13))
                            .font(.system(size: 16))
                    }
                }
                
                Text(mode.description)
                    .font(.system(size: 11, weight: .regular, design: .rounded))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.leading)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? 
                          LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.85, green: 0.65, blue: 0.13).opacity(0.2),
                                Color(red: 0.23, green: 0.51, blue: 0.96).opacity(0.2)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                          ) :
                          LinearGradient(
                            gradient: Gradient(colors: [Color.clear]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                          )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isSelected ? 
                        Color(red: 0.85, green: 0.65, blue: 0.13) :
                        Color.white.opacity(0.1),
                        lineWidth: isSelected ? 2 : 1
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct ModeSelectionView_Previews: PreviewProvider {
    static var previews: some View {
        ModeSelectionView(audioSettings: AudioSettings())
            .preferredColorScheme(.dark)
            .background(Color.black)
    }
}
