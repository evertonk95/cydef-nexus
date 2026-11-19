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

/** "1 aula", "3 aulas", "0 aulas": concorda a palavra com a quantidade. */
export function contagem(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** "1 de 1 aula", "2 de 5 aulas": a palavra concorda com o total. */
export function fracao(parte: number, total: number, singular: string, plural: string): string {
  return `${parte} de ${contagem(total, singular, plural)}`;
}

/** Texto em minúsculas e sem acento, para busca tolerante ("introducao" acha "Introdução"). */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** "Bom dia" das 5h às 11h59, "Boa tarde" até 17h59, "Boa noite" no resto, no horário do aluno. */
export function saudacao(hora: number): string {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
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
