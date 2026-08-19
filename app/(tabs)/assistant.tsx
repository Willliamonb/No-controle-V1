import React, { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import type { AiMessage } from "@/types";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `local-${idCounter}`;
}

const INITIAL_MESSAGE: AiMessage = {
  id: nextId(),
  user_id: "local",
  role: "assistant",
  content:
    "Oi! Eu sou o assistente do No Controle. Pode me contar como está sua situação financeira ou tirar dúvidas sobre seu plano. Estou aqui para te ajudar, sem julgamentos. 💚",
  created_at: new Date().toISOString(),
};

export default function AssistantScreen() {
  const [messages, setMessages] = useState<AiMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: AiMessage = {
      id: nextId(),
      user_id: "local",
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    // Resposta simulada — em produção, substituir por chamada ao aiService/OpenAI
    const assistantMessage: AiMessage = {
      id: nextId(),
      user_id: "local",
      role: "assistant",
      content:
        "Entendi. Assim que a integração com a IA estiver conectada, vou te dar uma resposta personalizada com base no seu plano financeiro. Por enquanto, foque em registrar suas dívidas e despesas para eu poder te ajudar melhor!",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="pt-14 px-5 pb-2">
        <Text className="text-ink text-2xl font-bold">Assistente</Text>
      </View>

      <FlatList
        className="flex-1 px-5"
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className={`max-w-[85%] rounded-card px-4 py-3 mb-3 ${
              item.role === "assistant" ? "bg-surface self-start" : "bg-primary self-end"
            }`}
          >
            <Text className={item.role === "assistant" ? "text-ink" : "text-white"}>{item.content}</Text>
          </View>
        )}
      />

      <View className="flex-row items-center px-5 py-3 border-t border-background bg-surface">
        <TextInput
          className="flex-1 bg-background rounded-button px-4 py-3 mr-2 text-ink"
          placeholder="Escreva sua mensagem..."
          placeholderTextColor="#8A8578"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <Pressable onPress={handleSend} className="bg-primary rounded-button px-4 py-3">
          <Text className="text-white font-semibold">Enviar</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
