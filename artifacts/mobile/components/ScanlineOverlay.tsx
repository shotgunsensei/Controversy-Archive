import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * CRT scanline overlay that mirrors the web archive's decorative scanline /
 * grain effect. Purely decorative and non-interactive — rendered above content
 * with pointerEvents="none" so it never intercepts touches.
 */
export function ScanlineOverlay() {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      {SCANLINES.map((top) => (
        <View key={top} style={[styles.line, { top }]} />
      ))}
    </View>
  );
}

// Pre-computed horizontal scanline positions (every 4px up to ~1000px).
const SCANLINES = Array.from({ length: 250 }, (_, i) => i * 4);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    opacity: 0.06,
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#000000",
  },
});
