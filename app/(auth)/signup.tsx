import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { signupSchema, SignupFormData } from "@/features/auth/schemas";
import { signUp } from "@/services/authService";

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: SignupFormData) {
    setLoading(true);
    try {
      const result = await signUp(data.fullName, data.email, data.password);

      if (result.session) {
        // Confirmação de e-mail desativada no projeto Supabase: usuário já está logado.
        router.replace("/(setup)/profile");
        return;
      }

      Alert.alert(
        "Quase lá!",
        "Confirme seu e-mail para ativar sua conta e depois faça login para começar a organizar suas finanças.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (error: any) {
      Alert.alert("Não foi possível cadastrar", error.message ?? "Tente novamente em instantes.");
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
        <View className="mb-8">
          <Text className="text-primary text-3xl font-bold mb-2">Vamos começar</Text>
          <Text className="text-muted text-base">
            Leva menos de um minuto. Suas informações ficam seguras e só você tem acesso a elas.
          </Text>
        </View>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Nome completo"
              placeholder="Como podemos te chamar?"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.fullName?.message}
            />
          )}
        />

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
              placeholder="Crie uma senha"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Confirme a senha"
              placeholder="Repita a senha"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Button label="Criar conta" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted">Já tem conta? </Text>
          <Link href="/(auth)/login">
            <Text className="text-primary font-semibold">Entrar</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
