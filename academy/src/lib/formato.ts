export function duracao(segundos: number): string {
  const min = Math.max(1, Math.round(segundos / 60));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h}h ${String(resto).padStart(2, "0")}min` : `${h}h`;
}

export function relogio(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function percentual(parte: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((parte / total) * 100)));
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const a = partes[0]?.[0] ?? "";
  const b = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || "?";
}
