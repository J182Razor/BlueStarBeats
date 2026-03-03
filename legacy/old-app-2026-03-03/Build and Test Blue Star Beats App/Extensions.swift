//
//  Extensions.swift
//  BlueStarBeats
//
//  Utility extensions for enhanced functionality
//

import SwiftUI
import Foundation

// MARK: - Color Extensions
extension Color {
    static let brandBlue = Color(red: 0.23, green: 0.51, blue: 0.96)
    static let brandGolden = Color(red: 0.85, green: 0.65, blue: 0.13)
    static let brandPink = Color(red: 1.0, green: 0.41, blue: 0.71)
    
    static let backgroundPrimary = Color(red: 0.11, green: 0.11, blue: 0.24)
    static let backgroundSecondary = Color(red: 0.24, green: 0.11, blue: 0.36)
}

// MARK: - View Extensions
extension View {
    func glowEffect(color: Color = .brandGolden, radius: CGFloat = 10) -> some View {
        self
            .shadow(color: color.opacity(0.6), radius: radius, x: 0, y: 0)
            .shadow(color: color.opacity(0.3), radius: radius * 2, x: 0, y: 0)
    }
    
    func premiumCard() -> some View {
        self
            .background(.ultraThinMaterial)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.black.opacity(0.3),
                                Color.brandBlue.opacity(0.1)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Double Extensions
extension Double {
    func rounded(to places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }
    
    func formatFrequency() -> String {
        if self >= 1000 {
            return String(format: "%.1f kHz", self / 1000)
        } else if self >= 1 {
            return String(format: "%.1f Hz", self)
        } else {
            return String(format: "%.3f Hz", self)
        }
    }
}

// MARK: - Haptic Feedback
struct HapticFeedback {
    static func light() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    static func medium() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    static func heavy() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
        impactFeedback.impactOccurred()
    }
    
    static func success() {
        let notificationFeedback = UINotificationFeedbackGenerator()
        notificationFeedback.notificationOccurred(.success)
    }
    
    static func error() {
        let notificationFeedback = UINotificationFeedbackGenerator()
        notificationFeedback.notificationOccurred(.error)
    }
}
