import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.speakeasy.app',
  appName: 'SpeakEasy',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  plugins: {
    NativeTts: {},
  }
};

export default config;
