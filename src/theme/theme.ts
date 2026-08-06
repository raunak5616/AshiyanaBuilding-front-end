import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from './colors';
import { RADIUS } from './radius';
import { SPACING } from './spacing';
import { TYPOGRAPHY } from './typography';
import { SHADOWS } from './shadows';

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    outline: COLORS.border,
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
    text: COLORS.textPrimary,
    onSurface: COLORS.textPrimary,
    onBackground: COLORS.textPrimary,
    placeholder: COLORS.placeholder,
    disabled: COLORS.disabled,
  },
  spacing: SPACING,
  radius: RADIUS,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primaryDark,
    secondary: COLORS.secondary,
    background: COLORS.dark.background,
    surface: COLORS.dark.surface,
    outline: COLORS.dark.border,
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
    text: COLORS.dark.textPrimary,
    onSurface: COLORS.dark.textPrimary,
    onBackground: COLORS.dark.textPrimary,
    placeholder: COLORS.dark.placeholder,
    disabled: COLORS.dark.disabled,
  },
  spacing: SPACING,
  radius: RADIUS,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
};

export type ThemeType = typeof LightTheme;
export type DarkThemeType = typeof DarkTheme;
