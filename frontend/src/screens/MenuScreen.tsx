import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MenuItem, Category } from "../types";
import { fetchMenu } from "../services/api";
import MenuCard from "../components/MenuCard";
import { COLORS, RADIUS, SPACING, CATEGORY_META } from "../constants/theme";

const CATEGORIES = ["all", "starters", "mains", "desserts", "beverages"] as const;

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [filtered, setFiltered] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMenu = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMenu();
      setMenu(data);
      setFiltered(data);
    } catch (e) {
      setError("Couldn't load the menu. Is the server running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFiltered(menu);
    } else {
      setFiltered(menu.filter((item) => item.category === selectedCategory));
    }
  }, [selectedCategory, menu]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenu();
  }, [loadMenu]);

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => <MenuCard item={item} />,
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Welcome to</Text>
          <Text style={styles.headerTitle}>The Intelligent Bistro</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="restaurant" size={20} color={COLORS.gold} />
        </View>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterContainer}
      >
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.filterPill,
                active && { backgroundColor: meta.color, borderColor: meta.color },
              ]}
            >
              <View style={styles.filterIcon}>
                <Ionicons
                  name={meta.icon as any}
                  size={14}
                  color={active ? COLORS.bg : COLORS.textMuted}
                />
              </View>
              <Text style={[styles.filterText, active && { color: COLORS.bg }]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.gold} size="large" />
          <Text style={styles.loadingText}>Loading menu…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadMenu} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No items in this category</Text>
            </View>
          }
        />
      )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    height: 56,
    marginBottom: SPACING.sm,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterIcon: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  columnWrapper: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  listContent: {
    paddingTop: SPACING.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
  retryBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  retryText: {
    color: COLORS.bg,
    fontWeight: "600",
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
