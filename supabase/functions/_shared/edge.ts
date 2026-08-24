/**
 * Helpers compartilhados das Edge Functions (Deno + Node para testes).
 * Sem referência direta a `Deno.` (shim via globalThis) — código roda em
 * Deno (Supabase) e em Node/vitest (testes locais).
 */

export function getEnv(name: string): string | undefined {
  const deno = (globalThis as unknown as { Deno?: { env?: { get(k: string): string | undefined } } })
    .Deno;
  if (deno?.env) {
    return deno.env.get(name);
  }
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process;
  return proc?.env?.[name];
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}

/** Hash SHA-256 hex do IP (nunca o IP em claro — SEC-008). */
export async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function ipDoRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    return fwd.split(",")[0]?.trim() ?? "desconhecido";
  }
  return "desconhecido";
}

export function novoRequestId(): string {
  return crypto.randomUUID();
}
