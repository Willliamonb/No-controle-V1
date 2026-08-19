import { z } from "zod";

export const financialProfileSchema = z.object({
  monthlyIncome: z.coerce.number().positive("Informe um valor válido"),
  fixedExpenses: z.coerce.number().min(0, "Informe um valor válido"),
});

export type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;
