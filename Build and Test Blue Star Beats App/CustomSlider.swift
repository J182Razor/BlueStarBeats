//
//  CustomSlider.swift
//  BlueStarBeats
//
//  Premium custom slider with gradient styling
//

import SwiftUI

struct CustomSlider<V>: View where V: BinaryFloatingPoint, V.Stride: BinaryFloatingPoint {
    @Binding var value: V
    let range: ClosedRange<V>
    let trackColor: Color
    let fillColor: LinearGradient
    let thumbColor: Color
    let height: CGFloat
    
    init(
        value: Binding<V>,
        range: ClosedRange<V>,
        trackColor: Color = Color.gray.opacity(0.3),
        fillColor: LinearGradient,
        thumbColor: Color = .white,
        height: CGFloat = 6
    ) {
        self._value = value
        self.range = range
        self.trackColor = trackColor
        self.fillColor = fillColor
        self.thumbColor = thumbColor
        self.height = height
    }
    
    var body: some View {
        GeometryReader { geometry in
            let thumbSize: CGFloat = 20
            let trackWidth = geometry.size.width - thumbSize
            let progress = CGFloat((value - range.lowerBound) / (range.upperBound - range.lowerBound))
            let thumbPosition = progress * trackWidth
            
            ZStack(alignment: .leading) {
                // Track background
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(trackColor)
                    .frame(height: height)
                    .offset(x: thumbSize / 2)
                
                // Fill
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(fillColor)
                    .frame(width: thumbPosition + thumbSize / 2, height: height)
                    .offset(x: thumbSize / 2)
                
                // Thumb
                Circle()
                    .fill(thumbColor)
                    .frame(width: thumbSize, height: thumbSize)
                    .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 1)
                    .offset(x: thumbPosition)
                    .gesture(
                        DragGesture()
                            .onChanged { gesture in
                                let newPosition = max(0, min(trackWidth, gesture.location.x))
                                let newProgress = newPosition / trackWidth
                                let newValue = range.lowerBound + (range.upperBound - range.lowerBound) * V(newProgress)
                                value = newValue
                            }
                    )
            }
        }
        .frame(height: 20)
    }
}

struct CustomSlider_Previews: PreviewProvider {
    @State static var value: Double = 0.5
    
    static var previews: some View {
        CustomSlider(
            value: $value,
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
        .padding()
        .preferredColorScheme(.dark)
        .background(Color.black)
    }
}
