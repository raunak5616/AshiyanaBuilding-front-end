import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_PORT = 5000;

export const ENV = {
  development: {
    API_BASE_URL: `http://${DEV_HOST}:${DEV_PORT}/api/v1`,
    TIMEOUT: 15000,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.ashiyana.com/api/v1',
    TIMEOUT: 15000,
  },
  production: {
    API_BASE_URL: 'https://api.ashiyana.com/api/v1',
    TIMEOUT: 15000,
  },
};

// Change this to switch environments
export const CURRENT_ENV: keyof typeof ENV = 'development';

export const Config = ENV[CURRENT_ENV];
