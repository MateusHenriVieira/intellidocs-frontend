import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data ISO (UTC) para o padrão brasileiro (Dia/Mês/Ano Hora:Min)
 * Força o fuso horário de Brasília (America/Sao_Paulo)
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";

  // Se a string vier sem o 'Z' (UTC) no final, adicionamos para garantir
  // que o navegador entenda que é hora Zulu (Universal) e não local.
  const isoString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;

  try {
    const date = new Date(isoString);
    
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo", // Força horário de Brasília
    }).format(date);
  } catch (error) {
    return dateString; // Retorna original se falhar
  }
}

/**
 * Retorna apenas a data (Dia/Mês/Ano)
 */
export function formatDateOnly(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  const isoString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
  
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(isoString));
  } catch (e) { return dateString; }
}