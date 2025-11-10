# Blue Star Beats - Precision Brainwave Entrainment

A modern, minimalist web application for brainwave entrainment using binaural beats and isochronic tones. Blue Star Beats provides a clean, utility-first interface designed to help users achieve deeper states of meditation, focus, sleep, and relaxation without distractions.

## 🌟 Features

### Core Features

1. **Anti-Bloat Interface**
   - Clean, minimalist design that gets you from "stressed" to "relaxed" in two taps
   - No distracting videos, cluttered menus, or buggy add-ons
   - Fast, powerful tool that does its job instantly

2. **Pro-Mode Session Editor**
   - Advanced, user-controlled customization of entrainment sessions
   - Adjust exact frequencies, tweak intensity, and build custom protocols
   - Create perfectly tailored experiences for your unique brain

3. **Pure, Uninterrupted Entrainment**
   - 100% free of talking, guided narratives, and filler
   - Achieve deeper states of meditation, focus, or sleep
   - Your brain is free to truly sync with the entrainment

4. **Transparent & Honest Pricing**
   - One-time "Lifetime" purchase option
   - Clear, science-based session descriptions
   - No subscription anxiety - buy once, own forever

5. **Seamless Audio Layering**
   - Audio engine runs in the background
   - Layer BWE underneath your other apps
   - Enhance the apps you already love

### Session Protocols

#### Sleep Sessions
- **Sleep Onset** (20m, 30m, 45m) - Theta to Deep Delta transition
- **Deep Sleep** (45m, 60m, 90m) - Deep Delta waves for restorative sleep
- **Sleepy Head** (10m) - Quick sleep aid

#### Anxiety & Stress Sessions
- **5-Minute Panic Reset** (5m) - Fast-acting Alpha waves
- **Unwind & Relax** (15m, 30m) - Alpha to Theta transition
- **10-Min Stress Reset** (10m) - Quick stress relief
- **Calm Flow** (45m, 60m) - Extended Alpha session (Premium)

#### Focus Sessions
- **Focus Flow** (45m, 60m, 90m) - Beta waves for active work
- **Creative Boost** (20m, 30m) - Schumann Resonance for insight (Premium)
- **Deep Work** (60m, 90m) - High Beta for intense concentration (Premium)

#### Meditation Sessions
- **Alpha Meditation** (20m, 30m) - Calm Alpha for relaxed awareness
- **Theta Meditation** (30m, 45m, 60m) - Deep Theta for profound states (Premium)
- **Gamma Peak** (15m, 30m) - High-frequency Gamma for peak performance (Premium)

### Freemium Model

**Free Tier:**
- Access to 7+ core sessions
- Basic session lengths
- Standard waveforms and modes

**Premium Tier:**
- Unlock all 50+ sessions
- All session lengths (5min to 2 hours)
- Advanced protocols (Gamma, custom frequencies)
- Mix BWE with your own music
- Offline mode
- Priority support

**Pricing:**
- Monthly: $14.99/month
- Annual: $69.99/year (Save 58% - $5.83/month)
- Lifetime: $399.99 (one-time purchase)

## 🚀 Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Audio Engine:** Web Audio API
- **State Management:** React Hooks

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser with Web Audio API support
- Headphones recommended for best binaural beats experience

## 🛠️ Installation

See [INSTALLATION.md](./INSTALLATION.md) for detailed installation instructions.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/J182Razor/BlueStarBeats.git

# Navigate to project directory
cd BlueStarBeats

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 Usage

See [USAGE.md](./USAGE.md) for comprehensive usage documentation.

### Getting Started

1. **Onboarding:** Select your primary goal (Sleep, Anxiety, Focus, or Meditation)
2. **Choose Session:** Browse the session library and select a protocol
3. **Start Session:** Click play and let the brainwave entrainment begin
4. **Pro Mode:** Toggle advanced controls for custom frequency adjustments

## 🎯 Target Market

### Tier 1: Core Market (Primary Revenue Engine)
- **Insomnia / Poor Sleep** (84M people)
- **Generalized Anxiety** (40M people)
- **Difficulty Focusing** (~30M people)

### Tier 2: Growth Market
- **Ineffective Meditation** (38M people)
- **Lack of Motivation / Burnout** (~100M people)

## 🧠 Science Behind Brainwave Entrainment

Brainwave entrainment uses audio frequencies to guide your brain into specific states:

- **Delta (1-4 Hz):** Deep sleep, healing, regeneration
- **Theta (4-8 Hz):** Deep meditation, creativity, REM sleep
- **Alpha (8-13 Hz):** Relaxation, calm focus, light meditation
- **Beta (13-30 Hz):** Active thinking, focus, concentration
- **Gamma (30-100 Hz):** Peak performance, insight, binding

### Binaural Beats
Different frequencies played in each ear create a perceived beat frequency in the brain. Requires headphones.

### Isochronic Tones
Regularly pulsing tones that don't require headphones but are effective for rhythmic entrainment.

## 🏗️ Project Structure

```
BlueStarBeats/
├── src/
│   ├── components/          # React components
│   │   ├── AudioControlPanel.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FrequencyControl.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Oscilloscope.tsx
│   │   ├── PremiumModal.tsx
│   │   ├── SessionLibrary.tsx
│   │   ├── SessionTimer.tsx
│   │   └── WaveformSelector.tsx
│   ├── lib/                 # Core libraries
│   │   ├── audioEngine.ts   # Web Audio API engine
│   │   ├── premiumService.ts # Premium feature management
│   │   └── sessionProtocols.ts # Session definitions
│   ├── App.tsx              # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                  # Static assets
├── dist/                    # Production build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint with React hooks rules
- Prettier formatting (recommended)

## 🐛 Troubleshooting

### Audio Not Playing
- Ensure your browser supports Web Audio API
- Check browser permissions for audio
- Try clicking the play button to resume audio context

### Headphones Not Working
- Binaural beats require stereo headphones
- Check your system audio settings
- Ensure headphones are properly connected

### Performance Issues
- Close other browser tabs
- Disable browser extensions
- Use a modern browser (Chrome, Firefox, Edge, Safari)

## 📝 License

Copyright © 2025 Blue Star Beats. All rights reserved.

## 🤝 Contributing

This is a private project. For issues or feature requests, please contact the maintainer.

## 📧 Support

For support, email support@bluestarbeats.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Web Audio API documentation
- Brainwave entrainment research community
- React and Vite teams for excellent tooling

---

**Blue Star Beats** - Tune Your Mind. Unlock Your State.
