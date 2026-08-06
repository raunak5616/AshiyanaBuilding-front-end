import { store } from '../../store/store';
import { secureStore } from '../../utils/secureStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { authApi } from '../auth/authApi';
import { setCredentials, clearCredentials, setInitialized } from '../../store/authSlice';

export const SplashService = {
  /**
   * Reads SecureStore, validates token by getting profile,
   * updates redux state, and returns true if authenticated.
   */
  async bootstrap(): Promise<boolean> {
    try {
      const accessToken = await secureStore.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await secureStore.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!accessToken || !refreshToken) {
        store.dispatch(clearCredentials());
        store.dispatch(setInitialized(true));
        return false;
      }

      // Query the customer profile to verify accessToken validity
      const result = await store.dispatch(
        authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
      );

      if (result.data && result.data.data) {
        const user = result.data.data;
        store.dispatch(setCredentials({ user, accessToken }));
        store.dispatch(setInitialized(true));
        return true;
      } else {
        // Token is invalid/expired (RTK query custom baseQuery handles auto-refresh internally)
        // If profile fetch fails completely, clear everything to enforce login
        store.dispatch(clearCredentials());
        store.dispatch(setInitialized(true));
        return false;
      }
    } catch (error) {
      store.dispatch(clearCredentials());
      store.dispatch(setInitialized(true));
      return false;
    }
  },
};
