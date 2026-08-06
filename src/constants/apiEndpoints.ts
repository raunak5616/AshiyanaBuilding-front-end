export const API_ENDPOINTS = {
  SIGNUP: '/customer-auth/signup',
  LOGIN: '/customer-auth/login',
  REFRESH_TOKEN: '/customer-auth/refresh-token',
  LOGOUT: '/customer-auth/logout',
  FORGOT_PASSWORD: '/customer-auth/forgot-password',
  RESET_PASSWORD: '/customer-auth/reset-password',
  CHANGE_PASSWORD: '/customer-auth/change-password',
  PROFILE: '/customer',
} as const;
