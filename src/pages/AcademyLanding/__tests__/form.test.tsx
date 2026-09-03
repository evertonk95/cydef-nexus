import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import i18n from "@/i18n";
import { PreEnrollmentForm } from "../form/PreEnrollmentForm";
import { expectNoViolations } from "@/test/axe";

/**
 * S-03 — formulário de pré-inscrição: estados (initial/submitting/
 * validation-error/server-error/success/rate-limited), opt-in não pré-marcado,
 * honeypot, request_id idempotente, payload sem versão do aviso (M01) e
 * nenhum envio de PII quando desabilitado (S-02).
 */

function renderForm() {
  return render(
    <MemoryRouter>
      <PreEnrollmentForm />
    </MemoryRouter>,
  );
}

describe("PreEnrollmentForm", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("pt"); // textos do formulário em PT (canônico)
  });

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("modo desabilitado (capture off): 'inscrições em breve', sem coleta", () => {
    vi.stubEnv("VITE_CAPTURE_ENABLED", undefined);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    renderForm();
    expect(screen.getByText(/Pré-inscrições em breve/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  describe("modo habilitado", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_CAPTURE_ENABLED", "true");
      vi.stubEnv("VITE_CAPTURE_API_URL", "https://api.cydef.com.br/capture");
    });

    it("renderiza os 3 campos + opt-in + declaração 16+; opt-in NÃO pré-marcado", () => {
      renderForm();
      expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
      expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
      expect(screen.getByLabelText("Seu perfil")).toBeInTheDocument();
      const optin = screen.getByRole("checkbox", { name: /Li e concordo com o Aviso de Privacidade/i });
      expect(optin).not.toBeChecked();
      const idade = screen.getByRole("checkbox", { name: /Declaro que tenho 16 anos ou mais/i });
      expect(idade).not.toBeChecked();
    });

    it("honeypot oculto existe (anti-bot) e não é focado", () => {
      renderForm();
      const hp = document.querySelector<HTMLInputElement>('input[name="website"]');
      expect(hp).not.toBeNull();
      expect(hp?.tabIndex).toBe(-1);
    });

    it("erros inline por campo com aria-describedby e aria-invalid (J1-ERR)", async () => {
      const user = userEvent.setup();
      renderForm();
      await user.click(screen.getByRole("button", { name: /Confirmar pré-inscrição/i }));
      expect(await screen.findByText(/Informe seu nome completo/i)).toBeInTheDocument();
      expect(screen.getByText(/É preciso concordar com o Aviso de Privacidade/i)).toBeInTheDocument();
      const email = screen.getByLabelText("E-mail");
      expect(email).toHaveAttribute("aria-invalid", "true");
      expect(email).toHaveAttribute("aria-describedby");
    });

    it("valores preenchidos preservados após erro (sem perder input — UX v8)", async () => {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText("Nome completo"), "Maria");
      await user.click(screen.getByRole("button", { name: /Confirmar pré-inscrição/i }));
      expect(screen.getByLabelText("Nome completo")).toHaveValue("Maria");
    });

    it("202 → estado de sucesso + beacon preinscricao_submitida (sem PII no payload)", async () => {
      vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
      vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://analytics.cydef.com.br/e");
      const beacon = vi.fn().mockReturnValue(true);
      vi.spyOn(navigator, "sendBeacon").mockImplementation(beacon);

      const fetchSpy = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "pending_confirmation" }), { status: 202 }),
      );
      vi.stubGlobal("fetch", fetchSpy);

      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
      await user.type(screen.getByLabelText("E-mail"), "maria@exemplo.com");
      await user.selectOptions(screen.getByLabelText("Seu perfil"), "iniciante");
      await user.click(screen.getByRole("checkbox", { name: /Li e concordo/i }));
      await user.click(screen.getByRole("checkbox", { name: /Declaro que tenho 16 anos ou mais/i }));
      await user.click(screen.getByRole("button", { name: /Confirmar pré-inscrição/i }));

      expect(await screen.findByText(/Inscrição recebida!/i)).toBeInTheDocument();

      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://api.cydef.com.br/capture");
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      // Contrato HEL-M01: NENHUMA versão do aviso no payload
      expect(body).not.toHaveProperty("versao_aviso");
      expect(body.aceito).toBe(true);
      expect(body.declaracao_idade).toBe(true);
      expect(typeof body.request_id).toBe("string");
      expect(body.honeypot).toBe("");

      // beacon sem PII
      const blob = beacon.mock.calls.find((c) => c[0]?.includes("analytics"))?.[1] as Blob;
      const payload = JSON.parse(await blob.text()) as Record<string, unknown>;
      expect(payload.e).toBe("preinscricao_submitida");
      expect(JSON.stringify(payload)).not.toMatch(/@/);
    });

    it("429 → estado rate-limited com mensagem amigável", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response(JSON.stringify({ erro: "muitas_tentativas" }), { status: 429 })),
      );
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
      await user.type(screen.getByLabelText("E-mail"), "maria@exemplo.com");
      await user.click(screen.getByRole("checkbox", { name: /Li e concordo/i }));
      await user.click(screen.getByRole("checkbox", { name: /Declaro que tenho 16 anos ou mais/i }));
      await user.click(screen.getByRole("button", { name: /Confirmar pré-inscrição/i }));
      expect(await screen.findByText(/Muitas tentativas em pouco tempo/i)).toBeInTheDocument();
    });

    it("erro de servidor → mensagem de recuperação e retry com MESMO request_id (idempotência)", async () => {
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ erro: "servico_indisponivel" }), { status: 503 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ status: "pending_confirmation" }), { status: 202 }),
        );
      vi.stubGlobal("fetch", fetchSpy);
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
      await user.type(screen.getByLabelText("E-mail"), "maria@exemplo.com");
      await user.click(screen.getByRole("checkbox", { name: /Li e concordo/i }));
      await user.click(screen.getByRole("checkbox", { name: /Declaro que tenho 16 anos ou mais/i }));
      await user.click(screen.getByRole("button", { name: /Confirmar pré-inscrição/i }));

      expect(await screen.findByText(/Não foi possível concluir agora/i)).toBeInTheDocument();

      // retry
      await user.click(screen.getByRole("button", { name: /Confirmar pré-inscrição/i }));
      expect(await screen.findByText(/Inscrição recebida!/i)).toBeInTheDocument();

      const body1 = JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body)) as { request_id: string };
      const body2 = JSON.parse(String((fetchSpy.mock.calls[1] as [string, RequestInit])[1].body)) as { request_id: string };
      expect(body1.request_id).toBe(body2.request_id);
    });

    it("sem violações axe no formulário ativo", async () => {
      const { container } = renderForm();
      await expectNoViolations(container);
    });
  });
});
