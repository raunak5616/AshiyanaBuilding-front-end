import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../features/products/productApi';

interface RecentlyViewedState {
  items: Product[];
}

const initialState: RecentlyViewedState = {
  items: [],
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    addProductToRecentlyViewed: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      // Filter out if it already exists
      const filtered = state.items.filter((item) => item.id !== product.id);
      // Put at the start of the list, keep max 10
      state.items = [product, ...filtered].slice(0, 10);
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
    },
  },
});

export const { addProductToRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
