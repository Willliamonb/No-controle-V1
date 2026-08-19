import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/services/authService";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const fullName = (user?.user_metadata?.full_name as string) ?? "Usuário";

  async function handleSignOut() {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Erro ao sair", error.message ?? "Tente novamente.");
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-5 pt-14 pb-10">
      <Text className="text-ink text-2xl font-bold mb-6">Perfil</Text>

      <Card className="mb-4">
        <Text className="text-muted text-xs mb-1">Nome</Text>
        <Text className="text-ink font-semibold text-base mb-3">{fullName}</Text>
        <Text className="text-muted text-xs mb-1">E-mail</Text>
        <Text className="text-ink font-semibold text-base">{user?.email}</Text>
      </Card>

      <View className="mt-4 mb-3">
        <Button label="💬 Falar com o assistente" onPress={() => router.push("/assistant")} />
      </View>

      <Button label="Sair da conta" variant="outline" onPress={handleSignOut} />
    </ScrollView>
  );
}
