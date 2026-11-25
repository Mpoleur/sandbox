import type { ExpoConfig } from 'expo/config';

// One code base, two builds (Technical Analysis DR-12):
//   public (default): com.poleur.cards, hides the 10 culture-check symbols (158 visible)
//   review: com.poleur.cards.review, shows all 168 symbols with a "needs check" mark
// Choose with the environment variable APP_VARIANT=review before "expo prebuild".
const variant: 'public' | 'review' = process.env.APP_VARIANT === 'review' ? 'review' : 'public';

const config: ExpoConfig = {
  name: variant === 'review' ? 'Travel Cards (review)' : 'Travel Cards',
  slug: 'travel-card',
  version: '0.4.0',
  orientation: 'default', // all orientations (landscape display is a Should have)
  icon: './assets/icon/icon.png', // Dali's logo A3
  userInterfaceStyle: 'light',
  platforms: ['android'],
  android: {
    package: variant === 'review' ? 'com.poleur.cards.review' : 'com.poleur.cards',
    versionCode: 5,
    allowBackup: false, // nothing leaves the device: no Android cloud backup (FA 8)
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      // Dali's approved logo A3: yellow background layer, the card pair as foreground, a one-colour layer for themed icons.
      backgroundImage: './assets/icon/background.png',
      foregroundImage: './assets/icon/foreground.png',
      monochromeImage: './assets/icon/monochrome.png',
    },
    // V1 never uses the network and needs no storage or microphone access. WRITE_SETTINGS is listed on purpose:
    // the app-level brightness call needs no permission (Technical Analysis 10), so it must never be in the APK.
    blockedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.VIBRATE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.RECORD_AUDIO',
      'android.permission.WRITE_SETTINGS',
    ],
  },
  plugins: [
    './plugins/withShortNativeBuildPaths',
    'expo-sqlite',
    [
      'expo-image-picker',
      {
        // Only the CAMERA permission is wanted. Without microphone: no RECORD_AUDIO.
        cameraPermission: 'Travel Cards uses the camera only when you choose Take a photo, to add a photo to a card.',
        microphonePermission: false,
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          // arm64 only: every current phone and tablet. Matthieu's decision of 23/11/2026: current Android only, so no
          // 32-bit or x86 builds (this also keeps the Windows build paths short, see plugins/withShortNativeBuildPaths.js).
          buildArchs: ['arm64-v8a'],
        },
      },
    ],
  ],
  extra: {
    variant,
    showUnreviewed: variant === 'review',
  },
};

export default config;
