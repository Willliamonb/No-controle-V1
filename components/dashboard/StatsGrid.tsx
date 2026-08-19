import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/formatters";

type StatsGridProps = {
  activeDebtsCount: number;
  installmentsPaid: number;
  installmentsTotal: number;
  savingsObtained: number;
  nextDueDay: number | null;
};

export function StatsGrid({ activeDebtsCount, installmentsPaid, installmentsTotal, savingsObtained, nextDueDay }: StatsGridProps) {
  const items = [
    { label: "Dívidas ativas", value: `${activeDebtsCount} conta${activeDebtsCount === 1 ? "" : "s"}` },
    { label: "Parcelas pagas", value: `${installmentsPaid} de ${installmentsTotal}` },
    { label: "Economia obtida", value: formatCurrency(savingsObtained) },
    { label: "Próximo vencimento", value: nextDueDay ? `${nextDueDay} Ago` : "—" },
  ];

  return (
    <View className="flex-row flex-wrap justify-between mt-3">
      {items.map((item) => (
        <Card key={item.label} className="w-[48%] mb-3">
          <Text className="text-muted text-xs mb-1">{item.label}</Text>
          <Text className="text-ink font-bold">{item.value}</Text>
        </Card>
      ))}
    </View>
  );
}
