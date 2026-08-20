// supabase/functions/generate-plan/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface Debt {
  id: string;
  creditor: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  due_day: number;
  status: string;
}

interface Income {
  id: string;
  description: string;
  amount: number;
  received_day: number;
}

Deno.serve(async (req) => {
  // CORS para requisições do app
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    // Criar cliente Supabase com a chave de serviço
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar dados do usuário
    console.log("🔍 Buscando dados do usuário:", userId);
    
    // Buscar perfil
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Buscar dívidas ativas
    const { data: debts } = await supabaseClient
      .from("debts")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "quitada");

    // Buscar rendas
    const { data: incomes } = await supabaseClient
      .from("incomes")
      .select("*")
      .eq("user_id", userId);

    // Buscar despesas
    const { data: expenses } = await supabaseClient
      .from("expenses")
      .select("*")
      .eq("user_id", userId);

    // Calcular totais
    const totalDebt = debts?.reduce((sum, d) => sum + (d.remaining_amount || d.total_amount), 0) || 0;
    const totalIncome = incomes?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const totalExpense = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const monthlyAvailable = totalIncome - totalExpense;

    // Construir prompt para a IA
    const systemPrompt = `Você é o "No Controle", um assistente financeiro que ajuda pessoas a saírem das dívidas.

ANALISE ESTA SITUAÇÃO FINANCEIRA:

USUÁRIO: ${profile?.full_name || "Usuário"}
RENDA MENSAL TOTAL: R$ ${totalIncome.toFixed(2)}
DESPESAS MENSAIS: R$ ${totalExpense.toFixed(2)}
DISPONÍVEL POR MÊS: R$ ${monthlyAvailable.toFixed(2)}
TOTAL DE DÍVIDAS: R$ ${totalDebt.toFixed(2)}
QUANTIDADE DE DÍVIDAS: ${debts?.length || 0}

DÍVIDAS DETALHADAS:
${debts?.map((d: Debt) => `
- ${d.creditor}: R$ ${(d.remaining_amount || d.total_amount).toFixed(2)}
  Taxa de juros: ${d.interest_rate || 0}%
  Status: ${d.status}
`).join("\n") || "Nenhuma dívida cadastrada"}

BASEADO NESTES DADOS, CRIE UM PLANO PERSONALIZADO EM FORMATO JSON:

{
  "analise": {
    "situacao": "desafiadora" | "controlavel" | "tranquila",
    "mensagem": "Uma mensagem acolhedora sobre a situação"
  },
  "plano": {
    "prioridades": [
      {
        "credor": "Nome do credor",
        "valor": 0,
        "prioridade": 1,
        "motivo": "Por que esta dívida é prioridade"
      }
    ],
    "valorMensalTotal": 0,
    "mesesParaQuitar": 0
  },
  "metas": {
    "curtoPrazo": {
      "titulo": "Meta de 1 mês",
      "descricao": "O que fazer no primeiro mês"
    },
    "medioPrazo": {
      "titulo": "Meta de 3 meses",
      "descricao": "O que fazer nos próximos 3 meses"
    },
    "longoPrazo": {
      "titulo": "Meta de 6 meses",
      "descricao": "O que fazer em 6 meses"
    }
  },
  "dicas": [
    "Dica prática 1",
    "Dica prática 2",
    "Dica prática 3"
  ],
  "mensagemMotivacional": "Uma mensagem encorajadora personalizada"
}

REGRAS:
1. Seja REALISTA - baseie tudo nos dados fornecidos
2. Seja EMPÁTICO - use linguagem acessível
3. Seja PRÁTICO - dê ações concretas
4. Se a situação for muito difícil, sugira procurar ajuda profissional`;

    // Chamar a OpenAI
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    console.log("🤖 Chamando OpenAI para gerar plano...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Meu nome é ${profile?.full_name || "Usuário"}. Me ajude a sair das dívidas!` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const aiResult = await response.json();
    
    if (!response.ok) {
      console.error("Erro na OpenAI:", aiResult);
      throw new Error(aiResult.error?.message || "Erro ao chamar OpenAI");
    }

    const plano = JSON.parse(aiResult.choices[0].message.content);

    // Salvar o plano no banco
    const { error: planError } = await supabaseClient
      .from("financial_plans")
      .insert({
        user_id: userId,
        monthly_available: monthlyAvailable,
        priority_order: plano.plano.prioridades || [],
        estimated_payoff_months: plano.plano.mesesParaQuitar || 0,
        tips: plano.dicas || [],
        raw_summary: JSON.stringify(plano)
      });

    if (planError) {
      console.error("Erro ao salvar plano:", planError);
    }

    console.log("✅ Plano gerado com sucesso!");

    return new Response(
      JSON.stringify({
        success: true,
        plano,
        resumo: {
          totalDebt,
          monthlyAvailable,
          totalIncome,
          totalExpense,
          debtsCount: debts?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});