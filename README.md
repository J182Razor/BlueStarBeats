# Blue Star Beats

A modern web application for generating binaural beats and isochronic tones for meditation, focus, and relaxation. Built with React, TypeScript, and the Web Audio API.

![Blue Star Beats](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Blue+Star+Beats)

## Features

🎵 **High-Quality Audio Engine**
- Studio-quality audio with 44.1kHz sample rate
- Advanced anti-aliasing and filtering
- Distortion-free playback with professional dynamics compression
- Instant audio loading and playback

🎛️ **Precise Frequency Control**
- Carrier frequency range: 0.001 Hz to 9999 Hz
- Beat/pulse frequency range: 0.001 Hz to 9999 Hz
- 0.001 Hz precision for accurate frequency generation
- Logarithmic slider mapping for intuitive control

🧠 **Audio Modes**
- **Binaural Beats**: Different frequencies in each ear create beat perception
- **Isochronic Tones**: Pulsing tones at regular intervals

🌊 **Waveform Types**
- **Sine**: Pure, smooth tone
- **Square**: Sharp, digital tone
- **Triangle**: Soft, mellow tone
- **Sawtooth**: Bright, buzzy tone

📊 **Real-Time Visualization**
- Live oscilloscope with animated blue waveforms
- Full-width waveform display for immersive experience
- Visual feedback for audio activity

🎨 **Beautiful Design**
- Spiritual meditation-themed background
- Rounded corners and symmetrical spacing
- Responsive design for all devices
- Professional gradient color schemes

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BlueStarBeats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Select Audio Mode**
   - Choose between Binaural Beats or Isochronic Tones
   - Use headphones for the best binaural beats experience

2. **Choose Waveform Type**
   - Select from Sine, Square, Triangle, or Sawtooth waves
   - Each waveform has a unique tonal character

3. **Adjust Frequencies**
   - Set the carrier frequency (base tone)
   - Set the beat/pulse frequency (modulation rate)
   - Use sliders or input fields for precise control

4. **Control Playback**
   - Click the play button to start audio generation
   - Adjust volume with the slider
   - Watch the live waveform visualization

## Audio Engine Details

The Blue Star Beats audio engine is optimized for high-quality, distortion-free playback:

- **Sample Rate**: 44.1kHz for optimal compatibility
- **Anti-Aliasing**: Lowpass filter at 18kHz prevents aliasing artifacts
- **Highpass Filter**: 20Hz filter removes unwanted low-frequency rumble
- **Dynamics Compression**: Prevents clipping and maintains consistent levels
- **Gain Staging**: Automatic normalization for different waveforms
- **Smooth Transitions**: Click-free frequency changes and volume adjustments

## Project Structure

```
BlueStarBeats/
├── src/
│   ├── components/          # React components
│   │   ├── AudioControlPanel.tsx
│   │   ├── FrequencyControl.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── Oscilloscope.tsx
│   │   ├── WaveformSelector.tsx
│   │   └── ErrorBoundary.tsx
│   ├── lib/                 # Core libraries
│   │   └── audioEngine.ts   # High-quality audio engine
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Components

- **AudioEngine**: Core audio processing with Web Audio API
- **AudioControlPanel**: Play/pause and volume controls
- **FrequencyControl**: Precise frequency input with sliders
- **ModeSelector**: Binaural beats vs isochronic tones
- **WaveformSelector**: Visual waveform type selection
- **Oscilloscope**: Real-time audio visualization

## Browser Compatibility

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

*Note: Web Audio API support required*

## Performance Optimizations

- Instant audio loading and playback
- Efficient audio node management
- Smooth UI interactions with optimized React rendering
- Responsive design with mobile touch support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies for optimal performance
- Inspired by meditation and focus enhancement techniques
- Designed for both casual users and audio enthusiasts

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Blue Star Beats** - Experience the power of binaural beats and isochronic tones for meditation, focus, and relaxation.

