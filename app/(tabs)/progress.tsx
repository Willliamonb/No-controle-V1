import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardSummary } from "@/services/dashboardService";
import { Card } from "@/components/ui/Card";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { ProgressChecklist } from "@/components/dashboard/ProgressChecklist";
import { formatCurrency } from "@/utils/formatters";

export default function ProgressScreen() {
  const { user } = useAuth();
  const fullName = (user?.user_metadata?.full_name as string) ?? "";

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary", user?.id],
    queryFn: () => fetchDashboardSummary(user!.id, fullName),
    enabled: !!user?.id,
  });

  if (isLoading || !summary) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#16A34A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-14 pb-10">
      <Text className="text-ink text-2xl font-bold mb-1">Seu progresso</Text>
      <Text className="text-muted mb-6">Acompanhe sua evolução rumo a ficar #NoControle.</Text>

      <Card className="items-center py-6 mb-4">
        <CircularProgress percent={summary.progressPercent} label="quitado" />
        <Text className="text-muted text-sm mt-4 text-center leading-5">
          Você já pagou {formatCurrency(summary.totalDebtOriginal - summary.remainingAmount)} de{" "}
          {formatCurrency(summary.totalDebtOriginal)} em dívidas.
        </Text>
      </Card>

      <ProgressBar percent={summary.progressPercent} />

      <Text className="text-ink font-bold text-base mt-5 mb-2">Suas metas</Text>
      <ProgressChecklist items={summary.progressChecklist} />
    </ScrollView>
  );
}
