import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.speakeasy.app',
  appName: 'SpeakEasy',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  ios: {
    minVersion: '16.0'
  },
  plugins: {
    NativeTts: {},
  }
};

export default config;
