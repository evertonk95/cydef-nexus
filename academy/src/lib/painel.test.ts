import { describe, expect, it } from "vitest";
import { mapaDeEstudo, sequenciaAtual, somarDias } from "./painel";
import { duracao, iniciais, percentual, primeiroNome, relogio } from "./formato";
import { lerConfig } from "./config";
import { emailValido } from "./acesso";
import { lerRetorno } from "./retorno";

describe("sequência e mapa de estudo", () => {
  it("conta dias seguidos terminando hoje", () => {
    expect(sequenciaAtual(["2026-11-15", "2026-11-16", "2026-11-17"], "2026-11-17")).toBe(3);
  });
  it("aceita que hoje ainda não teve estudo (vale até ontem)", () => {
    expect(sequenciaAtual(["2026-11-15", "2026-11-16"], "2026-11-17")).toBe(2);
  });
  it("quebra a sequência quando falta um dia", () => {
    expect(sequenciaAtual(["2026-11-13", "2026-11-15", "2026-11-16"], "2026-11-17")).toBe(2);
    expect(sequenciaAtual(["2026-11-10"], "2026-11-17")).toBe(0);
  });
  it("atravessa a virada do mês e do ano", () => {
    expect(somarDias("2026-01-01", -1)).toBe("2025-12-31");
    expect(sequenciaAtual(["2025-12-31", "2026-01-01"], "2026-01-01")).toBe(2);
  });
  it("monta 12 colunas de 7 dias, com hoje na última coluna e dias futuros marcados", () => {
    const m = mapaDeEstudo(["2026-11-17"], "2026-11-17");
    expect(m.length).toBe(12);
    expect(m.every((c) => c.length === 7)).toBe(true);
    const ultima = m[11]!;
    expect(ultima.some((c) => c.dia === "2026-11-17" && c.estudou)).toBe(true);
    expect(ultima.filter((c) => c.futuro).length).toBe(4); // 17/11/2026 é terça
  });
});

describe("formatos", () => {
  it("formata duração, relógio, percentual e nomes", () => {
    expect(duracao(1080)).toBe("18 min");
    expect(duracao(5400)).toBe("1h 30min");
    expect(relogio(412)).toBe("06:52");
    expect(percentual(4, 12)).toBe(33);
    expect(percentual(1, 0)).toBe(0);
    expect(primeiroNome("  Ana Souza ")).toBe("Ana");
    expect(iniciais("Everton Igor Lima do Nascimento")).toBe("EN");
  });
});

describe("configuração", () => {
  const ok = {
    VITE_SUPABASE_URL: "https://p.supabase.co",
    VITE_SUPABASE_ANON_KEY: "k",
    VITE_ACESSO_API_URL: "https://p.supabase.co/functions/v1/academy-acesso",
    VITE_TURNSTILE_SITE_KEY: "s",
  };
  it("lê a configuração completa", () => {
    expect(lerConfig(ok).siteUrl).toBe("https://www.cydef.com.br");
  });
  it("recusa configuração incompleta ou URL sem https", () => {
    expect(() => lerConfig({ ...ok, VITE_SUPABASE_ANON_KEY: "" })).toThrow(/VITE_SUPABASE_ANON_KEY/);
    expect(() => lerConfig({ ...ok, VITE_ACESSO_API_URL: "http://evil.example" })).toThrow(/insegura/);
  });
});

describe("acesso e retorno do link", () => {
  it("valida e-mail", () => {
    expect(emailValido("ana@empresa.com.br")).toBe(true);
    expect(emailValido("ana@")).toBe(false);
    expect(emailValido("a".repeat(250) + "@x.com")).toBe(false);
  });
  it("lê o fragmento do link: sessão, erro ou nada", () => {
    expect(lerRetorno("#access_token=abc&type=magiclink")).toEqual({ tipo: "sessao" });
    expect(lerRetorno("#error=access_denied&error_code=otp_expired")).toEqual({ tipo: "erro", codigo: "otp_expired" });
    expect(lerRetorno("#error_code=<script>")).toEqual({ tipo: "erro", codigo: "script" });
    expect(lerRetorno("")).toEqual({ tipo: "nenhum" });
  });
});
