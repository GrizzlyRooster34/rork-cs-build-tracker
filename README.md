# CS Build Tracker

A comprehensive mobile app for tracking car modifications, maintenance, and build progress. Built specifically for the VW Passat B6 "CS" project car.

## Features

- **Maintenance Logging**: Track all maintenance activities with mileage, costs, and parts
- **Modification Tracker**: Document all mods by stage (0-3) with status tracking
- **Fuel Efficiency**: Log fuel fills and calculate MPG with octane tracking
- **Diagnostic Codes**: Track DTCs and diagnostic procedures
- **Photo Gallery**: Document build progress with tagged photos
- **Lighting System**: Plan and track custom lighting modifications
- **Notes & Journal**: Freeform notes for tuning logs and observations
- **Crash Recovery**: Track bodywork and damage repair progress
- **Audio System**: Document audio component installations
- **Blueprint Plans**: Technical drawings and modification plans

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Zustand** for state management
- **AsyncStorage** for data persistence
- **Expo Router** for navigation
- **Lucide React Native** for icons

## Installation

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Production Build

```bash
# Build for Android
eas build --platform android --profile production

# Build APK for testing
eas build --platform android --profile preview
```

## Android Requirements

- **Minimum**: Android 11 (API 30)
- **Target**: Android 14 (API 34)
- **Architecture**: ARM64, ARMv7

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── constants/             # App constants and theme
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── assets/               # Images and static assets
```

## Data Model

The app tracks a VW Passat B6 with:
- **VIN**: WVWZZZ3CZ8P123456
- **Engine**: BPY 2.0T FSI
- **Transmission**: 6MT
- **Mileage Offset**: +67,200 miles (cluster vs actual)
- **Current Mode**: Daily/Show toggle

## Build Stages

- **Stage 0**: Reliability and basic modifications
- **Stage 1**: K04 turbo upgrade with supporting mods
- **Stage 2**: High-performance internals
- **Stage 3**: Full tune and final modifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Android/iOS
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open a GitHub issue.