# CS Build Tracker

A comprehensive mobile app for tracking and managing everything related to a 2008 VW Passat B6 (BPY engine) restoration and performance project.

## Features

### 🔧 Maintenance Log
- Track oil changes, coolant top-offs, tire swaps, and more
- Record cluster vs actual mileage with automatic offset calculation
- Categorize by system (engine, suspension, electrical, etc.)
- Add photos and detailed notes

### 🏁 Performance Mod Tracker
- Track current vs planned modifications by stage (0-3)
- Monitor installation status and costs
- Source tracking (ECS Tuning, Amazon, Junkyard, etc.)
- Performance impact notes

### ⚠️ DTC Log & Diagnostics
- Track fault codes from OBDeleven or VCDS
- Monitor active vs resolved codes
- Freeze frame data storage
- System-specific categorization

### ⛽ Fuel Efficiency Log
- Track octane type, gallons, cost, and MPG
- Performance notes for different driving styles
- Cost per mile calculations
- Fuel quality tracking (including Boostane)

### 📸 Photo Gallery
- Organize photos by category (mods, lighting, diagnostics, etc.)
- Version tracking for progress documentation
- Before/after comparisons

### 💡 Lighting & Show Mode
- Track underglow, DRL, and interior lighting setups
- Music sync and boost sync configurations
- Wiring diagrams and controller settings

### 🎵 Audio System Tracker
- Document speaker, amp, and sub configurations
- Power requirements and wiring notes
- Component locations and specifications

### 🚗 Crash Recovery & Bodywork
- Track damage assessment and repair progress
- Parts sourcing for rebuilds
- Dimension references for glass and body panels

### 📐 Blueprint & Dimensions
- Vehicle dimension reference (1414 x 889 x 928 mm rear glass, etc.)
- Project blueprints with step-by-step guides
- Tool and material requirements
- Difficulty ratings and time estimates

### 📝 Project Notes & Journal
- Freeform entries for observations and ideas
- Tuning logs and route testing notes
- Tag-based organization

## Technical Details

### Current Vehicle Stats
- **Cluster Offset**: +67,200 miles
- **Current Cluster**: 209,843 miles
- **Actual Mileage**: ~277,043 miles
- **Engine**: BPY 2.0T FSI
- **Known Issues**: P0341 (CPS), P0100 (MAF), Cylinder 2 open circuit

### Installed Modifications
- Rev D DV, Catch Can w/ 034 Plate, Dogbone Insert
- NGK BKR7EIX plugs, new coil packs
- R36-style DRL headlights, GTI rear spoiler
- White LED grille outline + purple underglow
- Kicker audio system with Power Acoustik components

### Planned Upgrades
- **Stage 1**: K04 Turbo, Meth Kit, Dual Gauges
- **Stage 2**: HPFP, Roller Follower, Fluidampr
- **Stage 3**: K04 Tune, Intercooler, Muffler Delete
- **Suspension**: Coilovers, Poly Inserts, Sway Bars

## Tech Stack

- **Framework**: React Native with Expo
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet with custom theme
- **Icons**: Lucide React Native
- **Platform Support**: iOS, Android, and Web

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cs-build-tracker.git
cd cs-build-tracker
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm run start
# or
bun run start
```

4. Open the app:
- **iOS**: Press `i` to open in iOS Simulator
- **Android**: Press `a` to open in Android Emulator
- **Web**: Press `w` to open in web browser

### Available Scripts

- `npm run start` - Start the Expo development server
- `npm run start:web` - Start for web development
- `npm run start:tunnel` - Start with tunnel for device testing
- `npm run build` - Build for production
- `npm run build:web` - Build for web deployment
- `npm run android` - Start Android development
- `npm run ios` - Start iOS development
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── maintenance.tsx # Maintenance log
│   │   ├── modifications.tsx # Mod tracker
│   │   ├── diagnostics.tsx # DTC log
│   │   ├── fuel.tsx       # Fuel efficiency
│   │   ├── gallery.tsx    # Photo gallery
│   │   ├── lighting.tsx   # Lighting setup
│   │   ├── audio.tsx      # Audio system
│   │   ├── crash.tsx      # Crash recovery
│   │   ├── blueprint.tsx  # Blueprints & dimensions
│   │   ├── notes.tsx      # Project notes
│   │   └── reminders.tsx  # Maintenance reminders
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screens
├── components/            # Reusable components
├── constants/             # App constants and theme
├── store/                 # Zustand state stores
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── assets/               # Images and static assets
```

## Data Management

The app uses Zustand for state management with AsyncStorage persistence. Each module has its own store:

- `carStore.ts` - Vehicle profile and settings
- `maintenanceStore.ts` - Maintenance entries
- `modificationsStore.ts` - Performance modifications
- `diagnosticsStore.ts` - Diagnostic codes and traces
- `fuelStore.ts` - Fuel efficiency data
- `galleryStore.ts` - Photo management
- `lightingStore.ts` - Lighting configurations
- `audioStore.ts` - Audio system components
- `crashStore.ts` - Crash and bodywork tracking
- `blueprintStore.ts` - Project blueprints and dimensions
- `notesStore.ts` - Project notes and journal
- `reminderStore.ts` - Maintenance reminders

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the VW Passat B6 community
- Inspired by the need for comprehensive project tracking
- Special thanks to ECS Tuning, 034Motorsport, and the VW modding community

---

**Note**: This app is specifically designed for a 2008 VW Passat B6 with BPY engine, but the structure can be adapted for other vehicle projects.