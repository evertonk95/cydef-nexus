import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { painelTeste, renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import { nascimentoMaximo, preenchidos, paraFormulario, type Perfil } from "@/lib/perfil";
import MeuPerfil from "./MeuPerfil";

const VAZIO: Perfil = {
  nome: "Ana Souza",
  email: "ana@empresa.com.br",
  data_nascimento: null,
  telefone: null,
  cidade: null,
  pais: null,
  empresa: null,
  cargo: null,
  area: null,
  experiencia: null,
  bio: null,
  linkedin: null,
  atualizado_em: null,
};

function abrir(rpcs: NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]) {
  return renderizar(
    <ProvedorAvisos>
      <MeuPerfil />
    </ProvedorAvisos>,
    { rota: "/perfil", caminho: "/perfil", sb: sbFalso({ painel: painelTeste(), rpcs }) },
  );
}

describe("Meu perfil", () => {
  it("mostra o e-mail só para leitura, conta os campos e salva o perfil inteiro", async () => {
    let enviado: Record<string, unknown> | undefined;
    abrir({
      academy_meu_perfil: VAZIO,
      academy_salvar_meu_perfil: (a: Record<string, unknown>) => {
        enviado = a;
        return { data: { ...VAZIO, nome: "Ana Maria Souza", empresa: "Empresa X", area: "seguranca", atualizado_em: "2026-11-21T15:00:00Z" } };
      },
    });
    const nome = await screen.findByLabelText("Nome completo");
    expect(nome).toHaveValue("Ana Souza");
    expect(screen.getByText("ana@empresa.com.br")).toBeInTheDocument();
    expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
    expect(screen.getByText("0 de 10 campos opcionais preenchidos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar perfil" })).toBeDisabled();

    await userEvent.clear(nome);
    await userEvent.type(nome, "Ana Maria Souza");
    await userEvent.type(screen.getByLabelText("Empresa onde trabalha"), "Empresa X");
    await userEvent.selectOptions(screen.getByLabelText("Área de atuação"), "seguranca");
    expect(screen.getByText("2 de 10 campos opcionais preenchidos")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));

    await waitFor(() => expect(enviado).toBeDefined());
    expect(enviado!.p_dados).toMatchObject({ nome: "Ana Maria Souza", empresa: "Empresa X", area: "seguranca", telefone: "", linkedin: "" });
    expect(enviado!.p_dados).not.toHaveProperty("email");
    expect(await screen.findByText("Perfil salvo")).toBeInTheDocument();
  });

  it("mostra a mensagem do banco quando um campo é recusado", async () => {
    abrir({
      academy_meu_perfil: VAZIO,
      academy_salvar_meu_perfil: () => ({ error: { message: "linkedin_invalido" } }),
    });
    await userEvent.type(await screen.findByLabelText("LinkedIn"), "https://www.linkedin.com/in/ana");
    await userEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));
    expect(await screen.findByText(/formato https:\/\/www\.linkedin\.com\/in\/seu-nome/)).toBeInTheDocument();
  });

  it("data de nascimento não passa dos 16 anos de idade", async () => {
    abrir({ academy_meu_perfil: VAZIO });
    expect(await screen.findByLabelText("Data de nascimento")).toHaveAttribute("max", nascimentoMaximo());
    expect(nascimentoMaximo(new Date("2026-11-21T12:00:00Z"))).toBe("2010-11-21");
  });

  it("conta como completo quando os 10 opcionais estão preenchidos", () => {
    const f = paraFormulario({
      ...VAZIO, data_nascimento: "1990-01-01", telefone: "+55 61 99999-0000", cidade: "Brasília", pais: "Brasil", empresa: "X",
      cargo: "Analista", area: "seguranca", experiencia: "1_3", bio: "Oi", linkedin: "https://www.linkedin.com/in/ana",
    });
    expect(preenchidos(f)).toEqual({ feitos: 10, total: 10 });
  });

  it("sem violações graves de acessibilidade", async () => {
    const { container } = abrir({ academy_meu_perfil: VAZIO });
    await screen.findByLabelText("Nome completo");
    expect(await violacoesGraves(container)).toEqual([]);
  });
});
