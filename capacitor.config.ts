import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sakeenah.app',
  appName: 'سَكِينَة - Sakeenah AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_sakeenah',
      iconColor: '#b88a4f',
      sound: 'azan.wav',
    },
  },
};

export default config;
