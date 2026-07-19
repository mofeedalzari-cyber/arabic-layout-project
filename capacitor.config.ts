import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'كرتي',
  webDir: '.output/public',
  server: {
    url: 'https://arabic-layout-project.onrender.com',
    cleartext: true
  }
};

export default config;