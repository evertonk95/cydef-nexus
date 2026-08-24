import { describe, expect, it } from "vitest";
import { RlsSim, grantsPadraoM03, CASOS_M07 } from "./rls-sim";

/**
 * S-01 (spike) — simulação LOCAL do padrão RLS deny-by-default (HEL-M03/M07).
 * Sem Postgres local nem conta Supabase (sem autorização): este modelo reflete
 * exatamente os grants/policies da migração supabase/migrations/0001_init.sql.
 * O GATE REAL é o script scripts/rls-negative-test.mjs contra o REST público
 * do provedor (executado no go-live — blocked por autorização).
 */
describe("simulação RLS deny-by-default (M03/M07)", () => {
  const { grants, triggers, rlsTabelas, rpcs } = grantsPadraoM03();
  const sim = new RlsSim(grants, triggers, rlsTabelas, rpcs);

  it("todos os 6 casos HEL-M07 são negados na simulação", () => {
    for (const caso of CASOS_M07) {
      const r = sim.tentarAcesso(caso.tentativa.role, caso.tentativa.alvo, caso.tentativa.acesso);
      expect(r.permitido, `caso ${caso.id}: ${caso.descricao}`).toBe(false);
      expect(r.razao).not.toBe("granted");
    }
  });

  it("anon não tem nenhum grant de tabela (zero grants — M03)", () => {
    const tentativas: Array<["anon", string, "select" | "insert" | "update" | "delete"]> = [
      ["anon", "leads", "select"],
      ["anon", "leads", "insert"],
      ["anon", "consentimentos", "select"],
      ["anon", "tokens_confirmacao", "select"],
      ["anon", "aviso_privacidade", "select"],
      ["anon", "rate_limit_events", "select"],
    ];
    for (const [role, alvo, acesso] of tentativas) {
      expect(sim.tentarAcesso(role, alvo, acesso).permitido, `${role} ${acesso} ${alvo}`).toBe(false);
    }
  });

  it("authenticated também não acessa tabelas", () => {
    expect(sim.tentarAcesso("authenticated", "leads", "select").permitido).toBe(false);
    expect(sim.tentarAcesso("authenticated", "consentimentos", "insert").permitido).toBe(false);
  });

  it("service_role (role de função) NÃO tem DML direto em tabelas (M03)", () => {
    expect(sim.tentarAcesso("service_role", "leads", "select").permitido).toBe(false);
    expect(sim.tentarAcesso("service_role", "leads", "insert").permitido).toBe(false);
  });

  it("caso 6: UPDATE/DELETE em consentimentos negado pelo trigger (mesmo p/ role de função)", () => {
    expect(sim.tentarAcesso("service_role", "consentimentos", "update").razao).toBe("trigger_imutabilidade");
    expect(sim.tentarAcesso("service_role", "consentimentos", "delete").razao).toBe("trigger_imutabilidade");
    expect(sim.tentarAcesso("postgres_owner", "consentimentos", "update").razao).toBe("trigger_imutabilidade");
  });

  it("RPC security definer: EXECUTE apenas para service_role (M03)", () => {
    expect(sim.tentarRpc("service_role", "capture_lead").permitido).toBe(true);
    expect(sim.tentarRpc("service_role", "confirmar_token").permitido).toBe(true);
    // anon/authenticated não podem chamar as RPCs (superfície REST fechada)
    expect(sim.tentarRpc("anon", "capture_lead").permitido).toBe(false);
    expect(sim.tentarRpc("authenticated", "capture_lead").permitido).toBe(false);
    // função inexistente não é executável
    expect(sim.tentarRpc("service_role", "drop_all").permitido).toBe(false);
  });

  it("RLS habilitado (deny-by-default) em todas as tabelas", () => {
    for (const t of ["leads", "consentimentos", "tokens_confirmacao", "aviso_privacidade", "rate_limit_events"]) {
      expect(rlsTabelas).toContain(t);
    }
  });

  it("o padrão continua negando em cenário cross-tenant (anon de outro projeto)", () => {
    expect(sim.tentarAcesso("anon_outro_projeto", "leads", "select").permitido).toBe(false);
  });
});
