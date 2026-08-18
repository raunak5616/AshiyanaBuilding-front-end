import { apiSlice } from '../../api/apiSlice';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export interface Slide {
  id: string;
  shopId: string;
  imageUrl: string;
  publicId: string;
  categoryId?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SlideListResponse {
  data: Slide[];
}

export const slidesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSlides: builder.query<SlideListResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.SLIDES,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Slide' as const, id })),
              { type: 'Slide', id: 'LIST' },
            ]
          : [{ type: 'Slide', id: 'LIST' }],
    }),
  }),
});

export const { useGetSlidesQuery } = slidesApi;
