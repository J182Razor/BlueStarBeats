//
//  AudioSettings.swift
//  BlueStarBeats
//
//  Audio configuration and settings model
//

import Foundation
import Combine

enum AudioMode: String, CaseIterable {
    case binaural = "binaural"
    case isochronic = "isochronic"
    
    var displayName: String {
        switch self {
        case .binaural:
            return "Binaural Beats"
        case .isochronic:
            return "Isochronic Tones"
        }
    }
    
    var description: String {
        switch self {
        case .binaural:
            return "Different frequencies in each ear create the beat effect"
        case .isochronic:
            return "Rhythmic pulses of sound for brainwave entrainment"
        }
    }
}

enum WaveformType: String, CaseIterable {
    case sine = "sine"
    case square = "square"
    case triangle = "triangle"
    case sawtooth = "sawtooth"
    
    var displayName: String {
        switch self {
        case .sine:
            return "Sine"
        case .square:
            return "Square"
        case .triangle:
            return "Triangle"
        case .sawtooth:
            return "Sawtooth"
        }
    }
}

class AudioSettings: ObservableObject {
    @Published var carrierFrequency: Double = 440.0
    @Published var beatFrequency: Double = 10.0
    @Published var waveform: WaveformType = .sine
    @Published var mode: AudioMode = .binaural
    @Published var volume: Double = 0.3
    @Published var isPlaying: Bool = false
    
    // Frequency ranges
    let carrierFrequencyRange: ClosedRange<Double> = 20.0...2000.0
    let beatFrequencyRange: ClosedRange<Double> = 0.001...100.0
    let volumeRange: ClosedRange<Double> = 0.0...1.0
    
    // Preset configurations
    static let presets: [String: (carrier: Double, beat: Double, mode: AudioMode)] = [
        "Focus Flow": (440.0, 10.0, .binaural),
        "Deep Meditation": (256.0, 4.0, .isochronic),
        "Alpha Waves": (440.0, 8.0, .binaural),
        "Beta Focus": (440.0, 15.0, .binaural),
        "Theta Dreams": (256.0, 6.0, .isochronic),
        "Gamma Boost": (440.0, 40.0, .binaural)
    ]
    
    func applyPreset(_ presetName: String) {
        guard let preset = Self.presets[presetName] else { return }
        
        withAnimation(.easeInOut(duration: 0.3)) {
            carrierFrequency = preset.carrier
            beatFrequency = preset.beat
            mode = preset.mode
        }
    }
}
