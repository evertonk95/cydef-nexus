import { describe, expect, it } from "vitest";
import { validarContato, emailDescartavel, emailPessoal, contarLinks, contemInvisiveis, tempoPreenchimentoValido } from "./validate";
import { validarTriagem, calcularPrioridade, motivoAbreFormulario } from "./triagem";
import { montarEmailInterno, neutralizarLinks, linhaSegura } from "./email";
import { hmacHex } from "./hash";

const base = {
  nome: "João D'Ávila",
  cargo: "CISO",
  empresa: "Banco Exemplo S.A.",
  email: "joao@bancoexemplo.com.br",
  mensagem: "Precisamos de apoio para revisar regras de detecção no SIEM.",
  aceito: true,
  triagem: { motivo: "consultoria", area: "soc_siem", porte: "mais_1000", prazo: "imediato" },
};

describe("validarTriagem (listas fechadas)", () => {
  it("aceita combinações completas por motivo", () => {
    expect(validarTriagem(base.triagem)).toEqual(base.triagem);
    expect(validarTriagem({ motivo: "incidente", urgencia: "contido", porte: "51_200" })).not.toBeNull();
    expect(validarTriagem({ motivo: "inora", interesse: "demonstracao", porte: "ate_50" })).not.toBeNull();
    expect(validarTriagem({ motivo: "parceria" })).not.toBeNull();
  });

  it("rejeita motivo que não abre formulário, campo faltando, sobrando ou fora da lista", () => {
    expect(validarTriagem({ motivo: "pessoal" })).toBeNull();
    expect(validarTriagem({ motivo: "consultoria", area: "soc_siem" })).toBeNull();
    expect(validarTriagem({ ...base.triagem, extra: "x" })).toBeNull();
    expect(validarTriagem({ ...base.triagem, area: "hackear_instagram" })).toBeNull();
    expect(validarTriagem([])).toBeNull();
    expect(validarTriagem("consultoria")).toBeNull();
  });

  it("motivos de filtro não abrem formulário", () => {
    expect(motivoAbreFormulario("academy")).toBe(false);
    expect(motivoAbreFormulario("pessoal")).toBe(false);
    expect(motivoAbreFormulario("vaga")).toBe(false);
    expect(motivoAbreFormulario("incidente")).toBe(true);
  });

  it("prioridade calculada", () => {
    expect(calcularPrioridade({ motivo: "incidente", urgencia: "ativo_agora", porte: "ate_50" })).toBe("P1");
    expect(calcularPrioridade({ motivo: "incidente", urgencia: "suspeita", porte: "ate_50" })).toBe("P2");
    expect(calcularPrioridade({ motivo: "consultoria", area: "governanca", porte: "ate_50", prazo: "imediato" })).toBe("P2");
    expect(calcularPrioridade({ motivo: "consultoria", area: "governanca", porte: "51_200", prazo: "planejando" })).toBe("P3");
    expect(calcularPrioridade({ motivo: "parceria" })).toBe("P3");
  });
});

describe("validarContato", () => {
  it("aceita payload válido e normaliza", () => {
    const r = validarContato({ ...base, email: "  JOAO@BancoExemplo.com.br ", nome: "  João   D'Ávila " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.email).toBe("joao@bancoexemplo.com.br");
      expect(r.data.nome).toBe("João D'Ávila");
      expect(r.data.emailPessoal).toBe(false);
    }
  });

  it("sinaliza webmail pessoal sem bloquear", () => {
    const r = validarContato({ ...base, email: "joao@gmail.com" });
    expect(r.ok && r.data.emailPessoal).toBe(true);
  });

  it.each([
    ["nome com número", { nome: "Joao123" }],
    ["nome com e-mail", { nome: "a@b.com" }],
    ["nome com quebra de linha", { nome: "Ana\nBcc: x@y.com" }],
    ["cargo com link", { cargo: "https://spam.com" }],
    ["empresa curta", { empresa: "A" }],
    ["empresa com caractere bidi", { empresa: "Acme\u202Egnp.exe" }],
    ["mensagem curta", { mensagem: "oi" }],
    ["mensagem com zero-width", { mensagem: "Mensagem com caractere\u200B escondido no meio do texto." }],
    ["mensagem com tag HTML", { mensagem: "Olá <img src=x onerror=alert(1)> preciso de ajuda" }],
    ["mensagem longa", { mensagem: "a".repeat(2001) }],
    ["e-mail inválido", { email: "joao@" }],
    ["sem consentimento", { aceito: "true" }],
  ])("rejeita: %s", (_n, over) => {
    expect(validarContato({ ...base, ...over }).ok).toBe(false);
  });

  it("aceita '<' fora de tag (ex.: comparação numérica)", () => {
    expect(validarContato({ ...base, mensagem: "Temos < 50 servidores e > 10 firewalls hoje." }).ok).toBe(true);
  });

  it("e-mail descartável e subdomínio", () => {
    expect(emailDescartavel("a@yopmail.com")).toBe(true);
    expect(emailDescartavel("a@x.mailinator.com")).toBe(true);
    expect(emailDescartavel("a@acme.com")).toBe(false);
    expect(emailPessoal("a@outlook.com.br")).toBe(true);
  });

  it("utilitários", () => {
    expect(contarLinks("a https://x.com b www.y.com c")).toBe(2);
    expect(contemInvisiveis("ok")).toBe(false);
    expect(contemInvisiveis("o\u0007k")).toBe(true);
    expect(tempoPreenchimentoValido(10_000)).toBe(true);
    expect(tempoPreenchimentoValido(100)).toBe(false);
    expect(tempoPreenchimentoValido("10000")).toBe(false);
  });
});

describe("e-mail interno", () => {
  it("escapa HTML, remove CRLF do assunto e neutraliza links", () => {
    const r = validarContato({ ...base, mensagem: "Veja https://evil.com/x?a=1 & www.foo.org agora mesmo" });
    if (!r.ok) throw new Error("payload deveria ser válido");
    const mail = montarEmailInterno({ to: "t@cydef.com.br", contato: r.data, prioridade: "P2", requestId: "id", recebidoEm: "2026-11-16T12:00:00Z" });
    expect(mail.html).toContain("&amp;");
    expect(mail.text).toContain("hxxps://evil[.]com/x?a=1");
    expect(mail.text).toContain("www[.]foo[.]org");
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.replyTo).toBe("joao@bancoexemplo.com.br");
  });

  it("linhaSegura e neutralizarLinks", () => {
    expect(linhaSegura("a\r\nBcc: x")).toBe("a Bcc: x");
    expect(neutralizarLinks("http://a.b.c/d")).toBe("hxxp://a[.]b[.]c/d");
  });

  it("hmacHex é determinístico e depende do pepper", async () => {
    const a = await hmacHex("k1", "v");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hmacHex("k1", "v")).toBe(a);
    expect(await hmacHex("k2", "v")).not.toBe(a);
  });
});
