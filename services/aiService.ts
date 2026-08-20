// services/aiService.ts
import { supabase } from '@/lib/supabase';

// Objeto com todos os métodos
const aiService = {
  /**
   * Busca o plano mais recente do usuário
   */
  getLatestPlan: async (userId: string) => {
    try {
      console.log('🔍 Buscando plano para:', userId);
      
      const { data, error } = await supabase
        .from('financial_plans')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar plano:', error);
        throw error;
      }

      console.log('📊 Plano encontrado:', data ? '✅ Sim' : '❌ Não');
      return data;
      
    } catch (error: any) {
      console.error('❌ Erro em getLatestPlan:', error);
      return null;
    }
  },

  /**
   * Gera um plano financeiro personalizado
   */
  generatePlan: async (userId: string) => {
    try {
      console.log('📊 Gerando plano para:', userId);
      
      const { data, error } = await supabase.functions.invoke('generate-plan', {
        body: { userId }
      });

      if (error) {
        console.error('❌ Erro ao gerar plano:', error);
        throw new Error(error.message || 'Erro ao gerar plano');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao gerar plano');
      }

      console.log('✅ Plano gerado com sucesso!');
      return data;
      
    } catch (error: any) {
      console.error('❌ Erro no serviço de IA:', error);
      throw new Error(error.message || 'Erro ao gerar plano financeiro');
    }
  },

  /**
   * Faz uma pergunta ao assistente financeiro
   */
  askAssistant: async (question: string, userId: string) => {
    try {
      console.log('💬 Pergunta:', question);
      
      const { data, error } = await supabase.functions.invoke('financial-assistant', {
        body: { question, userId }
      });

      if (error) {
        console.error('❌ Erro ao chamar assistente:', error);
        throw new Error(error.message || 'Erro ao processar pergunta');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao processar pergunta');
      }

      console.log('✅ Resposta recebida');
      return data.message;
      
    } catch (error: any) {
      console.error('❌ Erro no assistente:', error);
      throw new Error(error.message || 'Erro ao processar sua pergunta');
    }
  },

  /**
   * Salva um plano no banco (opcional)
   */
  savePlan: async (userId: string, plano: any) => {
    try {
      const { error } = await supabase
        .from('financial_plans')
        .insert({
          user_id: userId,
          monthly_available: plano?.monthlyAvailable || 0,
          priority_order: plano?.plano?.prioridades || [],
          estimated_payoff_months: plano?.plano?.mesesParaQuitar || 0,
          tips: plano?.dicas || [],
          raw_summary: JSON.stringify(plano)
        });

      if (error) throw error;
      console.log('✅ Plano salvo com sucesso');
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao salvar plano:', error);
      return false;
    }
  }
};

// ✅ Exportar o objeto completo
export default aiService;
// E também exportar como named export para compatibilidade
export { aiService };