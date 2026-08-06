import { Platform, TextStyle } from 'react-native';

const SYSTEM_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const TYPOGRAPHY: Record<string, TextStyle> = {
  display: {
    fontFamily: SYSTEM_FONT,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: 0.25,
  },
  heading: {
    fontFamily: SYSTEM_FONT,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: 0,
  },
  title: {
    fontFamily: SYSTEM_FONT,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle: {
    fontFamily: SYSTEM_FONT,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: SYSTEM_FONT,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  caption: {
    fontFamily: SYSTEM_FONT,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  button: {
    fontFamily: SYSTEM_FONT,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
} as const;
