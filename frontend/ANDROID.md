# BORHS Data Android app

The customer, agent, and admin dashboards are bundled in one role-aware Android application.

## Requirements

- Android Studio with Android SDK 36
- JDK 21 (the build script automatically uses Android Studio's bundled JDK)
- Android 7.0 (API 24) or newer for the target device

## Build a debug APK

From the `frontend` directory:

```powershell
npm run android:apk
```

The first build downloads Gradle and Android dependencies and therefore requires a stable internet connection. Later builds reuse the local cache.

The APK will be written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Develop in Android Studio

```powershell
npm run build:mobile
npm run android:open
```

After changing React code, run `npm run build:mobile` again before rebuilding the Android app.

## Release build

In Android Studio, use **Build > Generate Signed App Bundle or APK**, create or select a private keystore, and choose the `release` variant. Keep the keystore and passwords outside source control. For Google Play, generate an Android App Bundle (`.aab`); for direct installation, generate a signed APK.

The native application ID is `com.borhsdata.app`. Change it only before publishing the first release.
