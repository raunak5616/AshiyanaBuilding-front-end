import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { SplashScreen } from '../features/splash/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';

export const AppNavigator = () => {
  const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {!isInitialized ? (
        <SplashScreen />
      ) : isAuthenticated ? (
        <TabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
export default AppNavigator;
