import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SupabaseClient } from "@supabase/supabase-js";
import { painelTeste, renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import { arquivoDados, emailExclusao } from "@/lib/conta";
import Conta from "./Conta";

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

const cert = {
  codigo: "CYD-7F3A-29C1-B84E-0D56",
  curso_slug: "cybersecurity-fundamentals",
  curso_titulo: "Cybersecurity Fundamentals",
  nome: "Ana Souza",
  carga_horaria_h: 6,
  concluido_em: "2026-11-18",
  validacao_publica: true,
};

function abrir(rpcs: Rpcs, sb?: SupabaseClient) {
  return renderizar(
    <ProvedorAvisos>
      <Conta />
    </ProvedorAvisos>,
    { rota: "/conta", caminho: "/conta", sb: sb ?? sbFalso({ painel: painelTeste(), rpcs }) },
  );
}

describe("Minha conta", () => {
  it("corrige o nome e avisa que certificado emitido não muda", async () => {
    let args: Record<string, unknown> | undefined;
    abrir({
      academy_meu_painel: painelTeste(),
      academy_meus_certificados: [],
      academy_atualizar_nome: (a) => {
        args = a;
        return { data: { nome: "Ana Maria Souza" } };
      },
    });
    const nome = await screen.findByLabelText("Nome");
    expect(nome).toHaveValue("Ana Souza");
    expect(screen.getByText(/Certificado já emitido não muda/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar nome" })).toBeDisabled();
    await userEvent.clear(nome);
    await userEvent.type(nome, "Ana Maria Souza");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nome" }));
    await waitFor(() => expect(args).toEqual({ p_nome: "Ana Maria Souza" }));
    expect(screen.getByText("ana@empresa.com.br")).toBeInTheDocument();
  });

  it("lista certificados e desliga a validação pública", async () => {
    let args: Record<string, unknown> | undefined;
    abrir({
      academy_meu_painel: painelTeste(),
      academy_meus_certificados: [cert],
      academy_validacao_publica: (a) => {
        args = a;
        return { data: [{ ...cert, validacao_publica: false }] };
      },
    });
    const bloco = await screen.findByRole("region", { name: "Certificados" });
    expect(await within(bloco).findByText("CYD-7F3A-29C1-B84E-0D56")).toBeInTheDocument();
    expect(within(bloco).getByRole("link", { name: "Abrir certificado" })).toHaveAttribute("href", "/cursos/cybersecurity-fundamentals/certificado");
    const chave = within(bloco).getByRole("checkbox", { name: /Validação pública ligada/ });
    expect(chave).toBeChecked();
    await userEvent.click(chave);
    await waitFor(() => expect(args).toEqual({ p_codigo: cert.codigo, p_ativa: false }));
    expect(await within(bloco).findByText(/Desligada: a página de validação responde/)).toBeInTheDocument();
    expect(within(bloco).queryByRole("link", { name: /Página de validação/ })).not.toBeInTheDocument();
  });

  it("avisos por e-mail: aula nova começa desligada e liga; certificado chega sempre", async () => {
    let args: Record<string, unknown> | undefined;
    abrir({
      academy_meu_painel: painelTeste(),
      academy_meus_certificados: [],
      academy_meus_avisos: { aula_nova: false, aula_nova_desde: null },
      academy_definir_aviso_aula_nova: (a) => {
        args = a;
        return { data: { aula_nova: true, aula_nova_desde: "2026-11-20T17:00:00Z" } };
      },
    });
    const bloco = await screen.findByRole("region", { name: "Avisos por e-mail" });
    const chave = await within(bloco).findByRole("checkbox", { name: /Avisar quando sair aula nova/ });
    expect(chave).not.toBeChecked();
    expect(within(bloco).getByText(/certificado emitido chega sempre/)).toBeInTheDocument();
    await userEvent.click(chave);
    await waitFor(() => expect(args).toEqual({ p_ligado: true }));
    expect(await within(bloco).findByText(/Ligado desde 20 de novembro de 2026/)).toBeInTheDocument();
  });

  it("antes da migração 0028, o bloco de avisos não aparece", async () => {
    abrir({
      academy_meu_painel: painelTeste(),
      academy_meus_certificados: [],
      academy_meus_avisos: () => ({ error: { message: "Could not find the function public.academy_meus_avisos" } }),
    });
    await screen.findByRole("region", { name: "Certificados" });
    await waitFor(() => expect(screen.queryByRole("region", { name: "Avisos por e-mail" })).not.toBeInTheDocument());
  });

  it("sem certificado, explica quando ele aparece", async () => {
    abrir({ academy_meu_painel: painelTeste(), academy_meus_certificados: [] });
    expect(await screen.findByText(/Você ainda não tem certificado/)).toBeInTheDocument();
  });

  it("baixa a cópia dos dados em JSON", async () => {
    const dados = { conta: { nome: "Ana Souza", email: "ana@empresa.com.br" } };
    const criar = vi.fn<(b: Blob) => string>(() => "blob:dados");
    Object.assign(URL, { createObjectURL: criar, revokeObjectURL: vi.fn() });
    const clique = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    abrir({ academy_meu_painel: painelTeste(), academy_meus_certificados: [], academy_meus_dados: dados });
    await userEvent.click(await screen.findByRole("button", { name: /Baixar meus dados/ }));
    await waitFor(() => expect(clique).toHaveBeenCalled());
    const blob = criar.mock.calls[0]![0];
    expect(blob.type).toBe("application/json");
    expect(JSON.parse(await blob.text())).toEqual(dados);
    clique.mockRestore();
  });

  it("pedido de exclusão vai por e-mail para o canal do aviso, com o assunto certo", async () => {
    abrir({ academy_meu_painel: painelTeste(), academy_meus_certificados: [] });
    const link = await screen.findByRole("link", { name: /Pedir a exclusão por e-mail/ });
    const href = link.getAttribute("href")!;
    expect(href.startsWith("mailto:contato@cydef.com.br?")).toBe(true);
    const p = new URLSearchParams(href.split("?")[1]);
    expect(p.get("subject")).toBe("LGPD: Solicitação de titular");
    expect(p.get("body")).toContain("E-mail da conta: ana@empresa.com.br");
    expect(screen.getByText(/responde em até 15 dias/)).toBeInTheDocument();
  });

  it("sair de todos os dispositivos pede confirmação e encerra a sessão global", async () => {
    const signOut = vi.fn(() => Promise.resolve({ error: null }));
    const sb = sbFalso({ painel: painelTeste(), rpcs: { academy_meus_certificados: [] } });
    (sb as unknown as { auth: { signOut: typeof signOut } }).auth.signOut = signOut;
    abrir({}, sb);
    await userEvent.click(await screen.findByRole("button", { name: /Sair de todos os dispositivos/ }));
    await userEvent.click(screen.getByRole("button", { name: /Sair de todos agora/ }));
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ scope: "global" }));
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { container } = abrir({ academy_meu_painel: painelTeste(), academy_meus_certificados: [cert] });
    await screen.findByText("CYD-7F3A-29C1-B84E-0D56");
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("nome e e-mail de exclusão", () => {
    expect(arquivoDados(new Date(2026, 10, 19, 12))).toBe("meus-dados-cydef-academy-2026-11-19.json");
    expect(emailExclusao("a@b.com").startsWith("mailto:contato@cydef.com.br?subject=")).toBe(true);
  });
});
