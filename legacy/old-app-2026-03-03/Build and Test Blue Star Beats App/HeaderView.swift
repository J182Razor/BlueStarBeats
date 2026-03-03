//
//  HeaderView.swift
//  BlueStarBeats
//
//  Premium header with logo and branding
//

import SwiftUI

struct HeaderView: View {
    var body: some View {
        VStack(spacing: 16) {
            // Logo placeholder - replace with actual logo image
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.85, green: 0.65, blue: 0.13), // Golden
                                Color(red: 0.23, green: 0.51, blue: 0.96)  // Blue
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 120, height: 120)
                    .shadow(color: Color(red: 0.85, green: 0.65, blue: 0.13).opacity(0.3), radius: 20, x: 0, y: 0)
                
                // Star icon
                Image(systemName: "star.fill")
                    .font(.system(size: 50, weight: .bold))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 2)
                
                // Headphone waves
                HStack(spacing: 40) {
                    VStack(spacing: 4) {
                        ForEach(0..<3) { i in
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color(red: 0.85, green: 0.65, blue: 0.13))
                                .frame(width: 20 - CGFloat(i * 4), height: 3)
                                .opacity(1.0 - Double(i) * 0.3)
                        }
                    }
                    .offset(x: -60, y: 0)
                    
                    VStack(spacing: 4) {
                        ForEach(0..<3) { i in
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color(red: 0.85, green: 0.65, blue: 0.13))
                                .frame(width: 20 - CGFloat(i * 4), height: 3)
                                .opacity(1.0 - Double(i) * 0.3)
                        }
                    }
                    .offset(x: 60, y: 0)
                }
            }
            
            // Title
            VStack(spacing: 8) {
                HStack(spacing: 8) {
                    Text("Blue Star")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(Color(red: 0.23, green: 0.51, blue: 0.96))
                    
                    Text("Beats")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(Color(red: 0.85, green: 0.65, blue: 0.13))
                }
                
                Text("PRECISION BRAINWAVE ENTRAINMENT")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
                    .tracking(2)
            }
        }
        .padding(.vertical, 20)
    }
}

struct HeaderView_Previews: PreviewProvider {
    static var previews: some View {
        HeaderView()
            .preferredColorScheme(.dark)
            .background(Color.black)
    }
}
