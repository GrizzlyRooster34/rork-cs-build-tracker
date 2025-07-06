# Android Build Instructions for CS Build Tracker

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI** (`npm install -g @expo/cli`)
3. **EAS CLI** (`npm install -g eas-cli`)
4. **Android Studio** (for local builds)
5. **Java Development Kit (JDK)** 17 or higher

## Build Process

### Option 1: EAS Build (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure the project:**
   ```bash
   eas build:configure
   ```

4. **Build APK for testing:**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Build AAB for Play Store:**
   ```bash
   eas build --platform android --profile production-aab
   ```

### Option 2: Local Build

1. **Prebuild for Android:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Install Android dependencies:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **Build locally:**
   ```bash
   npx expo run:android --variant release
   ```

## Build Profiles

- **development**: Development build with debugging enabled
- **preview**: Release APK for internal testing
- **production**: Release APK for distribution
- **production-aab**: Android App Bundle for Play Store

## Android Requirements

- **Minimum SDK**: Android 11 (API 30)
- **Target SDK**: Android 14 (API 34)
- **Compile SDK**: Android 14 (API 34)

## Permissions

The app requests the following permissions:
- Internet access (for future cloud sync)
- Storage access (for photo management)
- Camera access (for taking photos)
- Location access (for fuel station tracking)
- Vibration (for haptic feedback)

## Signing

For production builds, you'll need to:
1. Generate a keystore file
2. Configure signing in `eas.json`
3. Set up credentials with EAS

## Testing

1. Install the APK on Android 11+ device
2. Test all core features:
   - Maintenance logging
   - Modification tracking
   - Fuel efficiency tracking
   - Photo gallery
   - Data persistence

## Troubleshooting

- If build fails, check Android SDK versions
- Ensure all dependencies are compatible with target SDK
- Clear Metro cache: `npx expo start --clear`
- Clean Android build: `cd android && ./gradlew clean`