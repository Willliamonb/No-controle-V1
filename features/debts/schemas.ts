import { z } from "zod";

export const debtSchema = z.object({
  creditor: z.string().min(2, "Informe o nome do credor"),
  totalAmount: z.coerce.number().positive("Informe um valor válido"),
  remainingAmount: z.coerce.number().positive("Informe um valor válido"),
  dueDay: z.coerce.number().min(1, "Dia inválido").max(31, "Dia inválido"),
});

export type DebtFormData = z.infer<typeof debtSchema>;
