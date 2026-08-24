import { describe, expect, it } from "vitest";
import {
  validarCaptura,
  validarEmail,
  validarNome,
  validarPerfil,
  validarRequestId,
  honeypotPreenchido,
  normalizarEmail,
} from "./validate";

describe("validarCaptura (S-03 — validação server-side)", () => {
  const base = {
    nome: "Maria Silva",
    email: "  Maria@Exemplo.COM ",
    perfil: "iniciante",
    aceito: true,
    declaracao_idade: true,
  };

  it("aceita payload válido e normaliza e-mail", () => {
    const r = validarCaptura(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.email).toBe("maria@exemplo.com");
      expect(r.data.nome).toBe("Maria Silva");
    }
  });

  it("rejeita nome curto ou longo demais (SEC-002)", () => {
    expect(validarCaptura({ ...base, nome: "A" }).ok).toBe(false);
    expect(validarCaptura({ ...base, nome: "x".repeat(81) }).ok).toBe(false);
  });

  it("rejeita e-mail inválido (formato)", () => {
    expect(validarCaptura({ ...base, email: "sem-arroba" }).ok).toBe(false);
    expect(validarCaptura({ ...base, email: "a@b" }).ok).toBe(false);
    expect(validarCaptura({ ...base, email: "a@b.c" }).ok).toBe(false);
  });

  it("rejeita perfil fora do enum", () => {
    expect(validarCaptura({ ...base, perfil: "hacker" }).ok).toBe(false);
  });

  it("rejeita sem opt-in (SEC-001 — envio sem consentimento falha)", () => {
    const r = validarCaptura({ ...base, aceito: false });
    expect(r).toMatchObject({ ok: false, razao: "sem_consentimento" });
  });

  it("rejeita declaracao_idade ausente ou false (SEC-002)", () => {
    const semIdade = { ...base };
    delete (semIdade as Record<string, unknown>).declaracao_idade;
    expect(validarCaptura(semIdade)).toMatchObject({ ok: false, razao: "sem_declaracao_idade" });
    expect(validarCaptura({ ...base, declaracao_idade: false })).toMatchObject({
      ok: false,
      razao: "sem_declaracao_idade",
    });
  });

  it("rejeita payload não-objeto e null", () => {
    expect(validarCaptura(null).ok).toBe(false);
    expect(validarCaptura("texto").ok).toBe(false);
    expect(validarCaptura(undefined).ok).toBe(false);
  });

  it("ignora campos extras (ex.: versao_aviso) — HEL-M01: contrato sem versão do cliente", () => {
    const comVersao = validarCaptura({ ...base, consentimento: { versao_aviso: "v9999" } });
    expect(comVersao.ok).toBe(true);
  });

  it("não reflete entrada na rejeição (razao genérica)", () => {
    const r = validarCaptura({ ...base, email: "<script>alert(1)</script>sem-arroba" });
    expect(r).toMatchObject({ ok: false, razao: "invalid_payload" });
  });
});

describe("validadores individuais", () => {
  it("normalizarEmail trima e lower-case", () => {
    expect(normalizarEmail("  Foo@BAR.com ")).toBe("foo@bar.com");
  });
  it("validarNome limites", () => {
    expect(validarNome("Jo")).toBe(true); // trim -> "Jo" (2 chars)
    expect(validarNome("J")).toBe(false);
    expect(validarNome("x".repeat(81))).toBe(false);
  });
  it("validarPerfil enum", () => {
    expect(validarPerfil("estudante")).toBe(true);
    expect(validarPerfil("outro")).toBe(true);
    expect(validarPerfil("admin")).toBe(false);
  });
  it("validarRequestId", () => {
    expect(validarRequestId("abc-123")).toBe(true);
    expect(validarRequestId("")).toBe(false);
    expect(validarRequestId("x".repeat(65))).toBe(false);
    expect(validarRequestId(42)).toBe(false);
  });
  it("honeypotPreenchido", () => {
    expect(honeypotPreenchido("")).toBe(false);
    expect(honeypotPreenchido("http://spam")).toBe(true);
    expect(honeypotPreenchido(null)).toBe(false);
  });
});
