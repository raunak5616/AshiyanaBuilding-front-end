import { Config } from './env';

export const API_CONFIG = {
  baseUrl: Config.API_BASE_URL,
  timeout: Config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
export type ApiConfigType = typeof API_CONFIG;
