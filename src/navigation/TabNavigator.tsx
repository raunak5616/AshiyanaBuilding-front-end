import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { ROUTES } from '../constants/routes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import CartScreen from '../screens/main/CartScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import OrderDetailScreen from '../screens/main/OrderDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Search" component={SearchScreen} />
    <HomeStack.Screen name="ProductDetails" component={ProductDetailScreen} />
  </HomeStack.Navigator>
);

const CartNavigator = () => (
  <CartStack.Navigator screenOptions={{ headerShown: false }}>
    <CartStack.Screen name="CartMain" component={CartScreen} />
    <CartStack.Screen name="Checkout" component={CheckoutScreen} />
  </CartStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="OrdersList" component={OrdersScreen} />
    <ProfileStack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </ProfileStack.Navigator>
);

const OrdersNavigator = () => (
  <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
    <OrdersStack.Screen name="OrdersMain" component={OrdersScreen} />
    <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </OrdersStack.Navigator>
);

// Custom Premium Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {state.routes
          .filter((route: any) => route.name !== ROUTES.MAIN.CART)
          .map((route: any) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.routes[state.index].name === route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle';
            if (route.name === ROUTES.MAIN.HOME) iconName = 'home';
            else if (route.name === ROUTES.MAIN.CATEGORIES) iconName = 'view-grid';
            else if (route.name === ROUTES.MAIN.ORDERS) iconName = 'clipboard-text-outline';
            else if (route.name === ROUTES.MAIN.PROFILE) iconName = 'account';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={22}
                  color={isFocused ? COLORS.primary : COLORS.textSecondary}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Separate Aashiyana Logo Island on the Far Right */}
      <View style={styles.logoIsland}>
        <Image
          source={require('../../assets/Aashiyana.jpg')}
          style={styles.tabLogo}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name={ROUTES.MAIN.HOME}
        component={HomeNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name={ROUTES.MAIN.CATEGORIES}
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Tab.Screen
        name={ROUTES.MAIN.ORDERS}
        component={OrdersNavigator}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name={ROUTES.MAIN.PROFILE}
        component={ProfileNavigator}
        options={{ title: 'Profile' }}
      />
      <Tab.Screen
        name={ROUTES.MAIN.CART}
        component={CartNavigator}
        options={{ title: 'Cart' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 30, // Rounded right end
    borderBottomRightRadius: 30, // Rounded right end
    borderWidth: 1.2,
    borderColor: COLORS.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(244, 196, 48, 0.12)', // Premium warm brand-colored glow highlight
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  logoIsland: {
    backgroundColor: COLORS.background,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 6, // Premium asymmetrical leaf island
    borderWidth: 1.2,
    borderColor: COLORS.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabLogo: {
    width: 52,
    height: 52,
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
    borderBottomLeftRadius: 21,
    borderBottomRightRadius: 5,
  },
});

export default TabNavigator;
