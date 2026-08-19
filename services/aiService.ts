import type { Debt, Expense, FinancialPlan, Income } from "@/types";

type GeneratePlanInput = {
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
};

type GeneratedPlan = Omit<FinancialPlan, "id" | "user_id" | "generated_at">;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Gera um plano financeiro personalizado a partir da renda, despesas e dívidas do usuário.
 *
 * Se OPENAI_API_KEY estiver configurada, usa a API da OpenAI para gerar recomendações
 * em linguagem natural. Caso contrário, cai automaticamente em um mock local
 * (heurística de "bola de neve" + "avalanche") — assim o app funciona 100% offline
 * durante o desenvolvimento e demonstrações.
 */
export async function generateFinancialPlan(input: GeneratePlanInput): Promise<GeneratedPlan> {
  if (OPENAI_API_KEY) {
    try {
      return await generateWithOpenAI(input, OPENAI_API_KEY);
    } catch (error) {
      console.warn("[aiService] Falha ao chamar OpenAI, usando mock local:", error);
    }
  }
  return generateMockPlan(input);
}

async function generateWithOpenAI(
  { incomes, expenses, debts }: GeneratePlanInput,
  apiKey: string
): Promise<GeneratedPlan> {
  const totalIncome = sum(incomes, (i) => i.amount);
  const totalExpenses = sum(expenses, (e) => e.amount);

  const prompt = `Você é um consultor financeiro acolhedor que ajuda pessoas de baixa renda a sair das dívidas.
Renda mensal total: R$ ${totalIncome.toFixed(2)}
Despesas fixas totais: R$ ${totalExpenses.toFixed(2)}
Dívidas: ${JSON.stringify(
    debts.map((d) => ({
      credor: d.creditor,
      valor_restante: d.remaining_amount,
      juros_mes: d.interest_rate,
      status: d.status,
    }))
  )}

Responda APENAS em JSON válido, sem markdown, no formato:
{
  "priority_order": ["id1", "id2"],
  "monthly_available": number,
  "estimated_payoff_months": number,
  "tips": ["dica curta 1", "dica curta 2", "dica curta 3"],
  "raw_summary": "resumo curto e acolhedor em 1 parágrafo"
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return {
    monthly_available: parsed.monthly_available,
    priority_order: parsed.priority_order,
    estimated_payoff_months: parsed.estimated_payoff_months,
    tips: parsed.tips,
    raw_summary: parsed.raw_summary,
  };
}

/**
 * Mock inteligente: prioriza dívidas com maior juros primeiro (método "avalanche"),
 * mas dá preferência a dívidas pequenas quase quitadas para gerar vitórias rápidas
 * (efeito "bola de neve"), como recomendado para engajamento em público de baixa renda.
 */
function generateMockPlan({ incomes, expenses, debts }: GeneratePlanInput): GeneratedPlan {
  const totalIncome = sum(incomes, (i) => i.amount);
  const totalExpenses = sum(expenses, (e) => e.amount);
  const monthlyAvailable = Math.max(totalIncome - totalExpenses, 0);

  const activeDebts = debts.filter((d) => d.status !== "quitada");

  const scored = activeDebts
    .map((d) => {
      const urgency = d.status === "atrasada" ? 2 : 0;
      const interest = d.interest_rate ?? 0;
      const closeToPayoff = d.remaining_amount < 300 ? 1.5 : 0;
      const score = urgency + interest / 5 + closeToPayoff;
      return { debt: d, score };
    })
    .sort((a, b) => b.score - a.score);

  const priorityOrder = scored.map((s) => s.debt.id);
  const totalDebt = sum(activeDebts, (d) => d.remaining_amount);

  const estimatedPayoffMonths =
    monthlyAvailable > 0 ? Math.max(Math.ceil(totalDebt / monthlyAvailable), 1) : 0;

  const tips = buildTips({ monthlyAvailable, totalDebt, activeDebts });

  const topDebtName = scored[0]?.debt.creditor ?? null;

  return {
    monthly_available: Number(monthlyAvailable.toFixed(2)),
    priority_order: priorityOrder,
    estimated_payoff_months: estimatedPayoffMonths,
    tips,
    raw_summary: topDebtName
      ? `Com base na sua renda e despesas, você tem cerca de ${formatBRL(
          monthlyAvailable
        )} livres por mês. Recomendamos focar primeiro em "${topDebtName}" — quitar essa dívida primeiro vai te dar fôlego e uma vitória rápida para seguir em frente.`
      : "Você ainda não tem dívidas cadastradas. Vamos começar cadastrando sua renda e despesas para montar seu plano!",
  };
}

function buildTips({
  monthlyAvailable,
  totalDebt,
  activeDebts,
}: {
  monthlyAvailable: number;
  totalDebt: number;
  activeDebts: Debt[];
}): string[] {
  const tips: string[] = [];

  if (monthlyAvailable <= 0) {
    tips.push("Suas despesas estão consumindo toda a sua renda. Vamos revisar juntos onde é possível cortar um pouco.");
  } else {
    tips.push(`Separe ${formatBRL(monthlyAvailable)} todo mês, assim que a renda entrar, antes de gastar com outras coisas.`);
  }

  const hasLateDebt = activeDebts.some((d) => d.status === "atrasada");
  if (hasLateDebt) {
    tips.push("Você tem dívidas atrasadas. Ligue para o credor e pergunte sobre renegociação — muitas empresas dão desconto para pagamento à vista.");
  }

  if (totalDebt > 0 && monthlyAvailable > 0) {
    tips.push("Evite fazer novas dívidas ou usar cartão de crédito enquanto está quitando as atuais.");
  }

  tips.push("Comemore cada dívida quitada — pequenas vitórias te mantêm motivado no caminho até ficar #NoControle.");

  return tips;
}

function sum<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((total, item) => total + getValue(item), 0);
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
