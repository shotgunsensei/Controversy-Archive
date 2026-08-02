import { Feather } from "@expo/vector-icons";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const MONO = "SpaceMono_400Regular";
const HEADER = "Orbitron_700Bold";
const DISPLAY_BOLD = "SpaceGrotesk_700Bold";
const BODY = "SpaceGrotesk_400Regular";

const OPERATOR_OS_URL = "https://operatoros.net";
const STUDIO_URL = "https://shotgunninjas.com";

/**
 * Studio cross-promotion footer mirroring the web archive's SiteFooter:
 * OperatorOS (infrastructure, cyan) and Shotgun Ninjas (studio, signal red).
 */
export function StudioFooter() {
  const colors = useColors();

  return (
    <View style={styles.wrap}>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* OperatorOS */}
      <Pressable
        testID="link-operatoros"
        onPress={() => Linking.openURL(OPERATOR_OS_URL)}
        style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <View style={styles.labelRow}>
          <Feather name="command" size={11} color={colors.secondary} />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            INFRASTRUCTURE BY
          </Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.primary }]}>OPERATOROS</Text>
          <Feather name="external-link" size={13} color={colors.primary + "88"} />
        </View>
        <Text style={[styles.blurb, { color: colors.mutedForeground }]}>
          One command core. Every module in formation. The operations platform
          powering this archive's database.
        </Text>
      </Pressable>

      {/* Shotgun Ninjas */}
      <Pressable
        testID="link-shotgunninjas"
        onPress={() => Linking.openURL(STUDIO_URL)}
        style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <View style={styles.labelRow}>
          <Feather name="target" size={11} color={colors.destructive} />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            DECLASSIFIED BY
          </Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.destructive }]}>SHOTGUN NINJAS</Text>
          <Feather name="external-link" size={13} color={colors.destructive + "88"} />
        </View>
        <Text style={[styles.blurb, { color: colors.mutedForeground }]}>
          Own the Proof. Own the Automation. Own the Machine. The production
          studio behind the curtain.
        </Text>
      </Pressable>

      <Text style={[styles.copyright, { color: colors.mutedForeground + "AA" }]}>
        © {new Date().getFullYear()} SHOTGUN NINJAS PRODUCTIONS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    marginTop: 36,
    gap: 14,
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    padding: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  label: {
    fontFamily: HEADER,
    fontSize: 9,
    letterSpacing: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  name: {
    fontFamily: DISPLAY_BOLD,
    fontSize: 17,
    letterSpacing: -0.5,
  },
  blurb: {
    fontFamily: BODY,
    fontSize: 13,
    lineHeight: 19,
  },
  copyright: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 6,
  },
});
