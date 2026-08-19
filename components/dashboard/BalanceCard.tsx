import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency, formatPercent } from "@/utils/formatters";

type BalanceCardProps = {
  totalDebtOriginal: number;
  remainingAmount: number;
  reductionPercent: number;
};

export function BalanceCard({ totalDebtOriginal, remainingAmount, reductionPercent }: BalanceCardProps) {
  return (
    <LinearGradient
      colors={["#16A34A", "#15803D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 18 }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white/80 text-xs font-semibold tracking-wide">BALANÇO GERAL</Text>
        <View className="px-2.5 py-1 rounded-full bg-white/20">
          <Text className="text-white text-xs font-bold">ORGANIZADO</Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-white/70 text-xs mb-1">Dívida Total</Text>
          <Text className="text-white text-xl font-bold">{formatCurrency(totalDebtOriginal)}</Text>
        </View>
        <View className="items-end">
          <Text className="text-white/70 text-xs mb-1">Valor Restante</Text>
          <Text className="text-white text-xl font-bold">{formatCurrency(remainingAmount)}</Text>
        </View>
      </View>

      <Text className="text-white/85 text-sm leading-5">
        Você já reduziu {formatPercent(reductionPercent)} das suas dívidas. Continue assim!
      </Text>
    </LinearGradient>
  );
}
