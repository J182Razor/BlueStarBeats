/**
 * High-Quality Audio Engine for Blue Star Beats
 * 
 * Features:
 * - Precision frequency control (0.001 Hz)
 * - High-quality oscillators with anti-aliasing
 * - Advanced binaural beats generation
 * - Professional isochronic tones with smooth pulsing
 * - Multiple waveform types with proper normalization
 * - Optimized gain staging to prevent distortion
 * - High sample rate processing (48kHz)
 */

// Audio context and nodes
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let leftOscillator: OscillatorNode | null = null;
let rightOscillator: OscillatorNode | null = null;
let pulseGainNode: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;

// Audio parameters
let mode: 'binaural' | 'isochronic' = 'binaural';
let waveform: OscillatorType = 'sine';
let carrierFrequency: number = 440.000;
let beatFrequency: number = 7.830;
let volume: number = 0.7;
let isPlaying: boolean = false;

// For isochronic pulse modulation
let pulseModulator: OscillatorNode | null = null;
let pulseDepth: GainNode | null = null;
let pulseDCOffset: ConstantSourceNode | null = null;
let pulseWaveShaper: WaveShaperNode | null = null;

// For high-quality processing
let lowpassFilter: BiquadFilterNode | null = null;
let highpassFilter: BiquadFilterNode | null = null;
let compressor: DynamicsCompressorNode | null = null;

// Initialize the audio context with high sample rate
const initAudioContext = (): void => {
  // #region agent log
  const initStart = Date.now();
  fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngineWeb.ts:42',message:'initAudioContext called',data:{timestamp:initStart},timestamp:initStart,sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  try {
    // #region agent log
    const audioContextStart = Date.now();
    // #endregion
    // Use higher sample rate for better quality
    audioContext = new AudioContext({ sampleRate: 48000 });
    // #region agent log
    const audioContextCreated = Date.now();
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngineWeb.ts:52',message:'AudioContext created',data:{state:audioContext.state,sampleRate:audioContext.sampleRate,createTime:audioContextCreated-audioContextStart},timestamp:audioContextCreated,sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    const nodeCreationStart = Date.now();
    // #endregion
    // Create analyzer for visualization
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.85;
    
    // Create master gain node with proper gain staging
    gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    // Create high-quality filters
    lowpassFilter = audioContext.createBiquadFilter();
    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.value = 18000;
    lowpassFilter.Q.value = 0.7;
    
    highpassFilter = audioContext.createBiquadFilter();
    highpassFilter.type = 'highpass';
    highpassFilter.frequency.value = 20;
    highpassFilter.Q.value = 0.7;
    
    // Create compressor to prevent clipping
    compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    // #region agent log
    const nodeCreationEnd = Date.now();
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngineWeb.ts:78',message:'Audio nodes created',data:{nodeCreationTime:nodeCreationEnd-nodeCreationStart},timestamp:nodeCreationEnd,sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Connect the audio processing chain
    gainNode.connect(lowpassFilter);
    lowpassFilter.connect(highpassFilter);
    highpassFilter.connect(compressor);
    compressor.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
    
    console.log('Audio context initialized with sample rate:', audioContext.sampleRate);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngineWeb.ts:95',message:'AudioContext initialization complete',data:{totalTime:Date.now()-initStart,state:audioContext.state},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/47fda163-483e-4af1-98c0-09ff88d0e1b7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audioEngineWeb.ts:85',message:'AudioContext initialization failed',data:{error:error instanceof Error?error.message:String(error),errorName:error instanceof Error?error.name:'Unknown',totalTime:Date.now()-initStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    console.error('Failed to initialize audio context:', error);
  }
};

// Start audio playback with proper ramp-up to prevent clicks
const start = (): void => {
  if (!audioContext) return;
  
  // Resume audio context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Create new oscillators for clean start
  createOscillators();
  
  if (mode === 'binaural') {
    setupBinauralBeats();
  } else {
    setupIsochronicTones();
  }
  
  isPlaying = true;
};

// Stop audio playback with proper ramp-down to prevent clicks
const stop = (): void => {
  if (!audioContext) return;
  
  const currentTime = audioContext.currentTime;
  
  // Graceful shutdown with fade out to prevent clicks
  if (gainNode) {
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.05);
  }
  
  // Schedule oscillator shutdown
  setTimeout(() => {
    cleanupOscillators();
    isPlaying = false;
  }, 60);
};

// Create oscillators with anti-aliasing
const createOscillators = (): void => {
  if (!audioContext || !gainNode) return;
  
  // Clean up any existing oscillators
  cleanupOscillators();
  
  // Create new oscillators
  leftOscillator = audioContext.createOscillator();
  rightOscillator = audioContext.createOscillator();
  
  // Set waveform type
  leftOscillator.type = waveform;
  rightOscillator.type = waveform;
  
  // Apply proper normalization based on waveform type to prevent distortion
  if (waveform === 'square' || waveform === 'sawtooth') {
    // These waveforms have higher amplitude and need attenuation
    gainNode.gain.value = volume * 0.5;
  } else {
    gainNode.gain.value = volume;
  }
};

// Set up binaural beats with precise frequency control
const setupBinauralBeats = (): void => {
  if (!audioContext || !leftOscillator || !rightOscillator || !gainNode) return;
  
  const currentTime = audioContext.currentTime;
  
  // Create stereo channel merger
  const merger = audioContext.createChannelMerger(2);
  
  // Calculate precise frequencies for left and right channels
  const leftFreq = carrierFrequency - (beatFrequency / 2);
  const rightFreq = carrierFrequency + (beatFrequency / 2);
  
  // Set frequencies with precision
  leftOscillator.frequency.setValueAtTime(leftFreq, currentTime);
  rightOscillator.frequency.setValueAtTime(rightFreq, currentTime);
  
  // Connect oscillators to stereo channels
  leftOscillator.connect(merger, 0, 0);
  rightOscillator.connect(merger, 0, 1);
  
  // Connect merger to gain node with smooth ramp-up
  merger.connect(gainNode);
  
  // Start oscillators
  leftOscillator.start();
  rightOscillator.start();
  
  // Smooth volume ramp-up to prevent clicks
  gainNode.gain.setValueAtTime(0.0001, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, currentTime + 0.05);
};

// Set up isochronic tones with smooth pulsing
const setupIsochronicTones = (): void => {
  if (!audioContext || !leftOscillator || !gainNode) return;
  
  const currentTime = audioContext.currentTime;
  
  // Create pulse modulator for isochronic tones
  pulseModulator = audioContext.createOscillator();
  pulseModulator.type = 'sine';
  pulseModulator.frequency.setValueAtTime(beatFrequency, currentTime);
  
  // Create gain nodes for pulse modulation
  pulseGainNode = audioContext.createGain();
  pulseDepth = audioContext.createGain();
  pulseDepth.gain.value = 0.95; // Modulation depth
  
  // Create DC offset to center the modulation
  pulseDCOffset = audioContext.createConstantSource();
  pulseDCOffset.offset.value = 0.05; // Small offset to prevent complete silence
  
  // Create waveshaper for smoother pulse transitions
  pulseWaveShaper = audioContext.createWaveShaper();
  const curve = new Float32Array(44100);
  for (let i = 0; i < 44100; i++) {
    // Sigmoid curve for smoother transitions
    const x = (i / 44100) * 2 - 1;
    curve[i] = (1 + Math.tanh(3 * x)) / 2;
  }
  pulseWaveShaper.curve = curve;
  
  // Set carrier frequency
  leftOscillator.frequency.setValueAtTime(carrierFrequency, currentTime);
  
  // Connect the carrier oscillator to the pulse gain node
  leftOscillator.connect(pulseGainNode);
  
  // Connect the pulse modulator through the waveshaper to the pulse depth
  pulseModulator.connect(pulseWaveShaper);
  pulseWaveShaper.connect(pulseDepth);
  
  // Add DC offset to keep the gain above zero
  pulseDCOffset.connect(pulseGainNode.gain);
  pulseDepth.connect(pulseGainNode.gain);
  
  // Connect the pulse gain node to the main gain node
  pulseGainNode.connect(gainNode);
  
  // Start the oscillators
  leftOscillator.start();
  pulseModulator.start();
  pulseDCOffset.start();
  
  // Smooth volume ramp-up to prevent clicks
  gainNode.gain.setValueAtTime(0.0001, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, currentTime + 0.05);
};

// Clean up oscillators and nodes
const cleanupOscillators = (): void => {
  try {
    if (leftOscillator) {
      leftOscillator.stop();
      leftOscillator.disconnect();
      leftOscillator = null;
    }
    
    if (rightOscillator) {
      rightOscillator.stop();
      rightOscillator.disconnect();
      rightOscillator = null;
    }
    
    if (pulseModulator) {
      pulseModulator.stop();
      pulseModulator.disconnect();
      pulseModulator = null;
    }
    
    if (pulseDCOffset) {
      pulseDCOffset.stop();
      pulseDCOffset.disconnect();
      pulseDCOffset = null;
    }
    
    if (pulseGainNode) {
      pulseGainNode.disconnect();
      pulseGainNode = null;
    }
    
    if (pulseDepth) {
      pulseDepth.disconnect();
      pulseDepth = null;
    }
    
    if (pulseWaveShaper) {
      pulseWaveShaper.disconnect();
      pulseWaveShaper = null;
    }
  } catch (error) {
    console.error('Error cleaning up oscillators:', error);
  }
};

// Set mode (binaural or isochronic)
const setMode = (newMode: 'binaural' | 'isochronic'): void => {
  mode = newMode;
  
  if (isPlaying) {
    stop();
    start();
  }
};

// Set waveform type with proper normalization
const setWaveform = (newWaveform: OscillatorType): void => {
  waveform = newWaveform;
  
  if (isPlaying) {
    stop();
    start();
  }
};

// Set volume with smooth transition
const setVolume = (newVolume: number): void => {
  volume = newVolume;
  
  if (gainNode && audioContext) {
    const currentTime = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
    
    // Apply proper normalization based on waveform type
    let targetVolume = volume;
    if (waveform === 'square' || waveform === 'sawtooth') {
      targetVolume *= 0.5;
    }
    
    // Smooth transition to new volume
    gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + 0.05);
  }
};

// Update frequencies with precision control
const updateFrequencies = (
  newCarrierFrequency: number,
  newBeatFrequency: number
): { carrier: number; beat: number } => {
  // Ensure minimum frequency values to prevent audio artifacts
  carrierFrequency = Math.max(0.001, newCarrierFrequency);
  beatFrequency = Math.max(0.001, newBeatFrequency);
  
  if (isPlaying && audioContext) {
    const currentTime = audioContext.currentTime;
    
    if (mode === 'binaural' && leftOscillator && rightOscillator) {
      // Calculate precise frequencies for left and right channels
      const leftFreq = carrierFrequency - (beatFrequency / 2);
      const rightFreq = carrierFrequency + (beatFrequency / 2);
      
      // Smooth transition to new frequencies
      leftOscillator.frequency.setTargetAtTime(leftFreq, currentTime, 0.05);
      rightOscillator.frequency.setTargetAtTime(rightFreq, currentTime, 0.05);
    } else if (mode === 'isochronic') {
      if (leftOscillator) {
        // Update carrier frequency with smooth transition
        leftOscillator.frequency.setTargetAtTime(carrierFrequency, currentTime, 0.05);
      }
      
      if (pulseModulator) {
        // Update pulse frequency with smooth transition
        pulseModulator.frequency.setTargetAtTime(beatFrequency, currentTime, 0.05);
      }
    }
  }
  
  return { carrier: carrierFrequency, beat: beatFrequency };
};

// Get analyzer data for visualization
const getAnalyserData = (): Uint8Array | null => {
  if (!analyserNode) return null;
  
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteTimeDomainData(dataArray);
  
  return dataArray;
};

// Export the audio engine API
export const audioEngine = {
  initAudioContext,
  start,
  stop,
  setMode,
  setWaveform,
  setVolume,
  updateFrequencies,
  getAnalyserData
};
