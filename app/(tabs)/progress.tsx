// app/(tabs)/progress.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Interface para os dados
interface Debt {
  id: string;
  creditor: string;
  total_amount: number;
  remaining_amount: number;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  paid_at: string;
  debts: {
    creditor: string;
  };
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Função para carregar os dados
  const loadData = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Carregando dados de progresso para:', user.id);

      // 1. Buscar dívidas
      const { data: debtsData, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (debtsError) {
        console.error('❌ Erro ao buscar dívidas:', debtsError);
        throw debtsError;
      }

      console.log('✅ Dívidas carregadas:', debtsData?.length || 0);
      setDebts(debtsData || []);

      // 2. Buscar pagamentos recentes
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('debt_payments')
        .select('*, debts(creditor)')
        .eq('user_id', user.id)
        .order('paid_at', { ascending: false })
        .limit(10);

      if (paymentsError) {
        console.error('❌ Erro ao buscar pagamentos:', paymentsError);
        // Não vamos lançar erro aqui, apenas logar
      } else {
        console.log('✅ Pagamentos carregados:', paymentsData?.length || 0);
        setPayments(paymentsData || []);
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de progresso');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Função para refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Calcular estatísticas
  const totalDebt = debts.reduce((sum, d) => sum + (d.remaining_amount || d.total_amount), 0);
  const totalOriginal = debts.reduce((sum, d) => sum + d.total_amount, 0);
  const totalPaid = totalOriginal - totalDebt;
  const paidCount = debts.filter(d => d.status === 'quitada').length;
  const progress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

  // Formatador de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Loading
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#16A34A" size="large" />
        <Text className="text-muted mt-4">Carregando progresso...</Text>
      </View>
    );
  }

  // Renderização principal
  return (
    <ScrollView
      className="flex-1 bg-background px-5 pt-14"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#16A34A"
        />
      }
    >
      <Text className="text-ink text-2xl font-bold mb-2">📈 Progresso</Text>
      <Text className="text-muted mb-6">Acompanhe sua jornada financeira</Text>

      {/* Barra de progresso */}
      <View className="bg-primary/5 p-4 rounded-xl mb-4">
        <Text className="text-center text-ink font-bold text-lg">
          {progress.toFixed(0)}% concluído
        </Text>
        <View className="h-3 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </View>
        <Text className="text-center text-muted text-sm mt-2">
          {formatCurrency(totalPaid)} pago de {formatCurrency(totalOriginal)}
        </Text>
      </View>

      {/* Cards de estatísticas */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <Text className="text-muted text-sm">Dívidas</Text>
          <Text className="text-ink text-xl font-bold">{debts.length}</Text>
          <Text className="text-success text-xs">{paidCount} quitadas</Text>
        </View>
        <View className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <Text className="text-muted text-sm">Total Pago</Text>
          <Text className="text-ink text-xl font-bold">
            {formatCurrency(totalPaid)}
          </Text>
        </View>
      </View>

      {/* Restante */}
      <View className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-4">
        <Text className="text-muted text-sm">Restante</Text>
        <Text className="text-ink text-2xl font-bold">
          {formatCurrency(totalDebt)}
        </Text>
      </View>

      {/* Pagamentos Recentes */}
      {payments.length > 0 && (
        <>
          <Text className="text-ink font-bold text-lg mt-4 mb-3">
            💰 Pagamentos Recentes
          </Text>
          {payments.map((payment) => (
            <View
              key={payment.id}
              className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm mb-2"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-ink font-semibold">
                    {payment.debts?.creditor || 'Dívida'}
                  </Text>
                  <Text className="text-muted text-xs">
                    {new Date(payment.paid_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text className="text-primary font-bold">
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Mensagens de incentivo */}
      {debts.length === 0 && (
        <View className="bg-primary/5 p-4 rounded-xl mt-4">
          <Text className="text-center text-primary text-base">
            🎉 Você não tem dívidas ativas! Continue assim!
          </Text>
        </View>
      )}

      {debts.length > 0 && progress >= 100 && (
        <View className="bg-success/10 p-4 rounded-xl mt-4">
          <Text className="text-center text-success text-base font-semibold">
            🎉 Parabéns! Você quitou todas as suas dívidas!
          </Text>
        </View>
      )}

      {debts.length > 0 && progress < 100 && (
        <View className="bg-primary/5 p-4 rounded-xl mt-4">
          <Text className="text-center text-primary text-base">
            💪 Continue assim! Você está no caminho certo!
          </Text>
        </View>
      )}

      {/* Botão para atualizar */}
      <TouchableOpacity
        className="mt-6 bg-primary px-6 py-3 rounded-full mb-6"
        onPress={loadData}
        disabled={refreshing}
      >
        <Text className="text-white font-semibold text-center">
          🔄 Atualizar Dados
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}