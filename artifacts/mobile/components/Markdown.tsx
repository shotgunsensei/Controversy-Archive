import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

/**
 * Lightweight markdown renderer for the AI deep-dive research content.
 * Supports headings (#, ##, ###), bullet lists (-, *), numbered lists,
 * blockquotes (>), and inline bold (**text**). Avoids a native dependency so
 * it stays Expo Go compatible.
 */
export function Markdown({ content }: { content: string }) {
  const colors = useColors();
  const blocks = parseBlocks(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === "h1" || block.type === "h2" || block.type === "h3") {
          const sizeStyle =
            block.type === "h1"
              ? styles.h1
              : block.type === "h2"
                ? styles.h2
                : styles.h3;
          return (
            <Text key={i} style={[styles.heading, sizeStyle, { color: colors.foreground }]}>
              {block.text.toUpperCase()}
            </Text>
          );
        }
        if (block.type === "bullet") {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bulletMark, { color: colors.primary }]}>▪</Text>
              <Text style={[styles.paragraph, styles.listText, { color: colors.mutedForeground }]}>
                {renderInline(block.text, colors.foreground)}
              </Text>
            </View>
          );
        }
        if (block.type === "ordered") {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bulletMark, styles.orderedMark, { color: colors.primary }]}>
                {block.marker}
              </Text>
              <Text style={[styles.paragraph, styles.listText, { color: colors.mutedForeground }]}>
                {renderInline(block.text, colors.foreground)}
              </Text>
            </View>
          );
        }
        if (block.type === "quote") {
          return (
            <View
              key={i}
              style={[
                styles.quote,
                { borderLeftColor: colors.primary, backgroundColor: colors.muted + "55" },
              ]}
            >
              <Text style={[styles.quoteText, { color: colors.mutedForeground }]}>
                {renderInline(block.text, colors.foreground)}
              </Text>
            </View>
          );
        }
        return (
          <Text key={i} style={[styles.paragraph, { color: colors.mutedForeground }]}>
            {renderInline(block.text, colors.foreground)}
          </Text>
        );
      })}
    </View>
  );
}

type Block =
  | { type: "h1" | "h2" | "h3" | "paragraph" | "quote" | "bullet"; text: string }
  | { type: "ordered"; text: string; marker: string };

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flush();
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("# ")) {
      flush();
      blocks.push({ type: "h1", text: line.slice(2) });
    } else if (line.startsWith("> ")) {
      flush();
      blocks.push({ type: "quote", text: line.slice(2) });
    } else if (/^[-*]\s+/.test(line)) {
      flush();
      blocks.push({ type: "bullet", text: line.replace(/^[-*]\s+/, "") });
    } else if (/^\d+\.\s+/.test(line)) {
      flush();
      const marker = line.match(/^(\d+)\./)?.[1] ?? "•";
      blocks.push({ type: "ordered", text: line.replace(/^\d+\.\s+/, ""), marker: `${marker}.` });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

function renderInline(text: string, boldColor: string): React.ReactNode {
  // Split on **bold** segments while keeping the delimiters' content.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={i} style={[styles.bold, { color: boldColor }]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  heading: {
    fontFamily: "SpaceMono_700Bold",
    textTransform: "uppercase",
  },
  h1: { fontSize: 20, lineHeight: 26 },
  h2: { fontSize: 17, lineHeight: 23 },
  h3: { fontSize: 15, lineHeight: 21 },
  paragraph: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  bold: {
    fontFamily: "Outfit_700Bold",
  },
  listRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 8,
  },
  bulletMark: {
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
    lineHeight: 24,
  },
  orderedMark: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 13,
  },
  listText: {
    flex: 1,
  },
  quote: {
    borderLeftWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  quoteText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 23,
    fontStyle: "italic",
  },
});
