export const VALIDATION_REGEX = {
  PHONE: /^[6-9]\d{9}$/, // Enforces Indian 10-digit phone format starting with 6-9
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
