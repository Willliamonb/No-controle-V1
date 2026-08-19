import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CircularProgressProps = {
  percent: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export function CircularProgress({ percent, size = 120, strokeWidth = 12, label }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          stroke="#F0EEE6"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#16A34A"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-ink text-2xl font-bold">{Math.round(clamped)}%</Text>
        {label ? <Text className="text-muted text-xs mt-0.5">{label}</Text> : null}
      </View>
    </View>
  );
}
