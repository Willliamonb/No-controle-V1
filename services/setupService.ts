import { supabase } from "@/lib/supabase";

/**
 * Considera a coleta inicial concluída quando o usuário já tem pelo menos
 * um registro de renda cadastrado.
 */
export async function hasCompletedInitialSetup(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("incomes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.warn("[setupService] Falha ao checar coleta inicial:", error.message);
    return false;
  }

  return (count ?? 0) > 0;
}
