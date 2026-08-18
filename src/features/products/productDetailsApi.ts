import { apiSlice } from '../../api/apiSlice';
import { Product } from './productApi';

interface ProductDetailsResponse {
  data: Product;
}

interface ProductsListResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const productDetailsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductDetailsFromDetails: builder.query<ProductDetailsResponse, string>({
      query: (id) => ({
        url: `/customer/products/${id}`,
        method: 'GET',
      }),
    }),
    getRelatedProducts: builder.query<ProductsListResponse, { categoryId: string; limit?: number }>({
      query: ({ categoryId, limit = 5 }) => ({
        url: '/customer/products',
        method: 'GET',
        params: {
          categoryId,
          limit,
          page: 1,
        },
      }),
    }),
  }),
});

export const {
  useGetProductDetailsFromDetailsQuery,
  useGetRelatedProductsQuery,
} = productDetailsApi;
