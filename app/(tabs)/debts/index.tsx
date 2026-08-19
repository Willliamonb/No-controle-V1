import React from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatters";
import type { Debt } from "@/types";

const STATUS_LABEL: Record<Debt["status"], string> = {
  em_dia: "Em dia",
  atrasada: "Atrasada",
  quitada: "Quitada",
  negociando: "Negociando",
};

export default function DebtsListScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", user!.id)
        .order("due_day", { ascending: true });
      if (error) throw error;
      return data as Debt[];
    },
    enabled: !!user?.id,
  });

  return (
    <View className="flex-1 bg-background pt-14 px-5">
      <Text className="text-ink text-2xl font-bold mb-4">Minhas dívidas</Text>

      <Button label="+ Cadastrar dívida" onPress={() => router.push("/debts/new")} />

      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#16A34A" />
      ) : (
        <FlatList
          className="mt-4"
          data={debts ?? []}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Card>
              <Text className="text-muted">Você ainda não cadastrou nenhuma dívida.</Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/debts/${item.id}`)}>
              <Card className="mb-3 flex-row justify-between items-center">
                <View>
                  <Text className="text-ink font-semibold">{item.creditor}</Text>
                  <Text className="text-muted text-xs mt-0.5">{STATUS_LABEL[item.status]} · vence dia {item.due_day}</Text>
                </View>
                <Text className="text-accent font-bold">{formatCurrency(item.remaining_amount)}</Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
