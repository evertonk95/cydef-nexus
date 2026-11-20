// Configuração do prerender por ambiente (scripts/prerender.mjs).
// Fica separada para poder ser testada sem disparar o build.

/** Lê um inteiro do ambiente; vazio usa o padrão, fora da faixa lança erro. */
export function inteiroDoAmbiente(nome, padrao, min, max, env = process.env) {
  const bruto = String(env[nome] ?? "").trim();
  if (bruto === "") return padrao;
  const n = Number(bruto);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`${nome}="${bruto}" inválido: use um inteiro entre ${min} e ${max}`);
  }
  return n;
}
