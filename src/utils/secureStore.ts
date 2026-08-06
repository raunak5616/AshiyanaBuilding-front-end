import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const secureStore = {
  /**
   * Saves a string value securely on native or falls back to AsyncStorage on web.
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`SecureStore error setting key ${key}:`, error);
    }
  },

  /**
   * Reads a string value securely on native or falls back to AsyncStorage on web.
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`SecureStore error getting key ${key}:`, error);
      return null;
    }
  },

  /**
   * Deletes a key securely on native or falls back to AsyncStorage on web.
   */
  async deleteItem(key: string): Promise<void> {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`SecureStore error deleting key ${key}:`, error);
    }
  },
};
export type SecureStoreType = typeof secureStore;
