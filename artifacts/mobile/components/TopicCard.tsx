import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Topic } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

const MONO = "SpaceMono_400Regular";
const MONO_BOLD = "SpaceMono_700Bold";

export function TopicCard({ topic }: { topic: Topic }) {
  const colors = useColors();
  const router = useRouter();

  const onPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/topic/${topic.slug}`);
  };

  return (
    <Pressable
      testID={`topic-card-${topic.slug}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: pressed ? colors.primary : colors.border,
        },
      ]}
    >
      {/* Corner accents */}
      <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
      <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
      <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
      <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />

      <View style={styles.headerRow}>
        <View style={[styles.categoryTag, { backgroundColor: colors.primary + "1A" }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]} numberOfLines={1}>
            {topic.category.toUpperCase()}
          </Text>
        </View>
        {topic.featured && (
          <View style={styles.classifiedRow}>
            <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
            <Text style={[styles.classifiedText, { color: colors.destructive }]}>
              CLASSIFIED
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {topic.title}
      </Text>

      <Text style={[styles.summary, { color: colors.mutedForeground }]} numberOfLines={3}>
        {topic.summary}
      </Text>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.era, { color: colors.mutedForeground }]} numberOfLines={1}>
          {topic.era ? topic.era.toUpperCase() : "UNKNOWN ERA"}
        </Text>
        <View style={styles.accessRow}>
          <Text style={[styles.access, { color: colors.primary }]}>ACCESS FILE</Text>
          <Feather name="arrow-right" size={12} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 18,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 8,
    height: 8,
  },
  tl: { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 },
  tr: { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 },
  br: { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: "70%",
  },
  categoryText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1,
  },
  classifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  classifiedText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: MONO_BOLD,
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  summary: {
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  era: {
    fontFamily: MONO,
    fontSize: 11,
    flexShrink: 1,
  },
  accessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  access: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
