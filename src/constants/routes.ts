export const ROUTES = {
  SPLASH: 'Splash',
  AUTH: {
    ROOT: 'AuthRoot',
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
  },
  MAIN: {
    ROOT: 'MainRoot',
    HOME: 'HomeTab',
    CATEGORIES: 'CategoriesTab',
    WISHLIST: 'WishlistTab',
    CART: 'CartTab',
    ORDERS: 'OrdersTab',
    PROFILE: 'ProfileTab',
  },
} as const;
