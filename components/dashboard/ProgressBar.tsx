import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/utils/formatters";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <Card className="mt-3">
      <View className="flex-row justify-between mb-2">
        <Text className="text-ink font-medium">Seu progresso</Text>
        <Text className="text-primary font-bold">{formatPercent(percent)}</Text>
      </View>
      <View className="h-3 bg-background rounded-full overflow-hidden">
        <View className="h-3 bg-primary rounded-full" style={{ width: `${percent}%` }} />
      </View>
      <Text className="text-muted text-xs mt-2">
        {percent >= 100 ? "Parabéns, você quitou tudo! 🎉" : "Continue firme, cada real pago te aproxima da liberdade."}
      </Text>
    </Card>
  );
}
