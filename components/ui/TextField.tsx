import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-ink font-medium mb-1.5">{label}</Text>
      <TextInput
        className={`bg-surface rounded-button px-4 py-3.5 text-base text-ink border ${
          error ? "border-danger" : "border-transparent"
        }`}
        placeholderTextColor="#8A8578"
        {...inputProps}
      />
      {error ? <Text className="text-danger text-sm mt-1">{error}</Text> : null}
    </View>
  );
}
