import React, { useEffect } from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { store, RootState } from './src/store/store';
import { LightTheme, DarkTheme } from './src/theme/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';

function AppContent() {
  const themeMode = useSelector((state: RootState) => state.settings.themeMode);
  const activeTheme = themeMode === 'dark' ? DarkTheme : LightTheme;

  useEffect(() => {
    async function checkAndApplyUpdates() {
      try {
        if (__DEV__) {
          console.log('Skipping OTA update check in development mode.');
          return;
        }

        // Only check if expo-updates is enabled in the current native build
        if (!Updates.isEnabled) {
          console.log('EAS Updates are not enabled/supported in this build.');
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('New OTA update available. Fetching update...');
          await Updates.fetchUpdateAsync();
          console.log('Update fetched successfully. Reloading application...');
          await Updates.reloadAsync();
        } else {
          console.log('No new OTA updates available.');
        }
      } catch (error) {
        // Fail gracefully so the application still loads normally
        console.warn('Error checking or loading OTA update:', error);
      }
    }

    checkAndApplyUpdates();
  }, []);

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
