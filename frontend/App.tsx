import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import MenuScreen from "./src/screens/MenuScreen";
import ChatScreen from "./src/screens/ChatScreen";
import CartScreen from "./src/screens/CartScreen";
import { useCartStore } from "./src/store/cartStore";
import { COLORS, RADIUS } from "./src/constants/theme";

const Tab = createBottomTabNavigator();

function CartBadge() {
  const count = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

function AnimatedTabIcon({
  name,
  focused,
  color,
  size,
}: {
  name: any;
  focused: boolean;
  color: string;
  size: number;
}) {
  const scale = useSharedValue(focused ? 1.15 : 1);
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 12 });
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          dark: true,
          colors: {
            ...DefaultTheme.colors,
            primary: COLORS.gold,
            background: COLORS.bg,
            card: COLORS.surface,
            text: COLORS.text,
            border: COLORS.border,
            notification: COLORS.gold,
          },
        }}
      >
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarBackground: () =>
              Platform.OS === "ios" ? (
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.surface }]} />
              ),
            tabBarActiveTintColor: COLORS.gold,
            tabBarInactiveTintColor: COLORS.textDim,
            tabBarLabelStyle: styles.tabLabel,
            tabBarItemStyle: styles.tabItem,
          }}
        >
          <Tab.Screen
            name="Menu"
            component={MenuScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <AnimatedTabIcon
                  name={focused ? "restaurant" : "restaurant-outline"}
                  focused={focused}
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <AnimatedTabIcon
                  name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                  focused={focused}
                  color={color}
                  size={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <View>
                  <AnimatedTabIcon
                    name={focused ? "bag" : "bag-outline"}
                    focused={focused}
                    color={color}
                    size={size}
                  />
                  <CartBadge />
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === "ios" ? 88 : 64,
    elevation: 0,
    backgroundColor: "transparent",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: Platform.OS === "ios" ? 0 : 4,
  },
  tabItem: {
    paddingTop: 8,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },
  badgeText: {
    color: COLORS.bg,
    fontSize: 9,
    fontWeight: "800",
  },
});
