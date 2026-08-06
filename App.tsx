import React from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { store, RootState } from './src/store/store';
import { LightTheme, DarkTheme } from './src/theme/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

function AppContent() {
  const themeMode = useSelector((state: RootState) => state.settings.themeMode);
  const activeTheme = themeMode === 'dark' ? DarkTheme : LightTheme;

  return (
    <PaperProvider theme={activeTheme}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AppContent />
    </ReduxProvider>
  );
}
