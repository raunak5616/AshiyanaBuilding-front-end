import { Platform } from 'react-native';

// Set this to your local computer's IP address so physical devices on the same Wi-Fi and emulators can connect to the backend
const DEV_HOST = '192.168.31.239';
const DEV_PORT = 5000;

export const ENV = {
  development: {
    API_BASE_URL: `http://${DEV_HOST}:${DEV_PORT}/api/v1`,
    TIMEOUT: 15000,
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.ashiyana.com/api/v1',
    TIMEOUT: 15000,
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
  production: {
    API_BASE_URL: 'https://ashiyanabuilding-backend.onrender.com/api/v1',
    TIMEOUT: 15000,
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
};

// Change this to switch environments
export const CURRENT_ENV: keyof typeof ENV = 'development';

export const Config = ENV[CURRENT_ENV];
