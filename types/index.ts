export type Profile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

export type Income = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  received_day: number; // dia do mês (1-31)
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  due_day: number;
  created_at: string;
};

export type ExpenseCategory =
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "saude"
  | "educacao"
  | "outros";

export type DebtStatus = "em_dia" | "atrasada" | "quitada" | "negociando";

export type Debt = {
  id: string;
  user_id: string;
  creditor: string;
  description: string | null;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number | null; // % ao mês
  installments_total: number | null;
  installments_paid: number;
  due_day: number;
  status: DebtStatus;
  created_at: string;
};

export type DebtPayment = {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  paid_at: string;
};

export type FinancialPlan = {
  id: string;
  user_id: string;
  generated_at: string;
  monthly_available: number;
  priority_order: string[]; // ids de debts, em ordem de prioridade
  estimated_payoff_months: number;
  tips: string[];
  raw_summary: string;
};

export type AiMessageRole = "user" | "assistant";

export type AiMessage = {
  id: string;
  user_id: string;
  role: AiMessageRole;
  content: string;
  created_at: string;
};

export type ProgressChecklistItem = {
  label: string;
  sublabel: string;
  done: boolean;
};

export type AiInsightTone = "success" | "warning" | "info";

export type AiInsight = {
  title: string;
  description: string;
  tagLabel: string;
  tagTone: AiInsightTone;
};

export type DashboardSummary = {
  greetingName: string;
  totalDebtOriginal: number; // "Dívida Total"
  remainingAmount: number; // "Valor Restante"
  reductionPercent: number; // quanto já foi reduzido, em %
  availableBalance: number;
  totalIncome: number;
  totalExpenses: number;
  progressPercent: number; // 0-100, quanto já foi quitado
  activeDebtsCount: number;
  installmentsPaid: number;
  installmentsTotal: number;
  savingsObtained: number;
  nextDueDate: { label: string; amount: number; day: number } | null;
  recentMovements: DebtPayment[];
  aiTipOfTheDay: string;
  aiPlanRecommendation: string;
  progressChecklist: ProgressChecklistItem[];
  aiInsights: AiInsight[];
};
