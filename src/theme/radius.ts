import { THEME_CONSTANTS } from '../constants/themeConstants';

export const RADIUS = {
  xs: 4,
  sm: THEME_CONSTANTS.BORDER_RADIUS_SMALL,   // 8px
  md: THEME_CONSTANTS.BORDER_RADIUS_MEDIUM,  // 12px
  lg: THEME_CONSTANTS.BORDER_RADIUS_LARGE,   // 16px
  round: 9999,
} as const;
