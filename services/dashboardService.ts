import { supabase } from "@/lib/supabase";
import type { AiInsight, DashboardSummary, Debt, DebtPayment, Expense, Income, ProgressChecklistItem } from "@/types";
import { firstName } from "@/utils/formatters";
import { generateFinancialPlan } from "@/services/aiService";

export async function fetchDashboardSummary(userId: string, fullName: string): Promise<DashboardSummary> {
  const [{ data: incomes }, { data: expenses }, { data: debts }, { data: payments }] = await Promise.all([
    supabase.from("incomes").select("*").eq("user_id", userId),
    supabase.from("expenses").select("*").eq("user_id", userId),
    supabase.from("debts").select("*").eq("user_id", userId),
    supabase
      .from("debt_payments")
      .select("*")
      .eq("user_id", userId)
      .order("paid_at", { ascending: false })
      .limit(5),
  ]);

  const incomeList = (incomes ?? []) as Income[];
  const expenseList = (expenses ?? []) as Expense[];
  const debtList = (debts ?? []) as Debt[];
  const paymentList = (payments ?? []) as DebtPayment[];

  const totalIncome = sum(incomeList, (i) => i.amount);
  const totalExpenses = sum(expenseList, (e) => e.amount);

  const activeDebts = debtList.filter((d) => d.status !== "quitada");
  const totalDebtOriginal = sum(debtList, (d) => d.total_amount);
  const remainingAmount = sum(activeDebts, (d) => d.remaining_amount);
  const totalPaid = totalDebtOriginal - remainingAmount;
  const reductionPercent = totalDebtOriginal > 0 ? (totalPaid / totalDebtOriginal) * 100 : 0;

  const installmentsPaid = sum(debtList, (d) => d.installments_paid);
  const installmentsTotal = sum(debtList, (d) => d.installments_total ?? d.installments_paid);

  const nextDebt = [...activeDebts].sort((a, b) => a.due_day - b.due_day)[0];

  const plan = await generateFinancialPlan({ incomes: incomeList, expenses: expenseList, debts: debtList });
  const aiTip = plan.tips[0] ?? "Cadastre suas dívidas para receber recomendações personalizadas.";

  const quitadas = debtList.filter((d) => d.status === "quitada");
  const negociando = debtList.find((d) => d.status === "negociando");

  const progressChecklist: ProgressChecklistItem[] = [
    {
      label: quitadas[0] ? "Primeira dívida quitada" : "Quite sua primeira dívida",
      sublabel: quitadas[0]?.creditor ?? "Ainda não há dívidas quitadas",
      done: quitadas.length > 0,
    },
    {
      label: "Reserva de emergência iniciada",
      sublabel: totalIncome - totalExpenses > 0 ? "Você já tem saldo livre todo mês" : "Organize seu saldo livre mensal",
      done: totalIncome - totalExpenses > 0,
    },
    {
      label: negociando ? "Próxima meta em andamento" : "Negocie sua próxima dívida",
      sublabel: negociando?.creditor ?? nextDebt?.creditor ?? "Cadastre uma dívida para começar",
      done: false,
    },
  ];

  return {
    greetingName: `Olá, ${firstName(fullName) || "por aí"}`,
    totalDebtOriginal,
    remainingAmount,
    reductionPercent: Math.min(Math.max(reductionPercent, 0), 100),
    availableBalance: Math.max(totalIncome - totalExpenses, 0),
    totalIncome,
    totalExpenses,
    progressPercent: Math.min(Math.max(reductionPercent, 0), 100),
    activeDebtsCount: activeDebts.length,
    installmentsPaid,
    installmentsTotal,
    savingsObtained: 0,
    nextDueDate: nextDebt
      ? { label: nextDebt.creditor, amount: nextDebt.remaining_amount, day: nextDebt.due_day }
      : null,
    recentMovements: paymentList,
    aiTipOfTheDay: aiTip,
    aiPlanRecommendation: plan.raw_summary,
    progressChecklist,
    aiInsights: buildAiInsights(plan.tips, expenseList),
  };
}

function buildAiInsights(tips: string[], expenses: Expense[]): AiInsight[] {
  const insights: AiInsight[] = [];

  const foodExpense = expenses.find((e) => e.category === "alimentacao");
  if (foodExpense) {
    insights.push({
      title: "Reduza gastos com alimentação",
      description: `Identificamos ${formatBRL(foodExpense.amount)} em gastos com "${foodExpense.description}" este mês.`,
      tagLabel: "Economizar",
      tagTone: "success",
    });
  }

  if (tips[1]) {
    insights.push({
      title: "Renegocie suas dívidas",
      description: tips[1],
      tagLabel: "Meta",
      tagTone: "warning",
    });
  }

  insights.push({
    title: "Meta de economia mensal",
    description: "Com metas simples, você pode guardar um pouco todo mês, mesmo com pouco sobrando.",
    tagLabel: "Definir",
    tagTone: "info",
  });

  return insights.slice(0, 3);
}

function sum<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((total, item) => total + getValue(item), 0);
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
