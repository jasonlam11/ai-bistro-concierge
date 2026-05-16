import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import CartItemCard from "../components/CartItemCard";
import { useCartStore } from "../store/cartStore";
import { COLORS, SPACING, FONT_FAMILY } from "../constants/theme";

const TAX_RATE = 0.0875;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const totalPrice = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = totalPrice;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleClear = () => {
    Alert.alert("Clear the check?", "This will remove every item.", [
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
      "Sent to the Kitchen",
      `Your party of ${totalItems} ${totalItems === 1 ? "course" : "courses"} is on its way. The wait is ours — roughly 20 to 25 minutes.`,
      [{ text: "Wonderful", onPress: clearCart }]
    );
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.checkHeader}>
          <Text style={styles.eyebrow}>The Check</Text>
          <Text style={styles.headerTitle}>Your table awaits</Text>
        </View>
        <Animated.View entering={FadeIn.delay(150)} style={styles.emptyState}>
          <Text style={styles.emptyDiamond}>◆</Text>
          <Text style={styles.emptyTitle}>Nothing on the table yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse the menu — or simply tell Jules what you'd like.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.checkHeader}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>The Check</Text>
            <Text style={styles.headerTitle}>Your table</Text>
          </View>
          <Pressable onPress={handleClear} hitSlop={6} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        </View>
        <Text style={styles.headerDate}>{today}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 280 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt sheet */}
        <View style={styles.receipt}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentDiamond}>◆</Text>
            <View style={styles.ornamentLine} />
          </View>

          {items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <View style={styles.totalLeader} />
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax · 8.75%</Text>
            <View style={styles.totalLeader} />
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.divider, { marginTop: SPACING.sm }]} />

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandLabel}>Total Due</Text>
            <View style={styles.totalLeader} />
            <Text style={styles.grandValue}>${total.toFixed(2)}</Text>
          </View>

          <Text style={styles.footnote}>
            Gratuity is included. Tax is approximate.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed checkout */}
      <View style={[styles.checkoutWrap, { paddingBottom: insets.bottom + 100 }]}>
        <Pressable
          onPress={handleCheckout}
          style={({ pressed }) => [styles.checkoutBtn, pressed && styles.checkoutBtnPressed]}
        >
          <Ionicons name="restaurant-outline" size={16} color={COLORS.bg} />
          <Text style={styles.checkoutText}>Send to the Kitchen</Text>
          <Text style={styles.checkoutAmount}>${total.toFixed(2)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  checkHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 2,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 26,
    letterSpacing: 0.3,
  },
  headerDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  clearBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  clearBtnText: {
    color: COLORS.error,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  receipt: {
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  ornamentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  ornamentLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.hairline,
  },
  ornamentDiamond: {
    color: COLORS.gold,
    fontSize: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.hairline,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
    marginBottom: SPACING.xs + 2,
  },
  totalLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontStyle: "italic",
  },
  totalLeader: {
    flex: 1,
    height: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
    marginBottom: 3,
  },
  totalValue: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 14,
  },
  grandTotalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
    marginTop: 4,
  },
  grandLabel: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  grandValue: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footnote: {
    color: COLORS.textDim,
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: SPACING.lg,
    letterSpacing: 0.4,
  },
  checkoutWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.bg,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 4,
  },
  checkoutBtnPressed: {
    opacity: 0.88,
  },
  checkoutText: {
    flex: 1,
    color: COLORS.bg,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  checkoutAmount: {
    color: COLORS.bg,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  emptyDiamond: {
    color: COLORS.gold,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 20,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 19,
    marginTop: 4,
  },
});
