import { apiSlice } from '../../api/apiSlice';
import { Product } from '../products/productApi';

export interface Wishlist {
  id: string;
  shopId: string;
  customerUserId: string;
  products: Product[];
}

interface WishlistResponse {
  data: Wishlist;
}

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistResponse, void>({
      query: () => ({
        url: '/customer/cart/wishlist',
        method: 'GET',
      }),
    }),
    addToWishlist: builder.mutation<WishlistResponse, string>({
      query: (productId) => ({
        url: `/customer/cart/wishlist/${productId}`,
        method: 'POST',
      }),
    }),
    removeFromWishlist: builder.mutation<WishlistResponse, string>({
      query: (productId) => ({
        url: `/customer/cart/wishlist/${productId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
export type WishlistApiType = typeof wishlistApi;
