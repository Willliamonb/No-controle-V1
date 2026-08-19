import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { hasSeenOnboarding } from "@/lib/onboarding";
import { hasCompletedInitialSetup } from "@/services/setupService";

type Destination = "/(onboarding)" | "/(auth)/login" | "/(setup)/profile" | "/(tabs)/dashboard";

export default function SplashRedirect() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    let cancelled = false;

    async function resolveDestination() {
      const seenOnboarding = await hasSeenOnboarding();

      let destination: Destination;
      if (!seenOnboarding) {
        destination = "/(onboarding)";
      } else if (!isAuthenticated) {
        destination = "/(auth)/login";
      } else {
        const setupDone = await hasCompletedInitialSetup(user!.id);
        destination = setupDone ? "/(tabs)/dashboard" : "/(setup)/profile";
      }

      if (!cancelled) {
        router.replace(destination);
        setResolving(false);
      }
    }

    resolveDestination();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-primary text-3xl font-bold mb-4">No Controle</Text>
      {(isLoading || resolving) && <ActivityIndicator color="#16A34A" />}
    </View>
  );
}
