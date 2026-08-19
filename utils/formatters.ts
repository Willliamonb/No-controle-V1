export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function firstName(fullName: string | null | undefined): string {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
}

export function greetingByHour(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
