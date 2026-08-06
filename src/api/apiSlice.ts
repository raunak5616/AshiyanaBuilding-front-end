import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../config/api';
import { secureStore } from '../utils/secureStore';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { clearCredentials, setCredentials } from '../store/authSlice';

// Lock/Queue variables for token refresh operations
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  prepareHeaders: async (headers) => {
    // 1. Inject JWT Access Token
    const accessToken = await secureStore.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // 2. Inject Refresh Token in the Cookie header manually (simulating web cookies)
    const refreshToken = await secureStore.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      headers.set('Cookie', `customerRefreshToken=${refreshToken}`);
    }

    return headers;
  },
});

const handleSetCookie = async (headers: Headers) => {
  const setCookie = headers.get('set-cookie');
  if (setCookie) {
    const match = setCookie.match(/customerRefreshToken=([^;]+)/);
    if (match && match[1]) {
      await secureStore.setItem(STORAGE_KEYS.REFRESH_TOKEN, match[1]);
    }
  }
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Capture refresh cookies on signup/login/refresh calls
  if (result.meta?.response?.headers) {
    await handleSetCookie(result.meta.response.headers);
  }

  // Check if token has expired or is invalid
  if (
    result.error &&
    result.error.status === 401 &&
    ((result.error.data as any)?.errorCode === 'AUTH_TOKEN_VERSION_STALE' ||
      (result.error.data as any)?.message?.includes('expired') ||
      (result.error.data as any)?.message?.includes('jwt'))
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResult = await baseQuery(
          {
            url: '/customer-auth/refresh-token',
            method: 'POST',
          },
          api,
          extraOptions
        );

        const resData = refreshResult.data as any;
        if (resData && resData.data && resData.data.accessToken) {
          const newAccessToken = resData.data.accessToken;
          const user = resData.data.customer;

          await secureStore.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          if (refreshResult.meta?.response?.headers) {
            await handleSetCookie(refreshResult.meta.response.headers);
          }

          api.dispatch(setCredentials({ user, accessToken: newAccessToken }));
          onTokenRefreshed(newAccessToken);
          isRefreshing = false;
        } else {
          // Token refresh failed or rejected
          api.dispatch(clearCredentials());
          await secureStore.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
          await secureStore.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
          isRefreshing = false;
        }
      } catch (err) {
        api.dispatch(clearCredentials());
        await secureStore.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStore.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
        isRefreshing = false;
      }
    }

    // Wait for silent refresh completion to re-run current query
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        if (typeof args === 'string') {
          resolve(baseQuery(args, api, extraOptions));
        } else {
          const customHeaders = {
            ...args.headers,
            Authorization: `Bearer ${newToken}`,
          };
          resolve(baseQuery({ ...args, headers: customHeaders }, api, extraOptions));
        }
      });
    });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
