import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { MenuItem } from "../types";
import { COLORS, SPACING, FONT_FAMILY } from "../constants/theme";
import { useCartStore } from "../store/cartStore";

interface MenuCardProps {
  item: MenuItem;
}

const SPICY = ["", "·  spicy", "·  hot", "·  fiery"];

export default function MenuCard({ item }: MenuCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItem = useCartStore((s) => s.items.find((c) => c.id === item.id));
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleAdd = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withSpring(0.97, { damping: 14 }), withSpring(1, { damping: 14 }));
    addItem(item);
  }, [item, addItem, scale]);

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <View style={styles.body}>
        <View style={styles.titleLine}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.leader} />
          <Text style={styles.price}>${item.price}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        {(item.dietary.length > 0 || item.spicyLevel > 0 || item.popular) && (
          <View style={styles.meta}>
            {item.popular && <Text style={styles.metaTag}>· House Favorite</Text>}
            {item.dietary.map((d) => (
              <Text key={d} style={styles.metaTag}>
                · {d}
              </Text>
            ))}
            {item.spicyLevel > 0 && <Text style={styles.metaTag}>{SPICY[item.spicyLevel]}</Text>}
          </View>
        )}
      </View>

      <Pressable
        onPress={handleAdd}
        hitSlop={8}
        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
      >
        {cartItem ? (
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>{cartItem.quantity}</Text>
          </View>
        ) : (
          <Ionicons name="add" size={16} color={COLORS.gold} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  leader: {
    flex: 1,
    height: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.hairline,
    marginBottom: 4,
  },
  price: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
    paddingRight: SPACING.md,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginTop: 4,
  },
  metaTag: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  addBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  qtyBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: FONT_FAMILY.serif,
  },
});
