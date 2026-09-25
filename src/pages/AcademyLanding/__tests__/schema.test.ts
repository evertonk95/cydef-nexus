import { describe, expect, it } from "vitest";
import { buildPreEnrollmentSchema, PERFIL_VALUES } from "../form/schema";

/**
 * Migração zod 3 → 4 (PR do Dependabot #77): `errorMap` foi removido no zod 4.
 * Este teste fixa o contrato das mensagens localizadas por campo, que antes
 * vinham de `errorMap` no enum `perfil` e nos booleanos `aceito` e
 * `declaracao_idade`. O `t` é substituído pela própria chave: o alvo é provar
 * que a mensagem configurada é a que sai no `issue`, não traduzir de novo.
 */
const t = (key: string) => key;
const schema = buildPreEnrollmentSchema(t);

const valido = {
  nome: "Maria Silva",
  email: "maria@exemplo.com",
  perfil: "iniciante",
  aceito: true,
  declaracao_idade: true,
};

const mensagemDe = (resultado: ReturnType<typeof schema.safeParse>, campo: string) => {
  if (resultado.success) throw new Error("esperava falha de validação em " + campo);
  return resultado.error.issues.find((i) => i.path[0] === campo)?.message;
};

describe("schema de pré-inscrição (zod 4)", () => {
  it("aceita o payload válido", () => {
    expect(schema.safeParse(valido).success).toBe(true);
  });

  it("aceita todos os perfis da lista", () => {
    for (const perfil of PERFIL_VALUES) {
      expect(schema.safeParse({ ...valido, perfil }).success).toBe(true);
    }
  });

  it("perfil fora da lista: mensagem localizada do enum", () => {
    expect(mensagemDe(schema.safeParse({ ...valido, perfil: "invalido" }), "perfil")).toBe(
      "form.errors.perfilReq",
    );
  });

  it("opt-in de privacidade falso: mensagem de consentimento", () => {
    expect(mensagemDe(schema.safeParse({ ...valido, aceito: false }), "aceito")).toBe(
      "form.errors.aceitoReq",
    );
  });

  it("declaração de idade falsa: mensagem de idade", () => {
    expect(
      mensagemDe(schema.safeParse({ ...valido, declaracao_idade: false }), "declaracao_idade"),
    ).toBe("form.errors.idadeReq");
  });

  it("nome curto: mensagem de tamanho mínimo", () => {
    expect(mensagemDe(schema.safeParse({ ...valido, nome: "M" }), "nome")).toBe(
      "form.errors.nomeMin",
    );
  });

  it("e-mail inválido: mensagem de formato", () => {
    expect(mensagemDe(schema.safeParse({ ...valido, email: "sem-arroba" }), "email")).toBe(
      "form.errors.emailInvalid",
    );
  });

  it("todos os campos errados saem juntos, um por campo", () => {
    const r = schema.safeParse({
      nome: "",
      email: "",
      perfil: "invalido",
      aceito: false,
      declaracao_idade: false,
    });
    if (r.success) throw new Error("esperava falha");
    const campos = new Set(r.error.issues.map((i) => i.path[0]));
    expect([...campos].sort()).toEqual(["aceito", "declaracao_idade", "email", "nome", "perfil"]);
  });
});
