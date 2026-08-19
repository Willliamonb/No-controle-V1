import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
};

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-accent",
  outline: "bg-transparent border border-primary",
};

const VARIANT_TEXT_STYLES: Record<string, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-primary",
};

export function Button({ label, onPress, variant = "primary", loading, disabled }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-button py-4 items-center justify-center ${VARIANT_STYLES[variant]} ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#16A34A" : "#FFFFFF"} />
      ) : (
        <Text className={`font-semibold text-base ${VARIANT_TEXT_STYLES[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
