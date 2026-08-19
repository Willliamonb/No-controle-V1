import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AiPlanCard({ recommendation }: { recommendation: string }) {
  const router = useRouter();

  return (
    <Card className="mt-3 border border-primary/20">
      <View className="flex-row items-center mb-2">
        <Text className="text-primary font-bold text-sm">✨ PLANO INTELIGENTE DA IA</Text>
      </View>
      <Text className="text-ink leading-5 mb-3">{recommendation}</Text>
      <Button label="Ver Plano de Quitação" onPress={() => router.push("/plan")} />
    </Card>
  );
}
