import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { financialProfileSchema, FinancialProfileFormData } from "@/features/onboarding/schemas";

export default function FinancialProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: { monthlyIncome: undefined, fixedExpenses: undefined },
  });

  async function onSubmit(data: FinancialProfileFormData) {
    if (!user) return;
    setLoading(true);
    try {
      const { error: incomeError } = await supabase.from("incomes").insert({
        user_id: user.id,
        description: "Renda mensal",
        amount: data.monthlyIncome,
        received_day: 5,
      });
      if (incomeError) throw incomeError;

      if (data.fixedExpenses > 0) {
        const { error: expenseError } = await supabase.from("expenses").insert({
          user_id: user.id,
          description: "Despesas fixas",
          amount: data.fixedExpenses,
          category: "outros",
          due_day: 10,
        });
        if (expenseError) throw expenseError;
      }

      router.replace("/(setup)/loading");
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message ?? "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerClassName="flex-grow justify-center px-6">
        <View className="mb-8">
          <Text className="text-ink text-2xl font-bold mb-2">Vamos criar seu perfil financeiro</Text>
          <Text className="text-muted text-base leading-6">
            Com esses dados, montamos um plano personalizado para você sair do vermelho no seu ritmo.
          </Text>
        </View>

        <Controller
          control={control}
          name="monthlyIncome"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Qual sua renda mensal? (R$)"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={value?.toString() ?? ""}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.monthlyIncome?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="fixedExpenses"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Total de despesas fixas por mês (R$)"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={value?.toString() ?? ""}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.fixedExpenses?.message}
            />
          )}
        />

        <Button label="Continuar" onPress={handleSubmit(onSubmit)} loading={loading} />

        <Text className="text-muted text-xs text-center mt-4">
          Você poderá ajustar e detalhar isso depois, item por item.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
