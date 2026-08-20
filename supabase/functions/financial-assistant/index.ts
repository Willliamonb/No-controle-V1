// supabase/functions/financial-assistant/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, userId } = await req.json();
    
    if (!question || !userId) {
      throw new Error("question e userId são obrigatórios");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar contexto financeiro do usuário
    const { data: debts } = await supabaseClient
      .from("debts")
      .select("*")
      .eq("user_id", userId);

    const { data: incomes } = await supabaseClient
      .from("incomes")
      .select("*")
      .eq("user_id", userId);

    const { data: expenses } = await supabaseClient
      .from("expenses")
      .select("*")
      .eq("user_id", userId);

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    const { data: plan } = await supabaseClient
      .from("financial_plans")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    // Construir contexto
    const context = `
USUÁRIO: ${profile?.full_name || "Usuário"}
DÍVIDAS: ${debts?.length || 0} dívidas no total de R$ ${debts?.reduce((s, d) => s + (d.remaining_amount || d.total_amount), 0).toFixed(2) || 0}
RENDAS: ${incomes?.length || 0} fontes de renda
DESPESAS: ${expenses?.length || 0} despesas cadastradas
PLANO ATUAL: ${plan ? "Plano gerado em " + new Date(plan.generated_at).toLocaleDateString() : "Nenhum plano gerado ainda"}
`;

    const systemPrompt = `Você é o assistente do "No Controle", um aplicativo que ajuda pessoas a saírem das dívidas.

DIRETRIZES IMPORTANTES:
1. Use linguagem SIMPLES e ACESSÍVEL
2. Seja EMPÁTICO e ENCORAJADOR
3. Baseie TODAS as respostas nos dados fornecidos
4. Se não souber algo, diga "Não tenho essa informação, mas posso te ajudar com..."
5. NUNCA dê conselhos que possam prejudicar o usuário
6. Se a pergunta for sobre um dado específico, consulte o contexto

CONTEXTO DO USUÁRIO:
${context}

MANTENHA O TOM:
- Amigável como um amigo que entende de finanças
- Prático e direto
- Motivador e esperançoso
- Sem julgamentos`;

    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

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
          { role: "user", content: question }
        ],
      }),
    });

    const aiResult = await response.json();
    
    if (!response.ok) {
      console.error("Erro na OpenAI:", aiResult);
      throw new Error(aiResult.error?.message || "Erro ao chamar OpenAI");
    }

    const answer = aiResult.choices[0].message.content;

    // Salvar mensagem no histórico
    await supabaseClient.from("ai_messages").insert([
      { user_id: userId, role: "user", content: question },
      { user_id: userId, role: "assistant", content: answer }
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: answer
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