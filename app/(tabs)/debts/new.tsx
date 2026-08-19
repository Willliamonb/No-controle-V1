import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { debtSchema, DebtFormData } from "@/features/debts/schemas";

export default function NewDebtScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: { creditor: "", totalAmount: undefined, remainingAmount: undefined, dueDay: undefined },
  });

  async function onSubmit(data: DebtFormData) {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("debts").insert({
        user_id: user.id,
        creditor: data.creditor,
        total_amount: data.totalAmount,
        remaining_amount: data.remainingAmount,
        due_day: data.dueDay,
        installments_paid: 0,
        status: "em_dia",
      });
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["debts", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary", user.id] });
      router.back();
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message ?? "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerClassName="px-5 pt-14 pb-10">
        <Text className="text-ink text-2xl font-bold mb-6">Nova dívida</Text>

        <Controller
          control={control}
          name="creditor"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Credor (banco, loja, pessoa...)"
              placeholder="Ex: Cartão Nubank"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.creditor?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="totalAmount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Valor total da dívida (R$)"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={value?.toString() ?? ""}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.totalAmount?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="remainingAmount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Valor que falta pagar (R$)"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={value?.toString() ?? ""}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.remainingAmount?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="dueDay"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Dia do vencimento (1-31)"
              placeholder="Ex: 10"
              keyboardType="number-pad"
              value={value?.toString() ?? ""}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.dueDay?.message}
            />
          )}
        />

        <Button label="Salvar dívida" onPress={handleSubmit(onSubmit)} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
