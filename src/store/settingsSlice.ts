import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  themeMode: 'light' | 'dark';
}

const initialState: SettingsState = {
  themeMode: 'light',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
    },
  },
});

export const { setThemeMode } = settingsSlice.actions;
export default settingsSlice.reducer;
