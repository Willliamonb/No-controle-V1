import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { generateFinancialPlan } from "@/services/aiService";
import type { Debt, Expense, Income } from "@/types";

const STEPS = [
  "Lendo sua renda e despesas...",
  "Organizando suas dívidas por prioridade...",
  "Montando o plano ideal para o seu bolso...",
];

export default function AiLoadingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 900);

    async function prepareAndRedirect() {
      if (user) {
        try {
          const [{ data: incomes }, { data: expenses }, { data: debts }] = await Promise.all([
            supabase.from("incomes").select("*").eq("user_id", user.id),
            supabase.from("expenses").select("*").eq("user_id", user.id),
            supabase.from("debts").select("*").eq("user_id", user.id),
          ]);

          // Pré-gera o plano para aquecer o cache/backend de IA antes do dashboard abrir.
          await generateFinancialPlan({
            incomes: (incomes ?? []) as Income[],
            expenses: (expenses ?? []) as Expense[],
            debts: (debts ?? []) as Debt[],
          });
        } catch (error) {
          console.warn("[AiLoadingScreen] Falha ao pré-gerar plano:", error);
        }
      }

      setTimeout(() => {
        router.replace("/(tabs)/dashboard");
      }, 2800);
    }

    prepareAndRedirect();

    return () => clearInterval(stepInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View className="flex-1 bg-surfaceDark items-center justify-center px-8">
      <Animated.View
        style={{
          transform: [{ rotate }],
          width: 64,
          height: 64,
          borderRadius: 32,
          borderWidth: 4,
          borderColor: "rgba(22,163,74,0.25)",
          borderTopColor: "#16A34A",
          marginBottom: 32,
        }}
      />
      <Text className="text-white text-xl font-bold text-center mb-3">
        Estamos analisando suas informações
      </Text>
      <Text className="text-white/60 text-center leading-6">{STEPS[stepIndex]}</Text>
    </View>
  );
}
