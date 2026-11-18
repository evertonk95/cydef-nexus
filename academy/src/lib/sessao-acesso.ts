import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Registra o acesso uma vez por sessão do navegador: atualiza o último acesso e
 * matricula o aluno nos cursos gratuitos publicados desde o último login.
 * O retorno do link de acesso já registra; aqui cobre quem continua logado.
 */
const registrados = new Set<string>();

export function marcarAcessoRegistrado(userId: string): void {
  registrados.add(userId);
}

export async function registrarAcessoDaSessao(sb: SupabaseClient, userId: string): Promise<boolean> {
  if (registrados.has(userId)) return false;
  registrados.add(userId);
  const { error } = await sb.rpc("academy_registrar_acesso");
  if (error) {
    registrados.delete(userId);
    return false;
  }
  return true;
}
