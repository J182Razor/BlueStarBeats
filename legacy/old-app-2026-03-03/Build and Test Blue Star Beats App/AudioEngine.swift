//
//  AudioEngine.swift
//  BlueStarBeats
//
//  High-quality audio engine for iOS brainwave entrainment
//

import Foundation
import AVFoundation
import Combine

class AudioEngine: ObservableObject {
    private var audioEngine = AVAudioEngine()
    private var leftOscillator: AVAudioPlayerNode?
    private var rightOscillator: AVAudioPlayerNode?
    private var isoOscillator: AVAudioPlayerNode?
    
    private var leftBuffer: AVAudioPCMBuffer?
    private var rightBuffer: AVAudioPCMBuffer?
    private var isoBuffer: AVAudioPCMBuffer?
    
    private var mixer = AVAudioMixerNode()
    private var reverb = AVAudioUnitReverb()
    private var compressor = AVAudioUnitDistortion()
    
    @Published var isInitialized = false
    @Published var isPlaying = false
    @Published var currentSettings: AudioSettings?
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupAudioSession()
        setupAudioEngine()
    }
    
    private func setupAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .default, options: [.allowBluetooth, .allowAirPlay])
            try audioSession.setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }
    
    private func setupAudioEngine() {
        // Attach nodes
        audioEngine.attach(mixer)
        audioEngine.attach(reverb)
        audioEngine.attach(compressor)
        
        // Configure reverb for spatial audio effect
        reverb.loadFactoryPreset(.mediumHall)
        reverb.wetDryMix = 15
        
        // Configure compressor for clean output
        compressor.loadFactoryPreset(.multiEcho1)
        compressor.wetDryMix = 10
        
        // Connect nodes
        audioEngine.connect(mixer, to: reverb, format: nil)
        audioEngine.connect(reverb, to: compressor, format: nil)
        audioEngine.connect(compressor, to: audioEngine.outputNode, format: nil)
        
        // Start engine
        do {
            try audioEngine.start()
            isInitialized = true
        } catch {
            print("Failed to start audio engine: \(error)")
        }
    }
    
    func start(with settings: AudioSettings) {
        guard isInitialized else { return }
        
        stop() // Stop any current playback
        
        currentSettings = settings
        
        switch settings.mode {
        case .binaural:
            startBinauralBeats(settings: settings)
        case .isochronic:
            startIsochronicTones(settings: settings)
        }
        
        isPlaying = true
    }
    
    private func startBinauralBeats(settings: AudioSettings) {
        let leftFreq = settings.carrierFrequency - (settings.beatFrequency / 2)
        let rightFreq = settings.carrierFrequency + (settings.beatFrequency / 2)
        
        // Create oscillator nodes
        leftOscillator = AVAudioPlayerNode()
        rightOscillator = AVAudioPlayerNode()
        
        guard let leftOsc = leftOscillator, let rightOsc = rightOscillator else { return }
        
        audioEngine.attach(leftOsc)
        audioEngine.attach(rightOsc)
        
        // Create audio format
        let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 1)!
        
        // Generate buffers
        leftBuffer = generateToneBuffer(frequency: leftFreq, waveform: settings.waveform, format: format, volume: settings.volume)
        rightBuffer = generateToneBuffer(frequency: rightFreq, waveform: settings.waveform, format: format, volume: settings.volume)
        
        // Connect to mixer with panning
        audioEngine.connect(leftOsc, to: mixer, format: format)
        audioEngine.connect(rightOsc, to: mixer, format: format)
        
        // Set panning for stereo effect
        mixer.pan = 0.0 // Center, but we'll use separate channels
        
        // Start playback
        if let leftBuf = leftBuffer, let rightBuf = rightBuffer {
            leftOsc.scheduleBuffer(leftBuf, at: nil, options: .loops, completionHandler: nil)
            rightOsc.scheduleBuffer(rightBuf, at: nil, options: .loops, completionHandler: nil)
            
            leftOsc.play()
            rightOsc.play()
        }
    }
    
    private func startIsochronicTones(settings: AudioSettings) {
        isoOscillator = AVAudioPlayerNode()
        
        guard let isoOsc = isoOscillator else { return }
        
        audioEngine.attach(isoOsc)
        
        let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2)!
        
        // Generate isochronic buffer with pulsing effect
        isoBuffer = generateIsochronicBuffer(
            carrierFreq: settings.carrierFrequency,
            pulseFreq: settings.beatFrequency,
            waveform: settings.waveform,
            format: format,
            volume: settings.volume
        )
        
        audioEngine.connect(isoOsc, to: mixer, format: format)
        
        if let isoBuf = isoBuffer {
            isoOsc.scheduleBuffer(isoBuf, at: nil, options: .loops, completionHandler: nil)
            isoOsc.play()
        }
    }
    
    private func generateToneBuffer(frequency: Double, waveform: WaveformType, format: AVAudioFormat, volume: Double) -> AVAudioPCMBuffer? {
        let sampleRate = format.sampleRate
        let frameCount = AVAudioFrameCount(sampleRate * 2) // 2 seconds buffer
        
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return nil }
        
        buffer.frameLength = frameCount
        
        let channelData = buffer.floatChannelData![0]
        let angularFrequency = 2.0 * Double.pi * frequency / sampleRate
        
        for frame in 0..<Int(frameCount) {
            let sample = generateWaveformSample(
                phase: angularFrequency * Double(frame),
                waveform: waveform,
                amplitude: Float(volume)
            )
            channelData[frame] = sample
        }
        
        return buffer
    }
    
    private func generateIsochronicBuffer(carrierFreq: Double, pulseFreq: Double, waveform: WaveformType, format: AVAudioFormat, volume: Double) -> AVAudioPCMBuffer? {
        let sampleRate = format.sampleRate
        let frameCount = AVAudioFrameCount(sampleRate * 2) // 2 seconds buffer
        
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return nil }
        
        buffer.frameLength = frameCount
        
        let leftChannelData = buffer.floatChannelData![0]
        let rightChannelData = buffer.floatChannelData![1]
        
        let carrierAngularFreq = 2.0 * Double.pi * carrierFreq / sampleRate
        let pulseAngularFreq = 2.0 * Double.pi * pulseFreq / sampleRate
        
        for frame in 0..<Int(frameCount) {
            let carrierSample = generateWaveformSample(
                phase: carrierAngularFreq * Double(frame),
                waveform: waveform,
                amplitude: 1.0
            )
            
            // Create pulsing envelope
            let pulseEnvelope = (sin(pulseAngularFreq * Double(frame)) + 1.0) / 2.0
            let finalSample = carrierSample * Float(pulseEnvelope * volume)
            
            leftChannelData[frame] = finalSample
            rightChannelData[frame] = finalSample
        }
        
        return buffer
    }
    
    private func generateWaveformSample(phase: Double, waveform: WaveformType, amplitude: Float) -> Float {
        switch waveform {
        case .sine:
            return Float(sin(phase)) * amplitude
        case .square:
            return (sin(phase) >= 0 ? amplitude : -amplitude) * 0.5 // Reduce square wave amplitude
        case .triangle:
            return Float(2.0 / Double.pi * asin(sin(phase))) * amplitude
        case .sawtooth:
            return Float(2.0 * (phase / (2.0 * Double.pi) - floor(phase / (2.0 * Double.pi) + 0.5))) * amplitude * 0.5
        }
    }
    
    func stop() {
        leftOscillator?.stop()
        rightOscillator?.stop()
        isoOscillator?.stop()
        
        if let leftOsc = leftOscillator {
            audioEngine.detach(leftOsc)
        }
        if let rightOsc = rightOscillator {
            audioEngine.detach(rightOsc)
        }
        if let isoOsc = isoOscillator {
            audioEngine.detach(isoOsc)
        }
        
        leftOscillator = nil
        rightOscillator = nil
        isoOscillator = nil
        
        isPlaying = false
    }
    
    func updateSettings(_ settings: AudioSettings) {
        if isPlaying {
            start(with: settings)
        }
    }
    
    deinit {
        stop()
        audioEngine.stop()
    }
}
