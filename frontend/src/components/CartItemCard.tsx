import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInRight, FadeOutLeft, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CartItem } from "../types";
import { COLORS, SPACING, FONT_FAMILY } from "../constants/theme";
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
      entering={FadeInRight.springify().damping(16)}
      exiting={FadeOutLeft.springify().damping(16)}
      layout={Layout.springify().damping(16)}
      style={styles.row}
    >
      <Text style={styles.qtyMark}>×{item.quantity}</Text>

      <View style={styles.body}>
        <View style={styles.titleLine}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.leader} />
          <Text style={styles.lineTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
        <Text style={styles.unit}>${item.price.toFixed(2)} each</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={handleDecrease} hitSlop={8} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <Ionicons
            name={item.quantity === 1 ? "trash-outline" : "remove"}
            size={14}
            color={item.quantity === 1 ? COLORS.error : COLORS.textMuted}
          />
        </Pressable>
        <Pressable onPress={handleIncrease} hitSlop={8} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <Ionicons name="add" size={14} color={COLORS.textMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  qtyMark: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 14,
    marginTop: 1,
    minWidth: 28,
  },
  body: {
    flex: 1,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  leader: {
    flex: 1,
    height: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
    marginBottom: 3,
  },
  lineTotal: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  unit: {
    color: COLORS.textDim,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    gap: 4,
    marginTop: 1,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
