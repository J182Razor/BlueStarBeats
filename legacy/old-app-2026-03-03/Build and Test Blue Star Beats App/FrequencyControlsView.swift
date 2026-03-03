//
//  FrequencyControlsView.swift
//  BlueStarBeats
//
//  Precision frequency control interface
//

import SwiftUI

struct FrequencyControlsView: View {
    @ObservedObject var audioSettings: AudioSettings
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Frequency Controls")
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            VStack(spacing: 24) {
                // Carrier Frequency
                FrequencyControl(
                    title: "Carrier Frequency",
                    value: $audioSettings.carrierFrequency,
                    range: audioSettings.carrierFrequencyRange,
                    unit: "Hz",
                    precision: 1
                )
                
                // Beat/Pulse Frequency
                FrequencyControl(
                    title: audioSettings.mode == .binaural ? "Beat Frequency" : "Pulse Frequency",
                    value: $audioSettings.beatFrequency,
                    range: audioSettings.beatFrequencyRange,
                    unit: "Hz",
                    precision: 3
                )
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

struct FrequencyControl: View {
    let title: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let unit: String
    let precision: Int
    
    @State private var textValue: String = ""
    @State private var isEditing: Bool = false
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text(title)
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundColor(.white)
                
                Spacer()
                
                HStack(spacing: 4) {
                    TextField("", text: $textValue)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(width: 80)
                        .multilineTextAlignment(.center)
                        .keyboardType(.decimalPad)
                        .onSubmit {
                            updateValueFromText()
                        }
                        .onChange(of: isEditing) { editing in
                            if !editing {
                                updateValueFromText()
                            }
                        }
                    
                    Text(unit)
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundColor(Color(red: 0.85, green: 0.65, blue: 0.13))
                }
            }
            
            // Custom slider with logarithmic scaling for better precision
            CustomSlider(
                value: Binding(
                    get: { logScale(value, range: range) },
                    set: { value = inverseLogScale($0, range: range) }
                ),
                range: 0.0...1.0,
                fillColor: LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.85, green: 0.65, blue: 0.13),
                        Color(red: 0.23, green: 0.51, blue: 0.96)
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            
            // Range indicators
            HStack {
                Text(formatValue(range.lowerBound))
                    .font(.system(size: 12, weight: .regular, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
                
                Spacer()
                
                Text(formatValue(range.upperBound))
                    .font(.system(size: 12, weight: .regular, design: .rounded))
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .onAppear {
            updateTextFromValue()
        }
        .onChange(of: value) { _ in
            if !isEditing {
                updateTextFromValue()
            }
        }
    }
    
    private func updateTextFromValue() {
        textValue = formatValue(value)
    }
    
    private func updateValueFromText() {
        if let newValue = Double(textValue) {
            value = max(range.lowerBound, min(range.upperBound, newValue))
        }
        updateTextFromValue()
        isEditing = false
    }
    
    private func formatValue(_ val: Double) -> String {
        return String(format: "%.\(precision)f", val)
    }
    
    // Logarithmic scaling for better frequency control
    private func logScale(_ value: Double, range: ClosedRange<Double>) -> Double {
        let logMin = log(range.lowerBound)
        let logMax = log(range.upperBound)
        let logValue = log(value)
        return (logValue - logMin) / (logMax - logMin)
    }
    
    private func inverseLogScale(_ normalizedValue: Double, range: ClosedRange<Double>) -> Double {
        let logMin = log(range.lowerBound)
        let logMax = log(range.upperBound)
        let logValue = logMin + normalizedValue * (logMax - logMin)
        return exp(logValue)
    }
}

struct FrequencyControlsView_Previews: PreviewProvider {
    static var previews: some View {
        FrequencyControlsView(audioSettings: AudioSettings())
            .preferredColorScheme(.dark)
            .background(Color.black)
    }
}
