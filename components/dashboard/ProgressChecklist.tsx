import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { ProgressChecklistItem } from "@/types";

export function ProgressChecklist({ items }: { items: ProgressChecklistItem[] }) {
  return (
    <Card>
      {items.map((item, index) => (
        <View
          key={item.label}
          className={`flex-row items-center ${index < items.length - 1 ? "mb-3" : ""}`}
        >
          <View
            className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
              item.done ? "bg-primary" : "bg-background border border-muted/40"
            }`}
          >
            <Text className={item.done ? "text-white text-xs" : "text-muted text-xs"}>{item.done ? "✓" : "•"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-ink font-medium">{item.label}</Text>
            <Text className="text-muted text-xs mt-0.5">{item.sublabel}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}
