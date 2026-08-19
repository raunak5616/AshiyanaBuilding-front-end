import { apiSlice } from '../../api/apiSlice';

export interface ProductImage {
  url: string;
  publicId: string;
  altText?: string;
}

export interface Product {
  id: string;
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string | null;
  brandId: string | null;
  unitId: string;
  description: string;
  sellingPrice: number; // in paise
  mrp?: number; // in paise
  taxRate: number;
  images: ProductImage[];
  isActive: boolean;
}

export interface Category {
  id: string;
  _id: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

interface CategoriesResponse {
  data: Category[];
}

interface BrandsResponse {
  data: Brand[];
}

interface ProductDetailsResponse {
  data: Product;
}

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query<
      ProductsResponse,
      {
        categoryId?: string;
        brandId?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: 'price' | 'name' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: (params) => ({
        url: '/customer/products',
        method: 'GET',
        params,
      }),
    }),
    getProductDetails: builder.query<ProductDetailsResponse, string>({
      query: (id) => ({
        url: `/customer/products/${id}`,
        method: 'GET',
      }),
    }),
    getCategories: builder.query<CategoriesResponse, void>({
      query: () => ({
        url: '/customer/categories',
        method: 'GET',
      }),
    }),
    getBrands: builder.query<BrandsResponse, void>({
      query: () => ({
        url: '/customer/brands',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} = productApi;
