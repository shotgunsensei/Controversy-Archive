import { Feather } from "@expo/vector-icons";
import {
  getListFeaturedTopicsQueryKey,
  getListTopicsQueryKey,
  useGetArchiveStats,
  useListCategories,
  useListFeaturedTopics,
  useListTopics,
} from "@workspace/api-client-react";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { TopicCard } from "@/components/TopicCard";
import { useColors } from "@/hooks/useColors";
import { useDebounce } from "@/hooks/use-debounce";

const MONO = "SpaceMono_400Regular";
const MONO_BOLD = "SpaceMono_700Bold";

const WEB_TOP_INSET = 67;

export default function Home() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? WEB_TOP_INSET : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState<string | undefined>(undefined);

  const isFiltering = !!debouncedSearch || !!category;

  const { data: stats } = useGetArchiveStats();
  const { data: categories } = useListCategories();

  const {
    data: featuredTopics,
    isLoading: loadingFeatured,
    refetch: refetchFeatured,
  } = useListFeaturedTopics({
    query: {
      enabled: !isFiltering,
      queryKey: getListFeaturedTopicsQueryKey(),
    },
  });

  const {
    data: allTopics,
    isLoading: loadingAll,
    isFetching: fetchingAll,
    refetch: refetchAll,
  } = useListTopics(
    { search: debouncedSearch, category, sort: "title" },
    {
      query: {
        queryKey: getListTopicsQueryKey({
          search: debouncedSearch,
          category,
          sort: "title",
        }),
      },
    },
  );

  const recentTopics = useMemo(() => allTopics?.slice(0, 9) ?? [], [allTopics]);

  const onRefresh = () => {
    refetchAll();
    if (!isFiltering) refetchFeatured();
  };

  const ListHeader = (
    <View>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.classifiedBadge, { borderColor: colors.destructive + "33", backgroundColor: colors.destructive + "1A" }]}>
          <Feather name="alert-triangle" size={11} color={colors.destructive} />
          <Text style={[styles.classifiedBadgeText, { color: colors.destructive }]}>
            DECLASSIFIED ARCHIVE — LEVEL 4
          </Text>
        </View>

        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          DESTINATION{" "}
          <Text style={{ color: colors.primary }}>MYSTERY</Text>
        </Text>

        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          A searchable dossier of the internet's most hotly-debated anomalies, lost histories, and enduring conspiracies. Step carefully.
        </Text>

        {stats && (
          <View style={[styles.statsBar, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Stat label="ENTRIES" value={stats.totalTopics} color={colors.foreground} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <Stat label="CATEGORIES" value={stats.totalCategories} color={colors.foreground} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <Stat label="DEEP DIVES" value={stats.deepDivesGenerated} color={colors.primary} />
          </View>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          testID="search-input"
          value={search}
          onChangeText={setSearch}
          placeholder="SEARCH THE ARCHIVE..."
          placeholderTextColor={colors.mutedForeground + "99"}
          style={[styles.searchInput, { color: colors.foreground }]}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable testID="clear-search" onPress={() => setSearch("")} hitSlop={10}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        style={styles.categoryScroll}
      >
        <CategoryChip
          label="ALL FILES"
          active={!category}
          onPress={() => setCategory(undefined)}
          colors={colors}
        />
        {categories?.map((c) => (
          <CategoryChip
            key={c.category}
            label={`${c.category.toUpperCase()}  [${c.count}]`}
            active={category === c.category}
            onPress={() => setCategory(c.category)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* Section heading */}
      <View style={styles.sectionHeader}>
        <Feather
          name={isFiltering ? "filter" : "database"}
          size={16}
          color={colors.primary}
        />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {isFiltering ? "SEARCH RESULTS" : "PRIORITY DOSSIERS"}
        </Text>
        {isFiltering && (
          <Text style={[styles.matchCount, { color: colors.mutedForeground }]}>
            {allTopics?.length ?? 0} MATCHES
          </Text>
        )}
      </View>
    </View>
  );

  // Decide which dataset drives the list.
  const listData = isFiltering ? allTopics ?? [] : featuredTopics ?? [];
  const isLoading = isFiltering ? loadingAll : loadingFeatured;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScanlineOverlay />

      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topInset + 10,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        <View style={styles.brandRow}>
          <Feather name="shield" size={18} color={colors.primary} />
          <Text style={[styles.brand, { color: colors.foreground }]}>
            <Text style={{ color: colors.primary }}>SOURCE</Text>_TRUTH
          </Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            STATUS: SECURE
          </Text>
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <TopicCard topic={item} />
          </View>
        )}
        contentContainerStyle={{
          paddingBottom: bottomInset + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={fetchingAll && !isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
                ACCESSING ARCHIVE...
              </Text>
            </View>
          ) : (
            <View style={[styles.centerState, styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Feather name="alert-triangle" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                NO RECORDS FOUND
              </Text>
              <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
                The archive contains no matches for your query. The truth may lie elsewhere.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function CategoryChip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primary : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    fontFamily: MONO_BOLD,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 12,
  },
  classifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 18,
  },
  classifiedBadgeText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: "Outfit_900Black",
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  heroSubtitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 23,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 16,
    marginTop: 22,
    gap: 14,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: MONO_BOLD,
    fontSize: 24,
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 18,
    marginTop: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: MONO,
    fontSize: 13,
    paddingVertical: 14,
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginTop: 14,
  },
  categoryRow: {
    paddingHorizontal: 18,
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    marginTop: 30,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  matchCount: {
    fontFamily: MONO,
    fontSize: 11,
    marginLeft: "auto",
  },
  cardWrap: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 14,
  },
  emptyBox: {
    marginHorizontal: 18,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  stateText: {
    fontFamily: MONO,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
