import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  SectionList,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuItem } from "../types";
import { fetchMenu } from "../services/api";
import MenuCard from "../components/MenuCard";
import {
  COLORS,
  SPACING,
  CATEGORY_META,
  FONT_FAMILY,
} from "../constants/theme";

type CategoryKey = "all" | "starters" | "mains" | "desserts" | "beverages";
const CATEGORIES: CategoryKey[] = ["all", "starters", "mains", "desserts", "beverages"];
const SECTION_ORDER: Exclude<CategoryKey, "all">[] = ["starters", "mains", "desserts", "beverages"];

interface Section {
  key: string;
  title: string;
  tagline: string;
  data: MenuItem[];
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<SectionList<MenuItem, Section>>(null);

  const loadMenu = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMenu();
      setMenu(data);
    } catch (e) {
      setError("Couldn't load the menu. Is the server running?");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenu();
  }, [loadMenu]);

  const sections = useMemo<Section[]>(() => {
    const cats = selectedCategory === "all" ? SECTION_ORDER : [selectedCategory];
    return cats
      .map((cat) => {
        const meta = CATEGORY_META[cat];
        return {
          key: cat,
          title: meta.label,
          tagline: meta.tagline,
          data: menu.filter((m) => m.category === cat),
        };
      })
      .filter((s) => s.data.length > 0);
  }, [menu, selectedCategory]);

  const onSelectCategory = useCallback((cat: CategoryKey) => {
    setSelectedCategory(cat);
    listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewOffset: 0 });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => <MenuCard item={item} />,
    []
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <View style={styles.ornamentRow}>
          <View style={styles.ornamentLine} />
          <Text style={styles.ornamentDiamond}>◆</Text>
          <View style={styles.ornamentLine} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionTagline}>{section.tagline}</Text>
      </View>
    ),
    []
  );

  const renderItemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Editorial header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Established · MMXXVI</Text>
        <View style={styles.titleRow}>
          <View style={styles.titleRule} />
          <Text style={styles.title}>The Intelligent Bistro</Text>
          <View style={styles.titleRule} />
        </View>
        <Text style={styles.subtitle}>Farm to table · By the bay · A short walk from somewhere</Text>
      </View>

      {/* Text-only category nav with underline-active */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navContent}
        style={styles.nav}
      >
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelectCategory(cat)}
              hitSlop={6}
              style={styles.navItem}
            >
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {meta.label}
              </Text>
              <View style={[styles.navUnderline, active && styles.navUnderlineActive]} />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.gold} size="large" />
          <Text style={styles.loadingText}>Setting the table…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>The kitchen is quiet.</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadMenu} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          ref={listRef}
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={renderItemSeparator}
          contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          ListFooterComponent={
            <View style={styles.colophon}>
              <Text style={styles.colophonDiamond}>◆</Text>
              <Text style={styles.colophonText}>
                Prices in U.S. dollars. Gratuity is included.{"\n"}Kindly inform us of any allergies.
              </Text>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    alignItems: "center",
  },
  eyebrow: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    alignSelf: "stretch",
  },
  titleRule: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.hairline,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 24,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
    fontStyle: "italic",
    letterSpacing: 0.4,
  },
  nav: {
    maxHeight: 44,
  },
  navContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 6,
  },
  navLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  navLabelActive: {
    color: COLORS.gold,
  },
  navUnderline: {
    height: 1,
    width: 14,
    backgroundColor: "transparent",
    marginTop: 5,
  },
  navUnderlineActive: {
    backgroundColor: COLORS.gold,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    alignItems: "center",
  },
  ornamentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    alignSelf: "stretch",
    marginBottom: SPACING.sm,
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
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 22,
    letterSpacing: 0.5,
  },
  sectionTagline: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    fontStyle: "italic",
    marginTop: 4,
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.hairline,
    marginHorizontal: SPACING.lg,
    opacity: 0.6,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontStyle: "italic",
    fontSize: 14,
  },
  errorTitle: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.serif,
    fontSize: 20,
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
  retryBtn: {
    borderColor: COLORS.gold,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  retryText: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  colophon: {
    alignItems: "center",
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  colophonDiamond: {
    color: COLORS.goldDark,
    fontSize: 12,
  },
  colophonText: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 16,
  },
});
