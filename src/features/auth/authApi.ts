import { apiSlice } from '../../api/apiSlice';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { CustomerUser } from '../../store/authSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ data: { customer: CustomerUser; accessToken: string } }, any>({
      query: (credentials) => ({
        url: API_ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation<{ data: { customer: CustomerUser; accessToken: string } }, any>({
      query: (userData) => ({
        url: API_ENDPOINTS.SIGNUP,
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation<any, void>({
      query: () => ({
        url: API_ENDPOINTS.LOGOUT,
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation<any, { shopId: string; email: string }>({
      query: (payload) => ({
        url: API_ENDPOINTS.FORGOT_PASSWORD,
        method: 'POST',
        body: payload,
      }),
    }),
    resetPassword: builder.mutation<any, any>({
      query: (payload) => ({
        url: API_ENDPOINTS.RESET_PASSWORD,
        method: 'POST',
        body: payload,
      }),
    }),
    getProfile: builder.query<{ data: CustomerUser }, void>({
      query: () => ({
        url: API_ENDPOINTS.PROFILE,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
} = authApi;
export type AuthApiType = typeof authApi;
