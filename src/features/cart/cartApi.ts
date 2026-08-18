import { apiSlice } from '../../api/apiSlice';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { Product } from '../products/productApi';

export interface CartItem {
  productId: Product;
  quantity: number;
  _id: string;
}

export interface Cart {
  id: string;
  shopId: string;
  customerUserId: string;
  items: CartItem[];
}

interface CartResponse {
  data: Cart;
}

export const cartApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.CART,
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),
    syncCart: builder.mutation<CartResponse, { items: { productId: string; quantity: number }[] }>({
      query: (body) => ({
        url: API_ENDPOINTS.CART,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    addToCart: builder.mutation<CartResponse, { productId: string; quantity?: number }>({
      query: (body) => ({
        url: API_ENDPOINTS.CART_ADD,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<CartResponse, { productId: string; quantity?: number }>({
      query: (body) => ({
        url: API_ENDPOINTS.CART_REMOVE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useSyncCartMutation,
  useAddToCartMutation,
  useRemoveFromCartMutation,
} = cartApi;
