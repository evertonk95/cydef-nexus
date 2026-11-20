import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import type { Missao as TMissao, Tentativa } from "@/lib/missoes";
import Missao from "./Missao";
import Missoes from "./Missoes";

const base: TMissao = {
  id: "x1", codigo: "MSN-001", slug: "msn-001", titulo: "Triagem de phishing", severidade: "alta", mitre: "MITRE ATT&CK T1566.002",
  briefing: "Segunda-feira, 09:31. Uma colaboradora reportou um e-mail suspeito.", selo: "Caçador de phishing", requisito: "aulas",
  curso: "fundamentos-para-soc", curso_titulo: "Fundamentos para SOC", perguntas_total: 2,
  competencias: [{ slug: "triagem-alertas", titulo: "Triagem de alertas" }],
  situacao: "liberada", aulas_total: 12, aulas_concluidas: 12, melhor_nota: null, aprovada: false, tentativas: 0,
  evidencias: [
    { id: "email", tipo: "email", titulo: "E-mail reportado", dica: "O nome exibido não prova a origem.", conteudo: { de: "Financeiro <f@nortec.example>", para: "ana@nortec.example", assunto: "Boleto em atraso", corpo: "Prezada,\n\nPague hoje.", link_texto: "Visualizar boleto", link_destino: "https://nortec-fin.example/boleto" } },
    { id: "proxy", tipo: "tabela", titulo: "Logs do proxy", dica: "", conteudo: { colunas: ["Hora", "Usuário", "URL"], linhas: [["09:14:37", "m.souza", "nortec-fin.example/boleto"], ["09:15:02", "m.souza", "nortec-fin.example/login.php"]] } },
  ],
  perguntas: [
    { id: "usuario", enunciado: "Quem enviou dados?", dica: "", alternativas: ["a.lima", "m.souza"], multipla: false },
    { id: "acoes", enunciado: "Quais ações?", dica: "Marque todas as que se aplicam.", alternativas: ["Bloquear o domínio", "Desligar o e-mail", "Trocar a senha"], multipla: true },
  ],
  aberta: null, ultima: null, encerramento: "",
};

const tentativa: Tentativa = {
  id: "t1", enviada_em: "2026-11-20T12:07:00Z", acertos: 1, total: 2, nota: 50, aprovado: false, duracao_seg: 425,
  evidencias: ["Logs do proxy · 09:15:02 m.souza nortec-fin.example/login.php"],
  correcao: [
    { id: "usuario", enunciado: "Quem enviou dados?", alternativas: ["a.lima", "m.souza"], escolhidas: [1], corretas: [1], explicacao: "O POST em login.php mostra o envio.", acertou: true },
    { id: "acoes", enunciado: "Quais ações?", alternativas: ["Bloquear o domínio", "Desligar o e-mail", "Trocar a senha"], escolhidas: [0], corretas: [0, 2], explicacao: "Conter a conta também é imediato.", acertou: false },
  ],
  encerramento: "O caso real ainda pediria abrir um incidente.",
  competencias: [{ slug: "triagem-alertas", titulo: "Triagem de alertas", antes: 60, depois: 60 }],
};

function abrir(m: TMissao, rpcs: Record<string, unknown> = {}) {
  return renderizar(
    <Routes>
      <Route path="/missoes/:slug" element={<Missao />} />
    </Routes>,
    { rota: "/missoes/msn-001", caminho: "/*", sb: sbFalso({ rpcs: { academy_missao: m, ...rpcs } as never }) },
  );
}

describe("missão de SOC", () => {
  it("bloqueada mostra o que falta e não mostra evidência", async () => {
    abrir({ ...base, situacao: "aulas_pendentes", aulas_concluidas: 4, evidencias: [], perguntas: [] });
    expect(await screen.findByRole("heading", { name: "Missão ainda bloqueada" })).toBeInTheDocument();
    expect(screen.getByText("Conclua as aulas de Fundamentos para SOC para liberar: 4 de 12.")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("pronta: o tempo só começa ao iniciar", async () => {
    const iniciar = vi.fn(() => ({ data: { iniciada_em: "2026-11-20T12:00:00Z" } }));
    abrir(base, { academy_iniciar_missao: iniciar });
    await userEvent.click(await screen.findByRole("button", { name: "Iniciar investigação" }));
    await waitFor(() => expect(iniciar).toHaveBeenCalled());
    expect(screen.getByText(/Você vai examinar 2 evidências e responder 2 perguntas/)).toBeInTheDocument();
  });

  it("investigação: abas por teclado, fixa linhas e envia respostas e evidências; passa no axe", async () => {
    const enviar = vi.fn<(a: Record<string, unknown>) => { data: unknown }>(() => ({ data: tentativa }));
    const { container } = abrir({ ...base, aberta: { iniciada_em: new Date().toISOString() } }, { academy_enviar_missao: enviar });
    const abas = await screen.findByRole("tablist", { name: "Evidências" });
    const email = within(abas).getByRole("tab", { name: "E-mail reportado" });
    expect(email).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Destino do botão: https://nortec-fin.example/boleto")).toBeInTheDocument();
    email.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(within(abas).getByRole("tab", { name: "Logs do proxy" })).toHaveAttribute("aria-selected", "true");

    await userEvent.click(screen.getByRole("button", { name: "Fixar a linha 09:15:02 m.souza nortec-fin.example/login.php" }));
    expect(screen.getByRole("button", { name: /Tirar Logs do proxy · 09:15:02/ })).toBeInTheDocument();

    const enviarBtn = screen.getByRole("button", { name: "Enviar investigação" });
    expect(enviarBtn).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "m.souza" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Bloquear o domínio" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Trocar a senha" }));
    expect(screen.getByText(/A evidência fixada vai junto/)).toBeInTheDocument();
    expect(await violacoesGraves(container)).toEqual([]);
    await userEvent.click(enviarBtn);
    await waitFor(() => expect(enviar).toHaveBeenCalled());
    expect(enviar.mock.calls[0]![0]).toEqual({
      p_slug: "msn-001",
      p_respostas: { usuario: [1], acoes: [0, 2] },
      p_evidencias: ["Logs do proxy · 09:15:02 m.souza nortec-fin.example/login.php"],
    });
  });

  it("resultado: nota, tempo, competências, explicação e o que faltou marcar", async () => {
    const { container } = abrir({ ...base, ultima: tentativa, melhor_nota: 50, tentativas: 1 });
    expect(await screen.findByRole("heading", { name: "Missão registrada, vale revisar" })).toBeInTheDocument();
    expect(screen.getByText(/Você acertou 1 de 2 perguntas em 07:05 e fixou 1 evidência\./)).toBeInTheDocument();
    expect(screen.getByText("O caso real ainda pediria abrir um incidente.")).toBeInTheDocument();
    const correcao = screen.getByRole("heading", { name: "Correção" }).parentElement!;
    expect(within(correcao).getByText("Conter a conta também é imediato.")).toBeInTheDocument();
    expect(within(correcao).getByText(/resposta certa que faltou/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refazer missão" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Fixar a linha/ })).toBeNull();
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("aprovada mostra o selo", async () => {
    abrir({ ...base, aprovada: true, melhor_nota: 100, ultima: { ...tentativa, nota: 100, acertos: 2, aprovado: true } });
    expect(await screen.findByRole("heading", { name: "Missão concluída" })).toBeInTheDocument();
    expect(screen.getByText("Selo conquistado: Caçador de phishing")).toBeInTheDocument();
  });

  it("lista de missões", async () => {
    renderizar(<Missoes />, {
      rota: "/missoes",
      caminho: "/missoes",
      sb: sbFalso({ rpcs: { academy_minhas_missoes: [{ ...base, situacao: "aulas_pendentes", aulas_concluidas: 3 }, { ...base, id: "x2", codigo: "MSN-002", slug: "msn-002", titulo: "Força bruta", aprovada: true, melhor_nota: 90 }] } as never }),
    });
    expect(await screen.findByRole("link", { name: "Triagem de phishing" })).toHaveAttribute("href", "/missoes/msn-001");
    expect(screen.getByText("Conclua as aulas de Fundamentos para SOC para liberar: 3 de 12.")).toBeInTheDocument();
    expect(screen.getByText("Concluída com 90%, selo Caçador de phishing")).toBeInTheDocument();
  });
});
