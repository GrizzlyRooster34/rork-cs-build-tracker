# Android Build Instructions for CS Build Tracker

## Prerequisites

1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure Project**:
   ```bash
   eas build:configure
   ```

## Building for Android

### Option 1: Cloud Build (Recommended)

1. **Build APK for testing**:
   ```bash
   eas build --platform android --profile preview
   ```

2. **Build for production**:
   ```bash
   eas build --platform android --profile production
   ```

### Option 2: Local Build

1. **Install Android Studio and SDK**
2. **Set up environment variables**:
   - `ANDROID_HOME`
   - `JAVA_HOME`

3. **Generate native code**:
   ```bash
   npx expo prebuild --platform android
   ```

4. **Build locally**:
   ```bash
   npx expo run:android --variant release
   ```

## Installation on Android 11+

1. **Enable Developer Options** on your Android device
2. **Enable USB Debugging**
3. **Install via ADB**:
   ```bash
   adb install path/to/your-app.apk
   ```

Or simply download the APK from EAS Build and install directly on device.

## Key Features for Android 11+

- **Target SDK 34** (Android 14) with backward compatibility to Android 11
- **Scoped Storage** support for file operations
- **Runtime Permissions** for camera, location, and storage
- **Adaptive Icons** for modern Android launchers
- **Dark/Light Theme** support following system preferences

## Troubleshooting

- If build fails, check `eas.json` configuration
- Ensure all required permissions are declared in `app.json`
- For local builds, verify Android SDK and build tools are properly installed
- Check that `compileSdkVersion` and `targetSdkVersion` are compatible with your device

## App Permissions

The app requests the following permissions:
- **Internet**: For potential future online features
- **Camera**: For taking photos of modifications and repairs
- **Storage**: For saving photos and data
- **Location**: For fuel tracking and maintenance logs
- **Vibration**: For haptic feedback

All permissions are optional and the app will work without them, with reduced functionality.