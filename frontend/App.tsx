import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Platform } from "react-native";

import MenuScreen from "./src/screens/MenuScreen";
import ChatScreen from "./src/screens/ChatScreen";
import CartScreen from "./src/screens/CartScreen";
import { useCartStore } from "./src/store/cartStore";
import { COLORS } from "./src/constants/theme";

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

interface TabLabelProps {
  label: string;
  focused: boolean;
}

function TabLabel({ label, focused }: TabLabelProps) {
  return (
    <View style={styles.tabLabelWrap}>
      <Text
        style={[styles.tabLabelText, focused && styles.tabLabelTextActive]}
        numberOfLines={1}
        allowFontScaling={false}
      >
        {label}
      </Text>
      <View style={[styles.tabDot, focused && styles.tabDotActive]} />
    </View>
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
            tabBarShowLabel: false,
            tabBarItemStyle: styles.tabItem,
          }}
        >
          <Tab.Screen
            name="Menu"
            component={MenuScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabLabel label="Menu" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Concierge"
            component={ChatScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabLabel label="Concierge" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Check"
            component={CartScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <View>
                  <TabLabel label="Check" focused={focused} />
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.hairline,
    height: Platform.OS === "ios" ? 84 : 64,
    backgroundColor: COLORS.bg,
    elevation: 0,
  },
  tabItem: {
    paddingTop: Platform.OS === "ios" ? 10 : 8,
  },
  tabLabelWrap: {
    alignItems: "center",
    gap: 5,
    minWidth: 90,
  },
  tabLabelText: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  tabLabelTextActive: {
    color: COLORS.gold,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  tabDotActive: {
    backgroundColor: COLORS.gold,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -14,
    backgroundColor: COLORS.gold,
    borderRadius: 9,
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
