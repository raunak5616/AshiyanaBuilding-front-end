import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CustomerUser {
  id: string;
  shopId: string;
  customerId?: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  walletBalance?: number;
}

interface AuthState {
  user: CustomerUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Tracks if Splash bootstrapper finished checking storage keys
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: CustomerUser; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<CustomerUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setCredentials, updateUser, clearCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;
export type AuthStateType = AuthState;
