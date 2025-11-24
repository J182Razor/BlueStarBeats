//
//  WaveformSelectionView.swift
//  BlueStarBeats
//
//  Waveform type selection interface
//

import SwiftUI

struct WaveformSelectionView: View {
    @ObservedObject var audioSettings: AudioSettings
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Waveform Type")
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(WaveformType.allCases, id: \.self) { waveform in
                    WaveformCard(
                        waveform: waveform,
                        isSelected: audioSettings.waveform == waveform,
                        action: {
                            withAnimation(.easeInOut(duration: 0.3)) {
                                audioSettings.waveform = waveform
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

struct WaveformCard: View {
    let waveform: WaveformType
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                // Waveform visualization
                WaveformShape(type: waveform)
                    .stroke(
                        isSelected ? 
                        Color(red: 0.85, green: 0.65, blue: 0.13) :
                        Color.white.opacity(0.6),
                        style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round)
                    )
                    .frame(height: 30)
                
                Text(waveform.displayName)
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundColor(.white)
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

struct WaveformShape: Shape {
    let type: WaveformType
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        let centerY = height / 2
        let amplitude = height * 0.4
        
        switch type {
        case .sine:
            for x in stride(from: 0, to: width, by: 2) {
                let angle = (x / width) * 2 * Double.pi * 2
                let y = centerY + sin(angle) * amplitude
                
                if x == 0 {
                    path.move(to: CGPoint(x: x, y: y))
                } else {
                    path.addLine(to: CGPoint(x: x, y: y))
                }
            }
            
        case .square:
            let quarterWidth = width / 4
            path.move(to: CGPoint(x: 0, y: centerY + amplitude))
            path.addLine(to: CGPoint(x: quarterWidth, y: centerY + amplitude))
            path.addLine(to: CGPoint(x: quarterWidth, y: centerY - amplitude))
            path.addLine(to: CGPoint(x: quarterWidth * 3, y: centerY - amplitude))
            path.addLine(to: CGPoint(x: quarterWidth * 3, y: centerY + amplitude))
            path.addLine(to: CGPoint(x: width, y: centerY + amplitude))
            
        case .triangle:
            path.move(to: CGPoint(x: 0, y: centerY))
            path.addLine(to: CGPoint(x: width / 4, y: centerY + amplitude))
            path.addLine(to: CGPoint(x: width / 2, y: centerY))
            path.addLine(to: CGPoint(x: width * 3/4, y: centerY - amplitude))
            path.addLine(to: CGPoint(x: width, y: centerY))
            
        case .sawtooth:
            path.move(to: CGPoint(x: 0, y: centerY + amplitude))
            path.addLine(to: CGPoint(x: width / 2, y: centerY - amplitude))
            path.addLine(to: CGPoint(x: width / 2, y: centerY + amplitude))
            path.addLine(to: CGPoint(x: width, y: centerY - amplitude))
        }
        
        return path
    }
}

struct WaveformSelectionView_Previews: PreviewProvider {
    static var previews: some View {
        WaveformSelectionView(audioSettings: AudioSettings())
            .preferredColorScheme(.dark)
            .background(Color.black)
    }
}
