import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import CartItemCard from "../components/CartItemCard";
import { useCartStore } from "../store/cartStore";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { CartItem } from "../types";

const TAX_RATE = 0.0875;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, clearCart, totalItems, totalPrice } = useCartStore();

  const subtotal = totalPrice();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleClear = () => {
    Alert.alert("Clear Cart", "Remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          clearCart();
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Order Placed! 🎉",
      `Your order of ${totalItems()} item${totalItems() !== 1 ? "s" : ""} has been sent to the kitchen. Estimated wait: 20–25 minutes.`,
      [{ text: "Wonderful!", onPress: clearCart }]
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => <CartItemCard item={item} />;

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-outline" size={48} color={COLORS.textDim} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse the menu or ask Jules to add items for you
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSub}>
            {totalItems()} {totalItems() === 1 ? "item" : "items"}
          </Text>
        </View>
        <Pressable onPress={handleClear} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </Pressable>
      </View>

      {/* Items */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 240 },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Order summary + checkout */}
      <LinearGradient
        colors={[COLORS.bg + "00", COLORS.bg, COLORS.bg]}
        style={[styles.summaryContainer, { paddingBottom: insets.bottom + 90 }]}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8.75%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          <Pressable
            onPress={handleCheckout}
            style={({ pressed }) => [styles.checkoutBtn, pressed && styles.checkoutBtnPressed]}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.bg} />
            <Text style={styles.checkoutText}>Place Order</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  clearBtn: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.error + "22",
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.error + "44",
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
  totalRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 4,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: "700",
  },
  checkoutBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  checkoutBtnPressed: {
    opacity: 0.85,
  },
  checkoutText: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
});
