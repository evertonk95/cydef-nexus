/**
 * HMAC-SHA256 com pepper (segredo do servidor). Usado para IP, e-mail e
 * conteúdo no controle de flood: o banco guarda só hashes, e sem o pepper
 * não dá para reverter por dicionário (SHA-256 puro de e-mail é reversível
 * por força bruta de listas vazadas).
 */
export async function hmacHex(pepper: string, valor: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(valor));
  return Array.from(new Uint8Array(assinatura))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
