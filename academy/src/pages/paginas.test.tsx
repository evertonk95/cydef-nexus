import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Painel from "./Painel";
import MeusCursos from "./MeusCursos";
import Entrar from "./Entrar";
import { cursoDetalheTeste, painelTeste, renderizar, sbFalso } from "@/test/utilidades";
import { saudacao } from "@/lib/formato";
import { violacoesGraves } from "@/test/axe";

vi.mock("@/components/Turnstile", () => ({
  Turnstile: ({ aoToken }: { aoToken: (t: string) => void }) => {
    queueMicrotask(() => aoToken("tok-teste"));
    return <div data-testid="turnstile" />;
  },
}));

describe("Painel do aluno", () => {
  it("mostra o esqueleto e depois os dados reais do aluno", async () => {
    renderizar(<Painel />, { sb: sbFalso({ painel: painelTeste() }) });
    expect(screen.getByLabelText("Carregando o painel")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 1, name: /, Ana\.$/ })).toBeInTheDocument();
    expect(screen.getByText("Você está no Módulo 2 de Fundamentos para SOC.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Aula 05: O que é um SIEM na prática/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar aula" })).toHaveAttribute("href", "/cursos/fundamentos-para-soc/aulas/5");
    expect(screen.getByText("Você parou em 06:52 de 18:00")).toBeInTheDocument();
    expect(screen.getByText("3 dias seguidos")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Competência Triagem de alertas" })).toHaveAttribute("aria-valuenow", "60");
  });

  it("saudação acompanha a hora do aluno", () => {
    expect(saudacao(8)).toBe("Bom dia");
    expect(saudacao(14)).toBe("Boa tarde");
    expect(saudacao(21)).toBe("Boa noite");
    expect(saudacao(2)).toBe("Boa noite");
  });

  it("matriz da formação mostra concluída, você está aqui e módulo a publicar", async () => {
    const painel = painelTeste({ cursos: [{ slug: "fundamentos-para-soc", titulo: "Fundamentos para SOC", total: 2, concluidas: 1, ultimo_acesso: null }] });
    const sb = sbFalso({ painel, cursos: { "fundamentos-para-soc": cursoDetalheTeste }, progresso: [{ aula_id: "a4", posicao_seg: 900, concluida_em: "2026-11-16T10:00:00Z" }] });
    renderizar(<Painel />, { sb });
    expect(await screen.findByRole("heading", { name: "Formação Analista SOC" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Aula 04: Papéis no SOC, concluída" })).toHaveAttribute("href", "/cursos/fundamentos-para-soc/aulas/4");
    expect(screen.getByRole("link", { name: "Aula 05: O que é um SIEM na prática, você está aqui" })).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("A publicar", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("1 de 2 aulas publicadas concluídas")).toBeInTheDocument();
  });

  it("boletim e competências sem conteúdo ficam fora do painel", async () => {
    renderizar(<Painel />, { sb: sbFalso({ painel: painelTeste({ competencias: [] }), boletim: [] }) });
    expect(await screen.findByRole("heading", { level: 1, name: /, Ana\.$/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Boletim do SOC" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Suas competências" })).not.toBeInTheDocument();
    expect(screen.queryByText("AO VIVO")).not.toBeInTheDocument();
  });

  it("boletim com aviso de ameaça mostra o link externo com aviso de nova aba", async () => {
    const boletim = [{ id: "b1", tipo: "ameaca", titulo: "Campanha de phishing com QR code", link: "https://www.cydef.com.br/blog/x", publicado_em: "2026-11-17T09:00:00Z" }];
    renderizar(<Painel />, { sb: sbFalso({ painel: painelTeste(), boletim }) });
    const link = await screen.findByRole("link", { name: /Ler mais/ });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getAllByText("Campanha de phishing com QR code").length).toBeGreaterThan(0);
  });

  it("sem cursos publicados, o painel avisa sem prometer data", async () => {
    renderizar(<Painel />, { sb: sbFalso({ painel: painelTeste({ continuar: null, cursos: [], formacoes: [], competencias: [], dias_estudo: [] }) }) });
    expect(await screen.findByText(/assim que as primeiras aulas forem publicadas/)).toBeInTheDocument();
    expect(screen.getByText("Comece hoje")).toBeInTheDocument();
  });

  it("login sem cadastro de aluno leva à inscrição", async () => {
    renderizar(<Painel />, { sb: sbFalso({ painel: null }) });
    expect(await screen.findByRole("heading", { name: "Cadastro não encontrado" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fazer a inscrição" })).toHaveAttribute("href", "https://www.cydef.com.br/academy/gratuito");
  });

  it("falha de conexão mostra o erro e permite tentar de novo", async () => {
    renderizar(<Painel />, { sb: sbFalso({ rpcErro: "boom" }) });
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar");
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { container } = renderizar(<Painel />, { sb: sbFalso({ painel: painelTeste(), cursos: { "fundamentos-para-soc": cursoDetalheTeste } }) });
    await screen.findByRole("link", { name: /Papéis no SOC/ });
    expect(await violacoesGraves(container)).toEqual([]);
  });
});

describe("Meus cursos", () => {
  it("lista os cursos com status e progresso", async () => {
    renderizar(<MeusCursos />, { rota: "/cursos", caminho: "/cursos", sb: sbFalso({ painel: painelTeste() }) });
    const soc = (await screen.findByRole("heading", { name: "Fundamentos para SOC" })).closest("article")!;
    expect(within(soc).getByText("Em andamento")).toBeInTheDocument();
    expect(within(soc).getByRole("link", { name: /Continuar/ })).toHaveAttribute("href", "/cursos/fundamentos-para-soc");
    const cf = screen.getByRole("heading", { name: "Cybersecurity Fundamentals" }).closest("article")!;
    expect(within(cf).getByText("Concluído")).toBeInTheDocument();
  });
});

describe("Entrar", () => {
  it("recusa e-mail inválido sem chamar o servidor", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderizar(<Entrar />, { rota: "/entrar", caminho: "/entrar", sessao: null });
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@");
    await userEvent.click(screen.getByRole("button", { name: /Enviar link de acesso/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Digite um e-mail válido");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("envia e mostra a confirmação neutra, sem dizer se o e-mail é de aluno", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ status: "enviado_se_inscrito" }), { status: 202 }));
    renderizar(<Entrar />, { rota: "/entrar", caminho: "/entrar", sessao: null });
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@empresa.com.br");
    await waitFor(() => expect(screen.getByRole("button", { name: /Enviar link de acesso/ })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: /Enviar link de acesso/ }));
    expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeInTheDocument();
    expect(screen.getByText(/tem inscrição na CyDef Academy, o link de acesso chega/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pedir outro link em 5:00" })).toBeDisabled();
    expect(screen.getByText(/Pedir outro link cancela o anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Hotmail e Outlook/)).toBeInTheDocument();
    const [, init] = fetchSpy.mock.calls[0]!;
    const corpo = JSON.parse(String((init as RequestInit).body));
    expect(corpo).toMatchObject({ email: "ana@empresa.com.br", turnstile_token: "tok-teste" });
    expect(corpo).not.toHaveProperty("redirect_to");
    fetchSpy.mockRestore();
  });

  it("muitas tentativas viram mensagem clara", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 429 }));
    renderizar(<Entrar />, { rota: "/entrar", caminho: "/entrar", sessao: null });
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@empresa.com.br");
    await userEvent.click(screen.getByRole("button", { name: /Enviar link de acesso/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Muitas tentativas");
    fetchSpy.mockRestore();
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { container } = renderizar(<Entrar />, { rota: "/entrar", caminho: "/entrar", sessao: null });
    await screen.findByRole("heading", { name: "Entrar na Academy" });
    expect(await violacoesGraves(container)).toEqual([]);
  });
});
