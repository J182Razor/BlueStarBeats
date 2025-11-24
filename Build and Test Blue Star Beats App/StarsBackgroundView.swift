//
//  StarsBackgroundView.swift
//  BlueStarBeats
//
//  Animated starfield background for cosmic ambiance
//

import SwiftUI

struct StarsBackgroundView: View {
    @State private var animationOffset: CGFloat = 0
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                ForEach(0..<100, id: \.self) { index in
                    Star(
                        position: CGPoint(
                            x: CGFloat.random(in: 0...geometry.size.width),
                            y: CGFloat.random(in: 0...geometry.size.height)
                        ),
                        size: CGFloat.random(in: 1...3),
                        opacity: Double.random(in: 0.3...1.0),
                        animationDelay: Double.random(in: 0...2)
                    )
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
                animationOffset = 360
            }
        }
    }
}

struct Star: View {
    let position: CGPoint
    let size: CGFloat
    let opacity: Double
    let animationDelay: Double
    
    @State private var isAnimating = false
    
    var body: some View {
        Circle()
            .fill(Color.white)
            .frame(width: size, height: size)
            .opacity(isAnimating ? opacity : opacity * 0.3)
            .position(position)
            .onAppear {
                withAnimation(
                    .easeInOut(duration: 2 + animationDelay)
                    .repeatForever(autoreverses: true)
                    .delay(animationDelay)
                ) {
                    isAnimating = true
                }
            }
    }
}

struct StarsBackgroundView_Previews: PreviewProvider {
    static var previews: some View {
        StarsBackgroundView()
            .preferredColorScheme(.dark)
            .background(Color.black)
    }
}
