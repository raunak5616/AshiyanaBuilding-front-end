import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../features/products/productApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_PERSIST_KEY = '@wishlist_items';

interface WishlistState {
  items: Product[];
  productIds: string[];
}

const initialState: WishlistState = {
  items: [],
  productIds: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.productIds = action.payload.map((p) => p.id);
      
      // Persist to AsyncStorage for offline support
      AsyncStorage.setItem(WISHLIST_PERSIST_KEY, JSON.stringify(action.payload)).catch((err) =>
        console.error('Failed to cache wishlist offline:', err)
      );
    },
    loadOfflineWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.productIds = action.payload.map((p) => p.id);
    },
  },
});

export const { setWishlist, loadOfflineWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

// Helper to load persisted wishlist from AsyncStorage on app startup
export const initializeOfflineWishlist = () => async (dispatch: any) => {
  try {
    const saved = await AsyncStorage.getItem(WISHLIST_PERSIST_KEY);
    if (saved) {
      const items = JSON.parse(saved) as Product[];
      dispatch(loadOfflineWishlist(items));
    }
  } catch (err) {
    console.error('Failed to load offline wishlist:', err);
  }
};
