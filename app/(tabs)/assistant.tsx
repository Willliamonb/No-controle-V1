// app/(tabs)/assistant.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export default function AssistantScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Carregar histórico de mensagens
  useEffect(() => {
    if (user?.id) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar histórico:', error);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('❌ Erro:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (!input.trim() || loading || !user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('financial-assistant', {
        body: { 
          question: input.trim(), 
          userId: user.id 
        }
      });

      if (error) {
        console.error('❌ Erro ao chamar assistente:', error);
        throw new Error(error.message || 'Erro ao processar pergunta');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.message || 'Desculpe, não entendi. Pode reformular?',
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Scroll para o final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error: any) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', error.message || 'Erro ao enviar mensagem');
      
      // Remover mensagem do usuário se falhou
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

  // Renderizar cada mensagem
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <View
          className={`max-w-[85%] p-4 rounded-2xl ${
            isUser
              ? 'bg-primary rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-800 rounded-bl-none'
          }`}
        >
          <Text
            className={isUser ? 'text-white' : 'text-ink dark:text-white'}
          >
            {item.content}
          </Text>
          <Text className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
            {new Date(item.created_at).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loadingHistory) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#16A34A" size="large" />
        <Text className="text-muted mt-4">Carregando conversas...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View className="px-5 pt-14 pb-4 border-b border-gray-200 dark:border-gray-800">
        <Text className="text-ink text-xl font-bold">🤖 Assistente</Text>
        <Text className="text-muted text-sm">Seu consultor financeiro pessoal</Text>
      </View>

      {/* Mensagens */}
      {messages.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🤝</Text>
          <Text className="text-ink text-lg font-bold text-center">
            Olá! Como posso ajudar?
          </Text>
          <Text className="text-muted text-center mt-2">
            Pergunte sobre suas dívidas, peça dicas de economia ou apenas converse sobre sua situação financeira.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-full"
            onPress={() => {
              setInput('Qual a melhor forma de quitar minhas dívidas?');
            }}
          >
            <Text className="text-white font-semibold">💬 Exemplo de pergunta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerClassName="px-5 py-4"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input */}
      <View className="flex-row items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-background">
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-3 text-ink dark:text-white"
          placeholder="Digite sua pergunta..."
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          className={`rounded-full p-3 ${
            loading || !input.trim()
              ? 'bg-gray-300 dark:bg-gray-700'
              : 'bg-primary'
          }`}
          onPress={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-lg">➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}