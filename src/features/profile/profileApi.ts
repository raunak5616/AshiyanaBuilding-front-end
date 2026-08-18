import { apiSlice } from '../../api/apiSlice';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { CustomerUser } from '../../store/authSlice';

export interface SavedAddress {
  id: string;
  _id: string;
  label: string;
  receiverName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  landmark?: string;
}

interface AddressListResponse {
  data: SavedAddress[];
}

interface AddressDetailsResponse {
  data: SavedAddress;
}

interface ProfileResponse {
  data: CustomerUser;
}

export const profileApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    updateProfile: builder.mutation<
      ProfileResponse,
      {
        fullName?: string;
        email?: string;
        phone?: string;
        latitude?: number;
        longitude?: number;
        landmark?: string;
        addressLine?: string;
        city?: string;
        state?: string;
        postalCode?: string;
      }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.PROFILE,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    listAddresses: builder.query<AddressListResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.ADDRESSES,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Address' as const, id })),
              { type: 'Address', id: 'LIST' },
            ]
          : [{ type: 'Address', id: 'LIST' }],
    }),
    createAddress: builder.mutation<
      AddressDetailsResponse,
      Omit<SavedAddress, 'id'>
    >({
      query: (body) => ({
        url: API_ENDPOINTS.ADDRESSES,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    updateAddress: builder.mutation<
      AddressDetailsResponse,
      { id: string; body: Partial<Omit<SavedAddress, 'id'>> }
    >({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.ADDRESSES}/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),
    deleteAddress: builder.mutation<any, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.ADDRESSES}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = profileApi;
