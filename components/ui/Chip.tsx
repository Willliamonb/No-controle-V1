import React from "react";
import { Text, View } from "react-native";

export type ChipTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_STYLES: Record<ChipTone, { bg: string; text: string }> = {
  success: { bg: "bg-status-successBg", text: "text-status-success" },
  warning: { bg: "bg-status-warningBg", text: "text-status-warning" },
  danger: { bg: "bg-status-dangerBg", text: "text-status-danger" },
  info: { bg: "bg-status-infoBg", text: "text-status-info" },
  neutral: { bg: "bg-background", text: "text-muted" },
};

export function Chip({ label, tone = "neutral" }: { label: string; tone?: ChipTone }) {
  const style = TONE_STYLES[tone];
  return (
    <View className={`px-2.5 py-1 rounded-full ${style.bg} self-start`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{label}</Text>
    </View>
  );
}
