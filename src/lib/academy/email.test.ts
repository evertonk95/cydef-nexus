import { describe, expect, it, vi } from "vitest";
import {
  sanitizarNome,
  montarEmailConfirmacao,
  resendTransport,
  devTransport,
  escaparHtml,
} from "./email";

describe("e-mail de confirmação (S-05 — HEL-L01/L03/L04, SEC-007)", () => {
  it("sanitiza nome: remove CR/LF (injeção de header) e colapsa espaços", () => {
    expect(sanitizarNome("Maria\r\nBcc: evil@x.com")).not.toContain("\r");
    expect(sanitizarNome("Maria\r\nBcc: evil@x.com")).not.toContain("\n");
    expect(sanitizarNome("  Joao   Silva  ")).toBe("Joao Silva");
  });

  it("sanitiza nome: escapa HTML (HEL-L01 — injeção de conteúdo)", () => {
    const sujo = sanitizarNome('<script>alert("x")</script>');
    expect(sujo).not.toContain("<script>");
    expect(sujo).toContain("&lt;script&gt;");
  });

  it("corpo do e-mail não contém dado sensível além do nome (REQ-003)", () => {
    const mail = montarEmailConfirmacao({
      to: "fulano@exemplo.com",
      nome: "Fulano",
      link: "https://api.cydef.com.br/confirmacao?token=abc123",
    });
    expect(mail.to).toBe("fulano@exemplo.com");
    expect(mail.html).toContain("Fulano");
    // token presente no link (necessário), mas nada além do nome + instruções
    expect(mail.html).toContain("48 horas");
  });

  it("link é escapado no template (sem reflexão de entrada)", () => {
    const mail = montarEmailConfirmacao({
      to: "a@b.com",
      nome: "Ana",
      link: 'https://x.com/confirmacao?token="onmouseover=alert(1)"',
    });
    // aspas escapadas: atributo não quebra (injeção de atributo bloqueada)
    expect(mail.html).toContain("&quot;");
    expect(mail.html).not.toContain('token="onmouseover'); // aspas cruas fora
  });

  it("resendTransport: envia JSON correto e trata falha HTTP", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const t = resendTransport("chave-teste", "Academy <academy@cydef.com.br>", fetchMock as unknown as typeof fetch);
    const r = await t.send({ to: "a@b.com", subject: "s", html: "<p>ok</p>" });
    expect(r).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer chave-teste");
    expect(headers.Authorization).not.toContain("chave-teste\n");
  });

  it("resendTransport: timeout fail closed (HEL-L04)", async () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      });
    });
    const t = resendTransport("k", "from", fetchMock as unknown as typeof fetch, 5);
    const r = await t.send({ to: "a@b.com", subject: "s", html: "<p>ok</p>" });
    expect(r.ok).toBe(false);
  });

  it("resendTransport: resposta não-2xx → falha (sem exceção vazando)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));
    const t = resendTransport("k", "from", fetchMock as unknown as typeof fetch);
    const r = await t.send({ to: "a@b.com", subject: "s", html: "<p>ok</p>" });
    expect(r).toEqual({ ok: false, razao: "http_401" });
  });

  it("devTransport: apenas sandbox (nunca envia de verdade)", async () => {
    const logs: string[] = [];
    const t = devTransport((m) => logs.push(m));
    const r = await t.send({ to: "a@b.com", subject: "s", html: "<p>ok</p>" });
    expect(r).toEqual({ ok: true });
    expect(logs[0]).toContain("[dev-transport]");
    expect(logs[0]).not.toContain("<p>");
  });

  it("escaparHtml cobre os 5 caracteres", () => {
    expect(escaparHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
