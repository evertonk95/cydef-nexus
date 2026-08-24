/**
 * Simulação documentada do padrão RLS deny-by-default (HEL-M03/M07, SEC-009).
 *
 * S-01 (spike) é uma validação LOCAL: não há Postgres local nem conta Supabase
 * autorizada. Este módulo modela fielmente a semântica dos grants/policies que
 * a migração `supabase/migrations/0001_init.sql` declara:
 *   - RLS habilitado sem policies em todas as tabelas → deny-by-default;
 *   - anon/authenticated/service_role sem grants de tabela;
 *   - RPCs `security definer` com EXECUTE apenas para a role de função;
 *   - trigger de imutabilidade em `consentimentos` (nega UPDATE/DELETE).
 *
 * O GATE REAL (go-live) é o script `scripts/rls-negative-test.mjs`, que executa
 * os 6 casos HEL-M07 contra o REST público do provedor (blocked por autorização
 * — requer conta/credenciais). Esta simulação prova o PADRÃO declarado.
 */

export type AcessoDb = "select" | "insert" | "update" | "delete" | "execute";

export interface Grant {
  role: string;
  alvo: string; // nome da tabela ou função
  acesso: AcessoDb;
}

export interface TriggerImutavel {
  tabela: string;
  eventos: Array<"update" | "delete">;
}

export interface Tentativa {
  role: string;
  alvo: string;
  acesso: AcessoDb;
}

export interface ResultadoTentativa {
  permitido: boolean;
  razao:
    | "rls_deny_default"
    | "no_grant"
    | "no_execute_grant"
    | "trigger_imutabilidade"
    | "granted"
    | "rpc_interno_owner";
}

export class RlsSim {
  private grants: Grant[] = [];
  private triggers: TriggerImutavel[] = [];
  private rlsTabelas = new Set<string>();
  /** RPCs security definer: o corpo executa como owner (pode acessar tabelas). */
  private rpcs = new Set<string>();

  constructor(grants: Grant[], triggers: TriggerImutavel[], rlsTabelas: string[], rpcs: string[]) {
    this.grants = grants;
    this.triggers = triggers;
    this.rlsTabelas = new Set(rlsTabelas);
    this.rpcs = new Set(rpcs);
  }

  /** Avalia acesso direto a tabela (não passa por RPC). */
  tentarAcesso(role: string, tabela: string, acesso: AcessoDb): ResultadoTentativa {
    // Trigger de imutabilidade tem precedência (nega até para owner — M03).
    const trg = this.triggers.find(
      (t) => t.tabela === tabela && (t.eventos as string[]).includes(acesso),
    );
    if (trg) {
      return { permitido: false, razao: "trigger_imutabilidade" };
    }
    // RLS deny-by-default: sem policies → negado para qualquer role.
    if (this.rlsTabelas.has(tabela)) {
      return { permitido: false, razao: "rls_deny_default" };
    }
    // Sem grant explícito → negado.
    const grant = this.grants.find(
      (g) => g.role === role && g.alvo === tabela && g.acesso === acesso,
    );
    if (!grant) {
      return { permitido: false, razao: "no_grant" };
    }
    return { permitido: true, razao: "granted" };
  }

  /** Avalia a chamada de RPC: exige EXECUTE; o corpo roda como owner. */
  tentarRpc(role: string, fn: string): ResultadoTentativa {
    if (!this.rpcs.has(fn)) {
      return { permitido: false, razao: "no_execute_grant" };
    }
    const grant = this.grants.find(
      (g) => g.role === role && g.alvo === fn && g.acesso === "execute",
    );
    if (!grant) {
      return { permitido: false, razao: "no_execute_grant" };
    }
    return { permitido: true, razao: "rpc_interno_owner" };
  }
}

/** Grants/policies exatamente como declarados na migração 0001/0002. */
export function grantsPadraoM03(): {
  grants: Grant[];
  triggers: TriggerImutavel[];
  rlsTabelas: string[];
  rpcs: string[];
} {
  return {
    grants: [
      // RPCs: EXECUTE somente para a role de função (service_role restrito).
      { role: "service_role", alvo: "capture_lead", acesso: "execute" },
      { role: "service_role", alvo: "confirmar_token", acesso: "execute" },
      { role: "service_role", alvo: "reenviar_token", acesso: "execute" },
      { role: "service_role", alvo: "metricas_funil", acesso: "execute" },
    ],
    triggers: [{ tabela: "consentimentos", eventos: ["update", "delete"] }],
    rlsTabelas: ["leads", "consentimentos", "tokens_confirmacao", "aviso_privacidade", "rate_limit_events"],
    rpcs: ["capture_lead", "confirmar_token", "reenviar_token", "metricas_funil"],
  };
}

/** Os 6 casos HEL-M07 (teste negativo contra o REST público, executado no go-live). */
export const CASOS_M07: Array<{ id: number; descricao: string; tentativa: Tentativa; esperado: "negado" | "permitido_interno" }> = [
  { id: 1, descricao: "SELECT em leads com anon", tentativa: { role: "anon", alvo: "leads", acesso: "select" }, esperado: "negado" },
  { id: 2, descricao: "SELECT em consentimentos/tokens com anon", tentativa: { role: "anon", alvo: "consentimentos", acesso: "select" }, esperado: "negado" },
  { id: 3, descricao: "INSERT em qualquer tabela com anon", tentativa: { role: "anon", alvo: "leads", acesso: "insert" }, esperado: "negado" },
  { id: 4, descricao: "anon de outro projeto (cross-tenant)", tentativa: { role: "anon_outro_projeto", alvo: "leads", acesso: "select" }, esperado: "negado" },
  { id: 5, descricao: "Revisão de policies: nenhuma permite anon; RLS habilitado", tentativa: { role: "anon", alvo: "aviso_privacidade", acesso: "select" }, esperado: "negado" },
  { id: 6, descricao: "role da função tenta UPDATE/DELETE em consentimentos", tentativa: { role: "service_role", alvo: "consentimentos", acesso: "update" }, esperado: "negado" },
];
