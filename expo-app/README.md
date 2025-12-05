# BlueStarBeats Expo App

A React Native/Expo application for binaural beats and isochronic tones to help with focus, relaxation, sleep, and meditation.

## Tech Stack

- **Framework:** Expo (SDK 54)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Audio:** Web Audio API (web) / expo-av (native)
- **State:** React Context API + AsyncStorage

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios     # iOS Simulator (macOS only)
npm run android # Android Emulator
npm run web     # Web browser
```

## Project Structure

```
expo-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── explore.tsx    # Session library
│   │   └── profile.tsx    # User profile
│   ├── _layout.tsx        # Root layout with providers
│   └── now-playing.tsx    # Audio player screen
├── components/            # Reusable UI components
├── contexts/              # React Context providers
│   ├── AudioContext.tsx   # Audio playback state
│   ├── PremiumContext.tsx # Subscription state
│   └── ProgressContext.tsx # Session history
├── lib/                   # Core functionality
│   ├── audioEngine.ts     # RN audio wrapper
│   ├── audioEngineWeb.ts  # Web Audio API implementation
│   └── sessions.ts        # Pre-defined sessions
├── services/              # API integrations
└── types/                 # TypeScript definitions
```

## Features

- **Binaural Beats:** Different frequencies for left/right ears create brainwave entrainment
- **Isochronic Tones:** Pulsing tones for brainwave synchronization
- **Preset Sessions:** Focus, Relax, Sleep, and Meditation categories
- **Session Tracking:** History and streak tracking with AsyncStorage
- **Premium Support:** Context-based premium feature gating

## Available Sessions

| Category | Frequency Range | Effect |
|----------|----------------|--------|
| Focus | 12-40 Hz (Beta/Gamma) | Enhanced concentration |
| Relax | 8-12 Hz (Alpha) | Stress relief |
| Sleep | 0.5-4 Hz (Delta) | Deep sleep |
| Meditate | 4-8 Hz (Theta) | Meditation, creativity |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
APP_ENV=development
API_URL=http://localhost:3000
```

## License

MIT
