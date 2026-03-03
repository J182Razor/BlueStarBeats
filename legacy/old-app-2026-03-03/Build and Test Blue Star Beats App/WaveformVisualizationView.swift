//
//  WaveformVisualizationView.swift
//  BlueStarBeats
//
//  Animated waveform visualization with premium effects
//

import SwiftUI

struct WaveformVisualizationView: View {
    let isPlaying: Bool
    @State private var animationOffset: CGFloat = 0
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Waveform Visualization")
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            ZStack {
                // Background card
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
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
                    .frame(height: 200)
                
                // Grid lines
                Canvas { context, size in
                    let path = Path { path in
                        // Horizontal lines
                        for i in 0...4 {
                            let y = size.height / 4 * CGFloat(i)
                            path.move(to: CGPoint(x: 0, y: y))
                            path.addLine(to: CGPoint(x: size.width, y: y))
                        }
                        
                        // Vertical lines
                        for i in 0...8 {
                            let x = size.width / 8 * CGFloat(i)
                            path.move(to: CGPoint(x: x, y: 0))
                            path.addLine(to: CGPoint(x: x, y: size.height))
                        }
                    }
                    
                    context.stroke(
                        path,
                        with: .color(Color(red: 0.85, green: 0.65, blue: 0.13).opacity(0.2)),
                        style: StrokeStyle(lineWidth: 1, dash: [2, 4])
                    )
                }
                .frame(height: 200)
                
                // Waveform
                if isPlaying {
                    AnimatedWaveformView(animationOffset: animationOffset)
                } else {
                    StaticWaveformView()
                }
                
                // Status indicators
                VStack {
                    HStack {
                        StatusBadge(
                            text: isPlaying ? "Live Waveform" : "Preview",
                            isActive: isPlaying
                        )
                        
                        Spacer()
                        
                        StatusBadge(
                            text: isPlaying ? "Active" : "Standby",
                            isActive: isPlaying
                        )
                    }
                    
                    Spacer()
                    
                    if isPlaying {
                        StatusBadge(
                            text: "Audio Engine Active",
                            isActive: true,
                            color: Color(red: 0.85, green: 0.65, blue: 0.13)
                        )
                    }
                }
                .padding(16)
            }
        }
        .onAppear {
            if isPlaying {
                startAnimation()
            }
        }
        .onChange(of: isPlaying) { playing in
            if playing {
                startAnimation()
            }
        }
    }
    
    private func startAnimation() {
        withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
            animationOffset = 360
        }
    }
}

struct AnimatedWaveformView: View {
    let animationOffset: CGFloat
    
    var body: some View {
        Canvas { context, size in
            let path = Path { path in
                let centerY = size.height / 2
                let amplitude = size.height * 0.3
                let frequency = 0.02
                let time = animationOffset * 0.01
                
                for x in stride(from: 0, to: size.width, by: 2) {
                    let y = centerY + sin((x * frequency) + time) * amplitude * sin(time * 0.3)
                    
                    if x == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
            }
            
            // Main waveform with gradient
            context.stroke(
                path,
                with: .linearGradient(
                    Gradient(colors: [
                        Color(red: 0.85, green: 0.65, blue: 0.13),
                        Color(red: 0.23, green: 0.51, blue: 0.96),
                        Color(red: 1.0, green: 0.41, blue: 0.71)
                    ]),
                    startPoint: CGPoint(x: 0, y: 0),
                    endPoint: CGPoint(x: size.width, y: 0)
                ),
                style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round)
            )
            
            // Glow effect
            context.addFilter(.blur(radius: 5))
            context.stroke(
                path,
                with: .color(Color(red: 0.85, green: 0.65, blue: 0.13).opacity(0.6)),
                style: StrokeStyle(lineWidth: 6, lineCap: .round, lineJoin: .round)
            )
        }
        .frame(height: 200)
    }
}

struct StaticWaveformView: View {
    var body: some View {
        Canvas { context, size in
            let path = Path { path in
                let centerY = size.height / 2
                let amplitude = size.height * 0.2
                let frequency = 0.03
                
                for x in stride(from: 0, to: size.width, by: 2) {
                    let y = centerY + sin(x * frequency) * amplitude
                    
                    if x == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
            }
            
            context.stroke(
                path,
                with: .color(Color.gray.opacity(0.5)),
                style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round)
            )
        }
        .frame(height: 200)
    }
}

struct StatusBadge: View {
    let text: String
    let isActive: Bool
    var color: Color = Color.green
    
    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(isActive ? color : Color.gray)
                .frame(width: 8, height: 8)
                .opacity(isActive ? 1.0 : 0.6)
                .scaleEffect(isActive ? 1.2 : 1.0)
                .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: isActive)
            
            Text(text)
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(.ultraThinMaterial)
        .clipShape(Capsule())
    }
}

struct WaveformVisualizationView_Previews: PreviewProvider {
    static var previews: some View {
        WaveformVisualizationView(isPlaying: true)
            .preferredColorScheme(.dark)
            .background(Color.black)
    }
}
