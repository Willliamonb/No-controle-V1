import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { generateFinancialPlan } from "@/services/aiService";
import { formatCurrency } from "@/utils/formatters";
import type { Debt, Expense, Income } from "@/types";

export default function PlanScreen() {
  const { user } = useAuth();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["financial-plan", user?.id],
    queryFn: async () => {
      const [{ data: incomes }, { data: expenses }, { data: debts }] = await Promise.all([
        supabase.from("incomes").select("*").eq("user_id", user!.id),
        supabase.from("expenses").select("*").eq("user_id", user!.id),
        supabase.from("debts").select("*").eq("user_id", user!.id),
      ]);

      const generated = await generateFinancialPlan({
        incomes: (incomes ?? []) as Income[],
        expenses: (expenses ?? []) as Expense[],
        debts: (debts ?? []) as Debt[],
      });

      const debtMap = new Map(((debts ?? []) as Debt[]).map((d) => [d.id, d]));
      return { ...generated, debtMap };
    },
    enabled: !!user?.id,
  });

  if (isLoading || !plan) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#16A34A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-14 pb-10">
      <Text className="text-ink text-2xl font-bold mb-1">Seu plano</Text>
      <Text className="text-muted mb-5">Gerado com base na sua renda, despesas e dívidas.</Text>

      <Card className="mb-4">
        <Text className="text-muted text-xs mb-1">Resumo</Text>
        <Text className="text-ink leading-5">{plan.raw_summary}</Text>
      </Card>

      <View className="flex-row mb-4">
        <Card className="flex-1 mr-2">
          <Text className="text-muted text-xs mb-1">Disponível/mês</Text>
          <Text className="text-primary font-bold text-lg">{formatCurrency(plan.monthly_available)}</Text>
        </Card>
        <Card className="flex-1 ml-2">
          <Text className="text-muted text-xs mb-1">Prazo estimado</Text>
          <Text className="text-ink font-bold text-lg">{plan.estimated_payoff_months} meses</Text>
        </Card>
      </View>

      <Text className="text-ink font-semibold mb-2">Ordem de prioridade</Text>
      {plan.priority_order.length === 0 ? (
        <Card className="mb-4">
          <Text className="text-muted">Cadastre suas dívidas para ver a ordem sugerida aqui.</Text>
        </Card>
      ) : (
        plan.priority_order.map((debtId, index) => {
          const debt = plan.debtMap.get(debtId);
          if (!debt) return null;
          return (
            <Card key={debtId} className="mb-2 flex-row items-center">
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-ink font-semibold">{debt.creditor}</Text>
                <Text className="text-muted text-xs">{formatCurrency(debt.remaining_amount)} restantes</Text>
              </View>
            </Card>
          );
        })
      )}

      <Text className="text-ink font-semibold mt-4 mb-2">Dicas para você</Text>
      {plan.tips.map((tip, index) => (
        <Card key={index} className="mb-2">
          <Text className="text-ink leading-5">💡 {tip}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
