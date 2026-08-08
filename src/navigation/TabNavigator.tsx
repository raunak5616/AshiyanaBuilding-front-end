import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../store/authSlice';
import { secureStore } from '../utils/secureStore';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { COLORS } from '../theme/colors';
import { ROUTES } from '../constants/routes';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState } from '../store/store';
import { authApi } from '../features/auth/authApi';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import SearchScreen from '../screens/main/SearchScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Search" component={SearchScreen} />
  </HomeStack.Navigator>
);

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.center}>
    <Text style={styles.text}>{name} Screen</Text>
    <Text style={styles.subtext}>Shopping feature is currently out of scope for Phase 1</Text>
  </View>
);

const ProfilePlaceholderScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [logoutMutation] = authApi.useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (e) {
      // Proceed even if api call fails
    }
    dispatch(clearCredentials());
    await secureStore.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await secureStore.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
  };

  return (
    <View style={styles.center}>
      <Text style={styles.text}>Welcome, {user?.fullName || 'Customer'}</Text>
      <Text style={styles.subtext}>{user?.email}</Text>
      <Text style={styles.subtext}>Phone: {user?.phone}</Text>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
        buttonColor={COLORS.error}
        textColor={COLORS.background}
      >
        Logout
      </Button>
    </View>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle';
          if (route.name === ROUTES.MAIN.HOME) iconName = 'home';
          else if (route.name === ROUTES.MAIN.CATEGORIES) iconName = 'view-grid';
          else if (route.name === ROUTES.MAIN.WISHLIST) iconName = 'heart';
          else if (route.name === ROUTES.MAIN.CART) iconName = 'cart';
          else if (route.name === ROUTES.MAIN.ORDERS) iconName = 'clipboard-text';
          else if (route.name === ROUTES.MAIN.PROFILE) iconName = 'account';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.secondary,
        },
        headerStyle: {
          backgroundColor: COLORS.secondary,
        },
        headerTintColor: COLORS.background,
      })}
    >
      <Tab.Screen
        name={ROUTES.MAIN.HOME}
        component={HomeNavigator}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name={ROUTES.MAIN.CATEGORIES}
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Tab.Screen name={ROUTES.MAIN.WISHLIST} options={{ title: 'Wishlist' }}>
        {() => <PlaceholderScreen name="Wishlist" />}
      </Tab.Screen>
      <Tab.Screen name={ROUTES.MAIN.CART} options={{ title: 'Cart' }}>
        {() => <PlaceholderScreen name="Cart" />}
      </Tab.Screen>
      <Tab.Screen name={ROUTES.MAIN.ORDERS} options={{ title: 'Orders' }}>
        {() => <PlaceholderScreen name="Orders" />}
      </Tab.Screen>
      <Tab.Screen
        name={ROUTES.MAIN.PROFILE}
        component={ProfilePlaceholderScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
    width: '60%',
  },
});
