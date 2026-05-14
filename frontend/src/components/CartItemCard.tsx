import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInRight, FadeOutLeft, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CartItem } from "../types";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { useCartStore } from "../store/cartStore";

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleDecrease = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.quantity === 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(item.id, item.quantity + 1);
  };

  return (
    <Animated.View
      entering={FadeInRight.springify()}
      exiting={FadeOutLeft.springify()}
      layout={Layout.springify()}
      style={styles.card}
    >
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.unitPrice}>${item.price.toFixed(2)} each</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={handleDecrease}
          style={({ pressed }) => [styles.qtyBtn, pressed && styles.qtyBtnPressed]}
        >
          <Ionicons
            name={item.quantity === 1 ? "trash-outline" : "remove"}
            size={16}
            color={item.quantity === 1 ? COLORS.error : COLORS.textMuted}
          />
        </Pressable>

        <Text style={styles.qty}>{item.quantity}</Text>

        <Pressable
          onPress={handleIncrease}
          style={({ pressed }) => [styles.qtyBtn, pressed && styles.qtyBtnPressed]}
        >
          <Ionicons name="add" size={16} color={COLORS.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.subtotal}>${(item.price * item.quantity).toFixed(2)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  emojiBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  unitPrice: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtnPressed: {
    opacity: 0.7,
  },
  qty: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  subtotal: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 48,
    textAlign: "right",
  },
});
