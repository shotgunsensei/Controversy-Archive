import { Feather } from "@expo/vector-icons";
import {
  getGetTopicDeepDiveQueryKey,
  getGetTopicQueryKey,
  useGetTopic,
  useGetTopicDeepDive,
  type Theory,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Markdown } from "@/components/Markdown";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { useColors } from "@/hooks/useColors";

const MONO = "SpaceMono_400Regular";
const MONO_BOLD = "SpaceMono_700Bold";
const WEB_TOP_INSET = 67;

export default function TopicDetail() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const topInset = Platform.OS === "web" ? WEB_TOP_INSET : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [deepDiveRequested, setDeepDiveRequested] = useState(false);

  const {
    data: topic,
    isLoading: loadingTopic,
    isError: topicError,
    refetch: refetchTopic,
  } = useGetTopic(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetTopicQueryKey(slug),
    },
  });

  const {
    data: deepDive,
    isLoading: loadingDive,
    isError: diveError,
    refetch: refetchDive,
  } = useGetTopicDeepDive(slug, {
    query: {
      enabled: !!slug && deepDiveRequested,
      staleTime: 1000 * 60 * 60,
      retry: 1,
      queryKey: getGetTopicDeepDiveQueryKey(slug),
    },
  });

  const requestDeepDive = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDeepDiveRequested(true);
  };

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
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backRow}
        >
          <Feather name="arrow-left" size={18} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>ARCHIVE</Text>
        </Pressable>
        <Text style={[styles.fileTag, { color: colors.mutedForeground }]} numberOfLines={1}>
          FILE #{topic?.id ?? "—"}
        </Text>
      </View>

      {loadingTopic ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            DECRYPTING FILE...
          </Text>
        </View>
      ) : topicError || !topic ? (
        <View style={styles.centerFill}>
          <Feather name="alert-octagon" size={36} color={colors.destructive} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>
            ACCESS DENIED
          </Text>
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            This file could not be retrieved from the archive.
          </Text>
          <Pressable
            onPress={() => refetchTopic()}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Feather name="refresh-cw" size={14} color={colors.primary} />
            <Text style={[styles.retryText, { color: colors.primary }]}>RETRY</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: bottomInset + 50 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header block */}
          <View style={styles.headerBlock}>
            <View style={styles.metaRow}>
              <View style={[styles.categoryTag, { backgroundColor: colors.primary + "1A" }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {topic.category.toUpperCase()}
                </Text>
              </View>
              {topic.era && (
                <Text style={[styles.eraText, { color: colors.mutedForeground }]}>
                  {topic.era.toUpperCase()}
                </Text>
              )}
            </View>

            <Text style={[styles.title, { color: colors.foreground }]}>
              {topic.title.toUpperCase()}
            </Text>

            {topic.tags?.length > 0 && (
              <View style={styles.tagRow}>
                {topic.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tag, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                      #{tag.toLowerCase()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Summary */}
          <Section icon="file-text" title="OVERVIEW" colors={colors}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              {topic.summary}
            </Text>
          </Section>

          {/* Controversy */}
          <View style={styles.sectionWrap}>
            <View
              style={[
                styles.controversyBox,
                {
                  borderColor: colors.destructive + "44",
                  backgroundColor: colors.destructive + "12",
                },
              ]}
            >
              <View style={styles.controversyHeader}>
                <Feather name="zap" size={14} color={colors.destructive} />
                <Text style={[styles.controversyTitle, { color: colors.destructive }]}>
                  WHY IT'S DISPUTED
                </Text>
              </View>
              <Text style={[styles.bodyText, { color: colors.foreground }]}>
                {topic.controversy}
              </Text>
            </View>
          </View>

          {/* Deep dive */}
          <DeepDiveSection
            colors={colors}
            requested={deepDiveRequested}
            loading={loadingDive}
            error={diveError}
            deepDive={deepDive}
            onRequest={requestDeepDive}
            onRetry={refetchDive}
          />
        </ScrollView>
      )}
    </View>
  );
}

function DeepDiveSection({
  colors,
  requested,
  loading,
  error,
  deepDive,
  onRequest,
  onRetry,
}: {
  colors: ReturnType<typeof useColors>;
  requested: boolean;
  loading: boolean;
  error: boolean;
  deepDive: { research: string; theories: Theory[]; verdict?: string | null } | undefined;
  onRequest: () => void;
  onRetry: () => void;
}) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <Feather name="cpu" size={16} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          AI DEEP DIVE
        </Text>
      </View>

      {/* Idle — prompt to generate */}
      {!requested && (
        <Pressable
          testID="deep-dive-button"
          onPress={onRequest}
          style={[
            styles.diveCta,
            { borderColor: colors.primary, backgroundColor: colors.primary + "12" },
          ]}
        >
          <Feather name="search" size={22} color={colors.primary} />
          <Text style={[styles.diveCtaTitle, { color: colors.foreground }]}>
            COMPILE INTELLIGENCE REPORT
          </Text>
          <Text style={[styles.diveCtaSub, { color: colors.mutedForeground }]}>
            Generate an AI-researched dossier: competing theories, evidence, and a balanced verdict. Takes 10–20 seconds.
          </Text>
          <View style={[styles.diveCtaBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.diveCtaBtnText, { color: colors.primaryForeground }]}>
              INITIATE ANALYSIS →
            </Text>
          </View>
        </Pressable>
      )}

      {/* Loading — long generation */}
      {requested && loading && (
        <View
          style={[
            styles.diveLoading,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.diveLoadingTitle, { color: colors.foreground }]}>
            GENERATING DOSSIER
          </Text>
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            Cross-referencing sources and weighing theories. This usually takes 10–20 seconds — hold tight.
          </Text>
        </View>
      )}

      {/* Error + retry */}
      {requested && error && !loading && (
        <View
          style={[
            styles.diveLoading,
            { borderColor: colors.destructive + "44", backgroundColor: colors.destructive + "10" },
          ]}
        >
          <Feather name="alert-triangle" size={30} color={colors.destructive} />
          <Text style={[styles.diveLoadingTitle, { color: colors.foreground }]}>
            ANALYSIS FAILED
          </Text>
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            The intelligence engine could not complete this report.
          </Text>
          <Pressable
            onPress={onRetry}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Feather name="refresh-cw" size={14} color={colors.primary} />
            <Text style={[styles.retryText, { color: colors.primary }]}>RETRY</Text>
          </Pressable>
        </View>
      )}

      {/* Result */}
      {requested && !loading && !error && deepDive && (
        <View style={styles.diveResult}>
          {/* Research */}
          <View
            style={[
              styles.diveCard,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Markdown content={deepDive.research} />
          </View>

          {/* Theories */}
          {deepDive.theories?.length > 0 && (
            <View style={styles.theoriesBlock}>
              <Text style={[styles.subHeading, { color: colors.foreground }]}>
                COMPETING THEORIES
              </Text>
              {deepDive.theories.map((theory, i) => (
                <TheoryCard key={i} theory={theory} index={i + 1} colors={colors} />
              ))}
            </View>
          )}

          {/* Verdict */}
          {deepDive.verdict && (
            <View
              style={[
                styles.verdictBox,
                { borderColor: colors.primary, backgroundColor: colors.primary + "12" },
              ]}
            >
              <View style={styles.controversyHeader}>
                <Feather name="check-circle" size={14} color={colors.primary} />
                <Text style={[styles.verdictTitle, { color: colors.primary }]}>
                  ASSESSMENT
                </Text>
              </View>
              <Text style={[styles.bodyText, { color: colors.foreground }]}>
                {deepDive.verdict}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function TheoryCard({
  theory,
  index,
  colors,
}: {
  theory: Theory;
  index: number;
  colors: ReturnType<typeof useColors>;
}) {
  const badge = plausibilityColor(theory.plausibility, colors);
  return (
    <View
      style={[
        styles.theoryCard,
        { borderColor: colors.border, backgroundColor: colors.card },
      ]}
    >
      <View style={styles.theoryHeader}>
        <Text style={[styles.theoryNumber, { color: colors.mutedForeground }]}>
          {String(index).padStart(2, "0")}
        </Text>
        <Text style={[styles.theoryTitle, { color: colors.foreground }]}>
          {theory.title}
        </Text>
      </View>

      <View style={[styles.plausBadge, { backgroundColor: badge + "22", borderColor: badge + "55" }]}>
        <View style={[styles.dot, { backgroundColor: badge }]} />
        <Text style={[styles.plausText, { color: badge }]}>
          {theory.plausibility.toUpperCase()}
        </Text>
      </View>

      <Text style={[styles.theoryBody, { color: colors.mutedForeground }]}>
        {theory.explanation}
      </Text>

      {theory.evidence && (
        <View style={[styles.evidenceBox, { borderLeftColor: colors.border }]}>
          <Text style={[styles.evidenceLabel, { color: colors.mutedForeground }]}>
            EVIDENCE
          </Text>
          <Text style={[styles.theoryBody, { color: colors.mutedForeground }]}>
            {theory.evidence}
          </Text>
        </View>
      )}
    </View>
  );
}

function plausibilityColor(
  plausibility: string,
  colors: ReturnType<typeof useColors>,
): string {
  const p = plausibility.toLowerCase();
  if (p.includes("mainstream") || p.includes("likely") || p.includes("strong")) {
    return colors.success;
  }
  if (p.includes("fringe") || p.includes("speculat") || p.includes("unlikely")) {
    return colors.destructive;
  }
  return colors.primary;
}

function Section({
  icon,
  title,
  colors,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <Feather name={icon} size={16} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontFamily: MONO_BOLD,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  fileTag: {
    fontFamily: MONO,
    fontSize: 11,
  },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 14,
  },
  headerBlock: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1,
  },
  eraText: {
    fontFamily: MONO,
    fontSize: 11,
  },
  title: {
    fontFamily: "Outfit_900Black",
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: MONO,
    fontSize: 10,
  },
  sectionWrap: {
    paddingHorizontal: 18,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  controversyBox: {
    borderWidth: 1,
    padding: 16,
  },
  controversyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  controversyTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  diveCta: {
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  diveCtaTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  diveCtaSub: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  diveCtaBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 6,
  },
  diveCtaBtnText: {
    fontFamily: MONO_BOLD,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  diveLoading: {
    borderWidth: 1,
    padding: 30,
    alignItems: "center",
    gap: 14,
  },
  diveLoadingTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 16,
    letterSpacing: 1,
  },
  diveResult: {
    gap: 22,
  },
  diveCard: {
    borderWidth: 1,
    padding: 18,
  },
  theoriesBlock: {
    gap: 14,
  },
  subHeading: {
    fontFamily: MONO_BOLD,
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  theoryCard: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  theoryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  theoryNumber: {
    fontFamily: MONO_BOLD,
    fontSize: 16,
  },
  theoryTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    lineHeight: 21,
    flex: 1,
  },
  plausBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  plausText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  theoryBody: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  evidenceBox: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    gap: 4,
  },
  evidenceLabel: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  verdictBox: {
    borderWidth: 1,
    padding: 18,
  },
  verdictTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  stateText: {
    fontFamily: MONO,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  errorTitle: {
    fontFamily: MONO_BOLD,
    fontSize: 20,
    letterSpacing: 1,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 6,
  },
  retryText: {
    fontFamily: MONO_BOLD,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
