import { describe, expect, it, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import i18n, { ensureLang } from "@/i18n";
import { TriagemBot } from "../TriagemBot";
import { expectNoViolations } from "@/test/axe";

/**
 * Bot de triagem + formulário de contato: filtros (não abre formulário),
 * classificação, fallback por e-mail com a flag desligada (nenhum dado na
 * rede), envio com Turnstile e payload sem prioridade vinda do cliente.
 */

function renderBot() {
  return render(
    <MemoryRouter>
      <TriagemBot />
    </MemoryRouter>,
  );
}

async function escolher(user: ReturnType<typeof userEvent.setup>, ...rotulos: RegExp[]) {
  for (const r of rotulos) await user.click(await screen.findByRole("button", { name: r }));
}

describe("TriagemBot", () => {
  beforeAll(async () => {
    await ensureLang("pt");
    await i18n.changeLanguage("pt");
  });

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("começa com a pergunta de motivo e as 7 opções, sem violações de acessibilidade", async () => {
    const { container } = renderBot();
    expect(screen.getByText(/Como a CyDef pode ajudar hoje/)).toBeInTheDocument();
    expect(within(screen.getByRole("group")).getAllByRole("button")).toHaveLength(7);
    await expectNoViolations(container);
  });

  it("filtra demanda pessoal: recusa educada, sem formulário e sem e-mail", async () => {
    const user = userEvent.setup();
    renderBot();
    await escolher(user, /Recuperar conta pessoal/);
    expect(screen.getByText(/não é um serviço que a CyDef presta/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Abrir e-mail/ })).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("filtra vaga e redireciona cursos para a Academy", async () => {
    const user = userEvent.setup();
    renderBot();
    await escolher(user, /Vaga ou currículo/);
    expect(screen.getByText(/Não recebemos currículos/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Recomeçar/ }));
    await escolher(user, /Cursos e CyDef Academy/);
    expect(screen.getByRole("link", { name: /Ir para a CyDef Academy/ })).toBeInTheDocument();
  });

  it("flag desligada: consultoria termina em mailto com a triagem no assunto e nada vai para a rede", async () => {
    vi.stubEnv("VITE_CONTACT_ENABLED", undefined);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    renderBot();
    await escolher(user, /Contratar consultoria/, /SOC e SIEM/, /De 201 a 1.000/, /Imediatamente/);
    const link = screen.getByRole("link", { name: /Abrir e-mail com a triagem/ });
    const href = decodeURIComponent(link.getAttribute("href") ?? "");
    expect(href).toContain("mailto:contato@cydef.com.br");
    expect(href).toContain("[Contratar consultoria] SOC e SIEM · De 201 a 1.000 · Imediatamente");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("incidente ativo mostra orientação de não desligar e não enviar dados sensíveis", async () => {
    const user = userEvent.setup();
    renderBot();
    await escolher(user, /Estamos com um incidente/, /Ativo neste momento/, /Até 50/);
    expect(screen.getByText(/Não envie logs, senhas/)).toBeInTheDocument();
    expect(screen.getByText(/não desligue as máquinas afetadas/)).toBeInTheDocument();
  });

  it("Voltar desfaz a última resposta", async () => {
    const user = userEvent.setup();
    renderBot();
    await escolher(user, /Contratar consultoria/);
    expect(screen.getByText(/Em qual área está a necessidade/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Voltar$/ }));
    expect(screen.getByText(/Como a CyDef pode ajudar hoje/)).toBeInTheDocument();
  });

  describe("formulário ligado", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_CONTACT_ENABLED", "true");
      vi.stubEnv("VITE_CONTACT_API_URL", "https://ref.supabase.co/functions/v1/contato");
      vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "0x4AAAAAAA-teste");
      // Turnstile simulado: entrega o token assim que renderiza.
      vi.stubGlobal("turnstile", {
        render: (_el: HTMLElement, opts: { callback: (t: string) => void }) => {
          setTimeout(() => opts.callback("tok-teste"), 0);
          return "w1";
        },
        remove: () => undefined,
      });
    });

    async function chegarNoFormulario(user: ReturnType<typeof userEvent.setup>) {
      renderBot();
      await escolher(user, /Plataforma CyDef Inora/, /Ver uma demonstração/, /De 51 a 200/);
      await screen.findByLabelText(/Nome completo/);
    }

    async function preencher(user: ReturnType<typeof userEvent.setup>, email = "ana@acme.com.br") {
      await user.type(screen.getByLabelText(/Nome completo/), "Ana Lima");
      await user.type(screen.getByLabelText(/^Cargo/), "Coordenadora de SOC");
      await user.type(screen.getByLabelText(/^Empresa/), "Acme");
      await user.type(screen.getByLabelText(/E-mail corporativo/), email);
      await user.type(screen.getByLabelText(/^Mensagem/), "Queremos ver o Inora com nosso time de 12 analistas.");
      await user.click(screen.getByRole("checkbox"));
    }

    it("valida no cliente: e-mail descartável é recusado sem chamar a API", async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);
      const user = userEvent.setup();
      await chegarNoFormulario(user);
      await preencher(user, "ana@mailinator.com");
      await user.click(screen.getByRole("button", { name: /Enviar para um especialista/ }));
      expect(await screen.findByText(/descartáveis não são aceitos\. Use/)).toBeInTheDocument();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("envia triagem, token e request_id; sem prioridade no payload; mostra protocolo", async () => {
      const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "recebido" }), { status: 202 }));
      vi.stubGlobal("fetch", fetchSpy);
      const user = userEvent.setup();
      await chegarNoFormulario(user);
      await preencher(user);
      await user.click(screen.getByRole("button", { name: /Enviar para um especialista/ }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://ref.supabase.co/functions/v1/contato");
      expect(init.credentials).toBe("omit");
      const body = JSON.parse(init.body);
      expect(body.triagem).toEqual({ motivo: "inora", interesse: "demonstracao", porte: "51_200" });
      expect(body.turnstile_token).toBe("tok-teste");
      expect(body.request_id).toMatch(/^[0-9a-f-]{36}$/);
      expect(body.honeypot).toBe("");
      expect(body).not.toHaveProperty("prioridade");
      expect(await screen.findByText(/Mensagem recebida/)).toBeInTheDocument();
      expect(screen.getByText(/Protocolo/)).toBeInTheDocument();
    });

    it("429 mostra aviso de muitas tentativas", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
      const user = userEvent.setup();
      await chegarNoFormulario(user);
      await preencher(user);
      await user.click(screen.getByRole("button", { name: /Enviar para um especialista/ }));
      expect(await screen.findByText(/Muitas tentativas/)).toBeInTheDocument();
    });
  });
});
