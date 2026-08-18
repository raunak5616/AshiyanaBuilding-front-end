import { apiSlice } from '../../api/apiSlice';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { Product } from '../products/productApi';

export interface OrderItem {
  productId: Product;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  _id: string;
}

export interface ShippingAddress {
  receiverName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface Order {
  id: string;
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'cash' | 'online';
  walletAmountUsed?: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderListResponse {
  data: Order[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

interface OrderDetailsResponse {
  data: Order & { paymentUrl?: string };
}

export const orderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrderHistory: builder.query<OrderListResponse, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => ({
        url: API_ENDPOINTS.ORDERS,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getOrderDetails: builder.query<OrderDetailsResponse, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.ORDERS}/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    placeOrder: builder.mutation<
      OrderDetailsResponse,
      {
        items: { productId: string; quantity: number }[];
        shippingAddress: ShippingAddress;
        paymentMethod: 'cash' | 'online';
        useWallet: boolean;
        notes?: string;
      }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.ORDERS,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, 'Cart'],
    }),
    cancelOrder: builder.mutation<OrderDetailsResponse, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.ORDERS}/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrderHistoryQuery,
  useGetOrderDetailsQuery,
  usePlaceOrderMutation,
  useCancelOrderMutation,
} = orderApi;
