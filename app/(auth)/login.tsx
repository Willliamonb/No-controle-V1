import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { loginSchema, LoginFormData } from "@/features/auth/schemas";
import { signIn } from "@/services/authService";
import { hasCompletedInitialSetup } from "@/services/setupService";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const { user } = await signIn(data.email, data.password);
      const setupDone = user ? await hasCompletedInitialSetup(user.id) : false;
      router.replace(setupDone ? "/(tabs)/dashboard" : "/(setup)/profile");
    } catch (error: any) {
      Alert.alert("Não foi possível entrar", error.message ?? "Verifique seus dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6" keyboardShouldPersistTaps="handled">
        <View className="mb-10">
          <Text className="text-primary text-4xl font-bold mb-2">No Controle</Text>
          <Text className="text-muted text-base">
            Seu companheiro financeiro para organizar as contas e sair do vermelho, no seu ritmo.
          </Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Button label="Entrar" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted">Ainda não tem conta? </Text>
          <Link href="/(auth)/signup">
            <Text className="text-primary font-semibold">Cadastre-se</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
