import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardSummary } from "@/services/dashboardService";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { AiPlanCard } from "@/components/dashboard/AiPlanCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ProgressChecklist } from "@/components/dashboard/ProgressChecklist";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatters";

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const fullName = (user?.user_metadata?.full_name as string) ?? "";

  const {
    data: summary,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-summary", user?.id],
    queryFn: () => fetchDashboardSummary(user!.id, fullName),
    enabled: !!user?.id,
  });

  if (isLoading || !summary) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#16A34A" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pt-14 pb-32"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16A34A" />}
      >
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-ink text-xl font-bold">{summary.greetingName} 👋</Text>
          <Text className="text-xl">🔔</Text>
        </View>

        <BalanceCard
          totalDebtOriginal={summary.totalDebtOriginal}
          remainingAmount={summary.remainingAmount}
          reductionPercent={summary.reductionPercent}
        />

        <AiPlanCard recommendation={summary.aiPlanRecommendation} />

        <StatsGrid
          activeDebtsCount={summary.activeDebtsCount}
          installmentsPaid={summary.installmentsPaid}
          installmentsTotal={summary.installmentsTotal}
          savingsObtained={summary.savingsObtained}
          nextDueDay={summary.nextDueDate?.day ?? null}
        />

        <Text className="text-ink font-bold text-base mt-2 mb-2">Seu Progresso</Text>
        <ProgressChecklist items={summary.progressChecklist} />

        <Text className="text-ink font-bold text-base mt-5 mb-2">Insights da IA</Text>
        {summary.aiInsights.map((insight) => (
          <AiInsightCard key={insight.title} insight={insight} />
        ))}

        {summary.recentMovements.length > 0 && (
          <>
            <Text className="text-ink font-bold text-base mt-3 mb-2">Últimas movimentações</Text>
            {summary.recentMovements.map((movement) => (
              <Card key={movement.id} className="mb-2 flex-row justify-between items-center">
                <Text className="text-ink">{new Date(movement.paid_at).toLocaleDateString("pt-BR")}</Text>
                <Text className="text-primary font-semibold">{formatCurrency(movement.amount)}</Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <View className="absolute bottom-6 left-5 right-5">
        <Button label="+ Adicionar Dívida" variant="secondary" onPress={() => router.push("/debts/new")} />
      </View>
    </View>
  );
}
