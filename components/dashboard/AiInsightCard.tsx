import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Chip, ChipTone } from "@/components/ui/Chip";
import type { AiInsight } from "@/types";

export function AiInsightCard({ insight }: { insight: AiInsight }) {
  const tone: ChipTone = insight.tagTone;

  return (
    <Card className="mb-2">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-ink font-semibold flex-1 mr-2">{insight.title}</Text>
        <Chip label={insight.tagLabel} tone={tone} />
      </View>
      <Text className="text-muted text-sm leading-5">{insight.description}</Text>
    </Card>
  );
}
