import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatters";
import type { Debt } from "@/types";

export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: debt, isLoading } = useQuery({
    queryKey: ["debt", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("debts").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Debt;
    },
    enabled: !!id,
  });

  if (isLoading || !debt) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#16A34A" />
      </View>
    );
  }

  const paidSoFar = debt.total_amount - debt.remaining_amount;
  const progress = debt.total_amount > 0 ? (paidSoFar / debt.total_amount) * 100 : 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-14 pb-10">
      <Text className="text-ink text-2xl font-bold mb-1">{debt.creditor}</Text>
      <Text className="text-muted mb-5">Vencimento todo dia {debt.due_day}</Text>

      <Card className="mb-4">
        <Text className="text-muted text-xs mb-1">Restante a pagar</Text>
        <Text className="text-ink text-2xl font-bold mb-3">{formatCurrency(debt.remaining_amount)}</Text>

        <View className="h-3 bg-background rounded-full overflow-hidden mb-2">
          <View className="h-3 bg-primary rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
        </View>
        <Text className="text-muted text-xs">
          {formatCurrency(paidSoFar)} pagos de {formatCurrency(debt.total_amount)}
        </Text>
      </Card>

      {debt.interest_rate ? (
        <Card className="mb-4">
          <Text className="text-muted text-xs mb-1">Taxa de juros</Text>
          <Text className="text-ink font-semibold">{debt.interest_rate}% ao mês</Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}
