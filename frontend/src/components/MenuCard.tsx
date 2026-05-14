import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { MenuItem } from "../types";
import { COLORS, RADIUS, SPACING, CATEGORY_META } from "../constants/theme";
import { useCartStore } from "../store/cartStore";

interface MenuCardProps {
  item: MenuItem;
}

const SPICY_ICONS = ["", "🌶", "🌶🌶", "🌶🌶🌶"];

export default function MenuCard({ item }: MenuCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartItem = cartItems.find((c) => c.id === item.id);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleAdd = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withSpring(0.94), withSpring(1));
    addItem(item);
  }, [item, addItem, scale]);

  const categoryColor = CATEGORY_META[item.category]?.color ?? COLORS.gold;

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {/* Emoji hero */}
      <View style={[styles.emojiContainer, { backgroundColor: categoryColor + "22" }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        {item.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.spicyLevel > 0 && (
            <Text style={styles.spicy}>{SPICY_ICONS[item.spicyLevel]}</Text>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Dietary tags */}
        {item.dietary.length > 0 && (
          <View style={styles.tagsRow}>
            {item.dietary.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>

          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          >
            {cartItem ? (
              <View style={styles.addBtnInner}>
                <Ionicons name="checkmark" size={14} color={COLORS.bg} />
                <Text style={styles.addBtnText}>{cartItem.quantity}</Text>
              </View>
            ) : (
              <Ionicons name="add" size={20} color={COLORS.bg} />
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiContainer: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emoji: {
    fontSize: 52,
  },
  popularBadge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  popularText: {
    color: COLORS.bg,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  spicy: {
    fontSize: 12,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: SPACING.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: SPACING.sm,
  },
  tag: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "700",
  },
  addBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnPressed: {
    opacity: 0.8,
  },
  addBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  addBtnText: {
    color: COLORS.bg,
    fontSize: 13,
    fontWeight: "700",
  },
});
