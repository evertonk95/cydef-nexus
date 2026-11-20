import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import ValidarCertificado from "./ValidarCertificado";

const valido = { codigo: "CYD-7F3A-29C1-B84E-0D56", nome: "Mariana Albuquerque dos Santos", curso: "Cybersecurity Fundamentals", carga_horaria_h: 6, concluido_em: "2026-11-18" };

function abrir(rota: string, validar: (a: Record<string, unknown>) => { data?: unknown; error?: { message: string } }) {
  const chamadas: unknown[] = [];
  const r = renderizar(
    <Routes>
      <Route path="/certificado" element={<ValidarCertificado />} />
      <Route path="/certificado/:codigo" element={<ValidarCertificado />} />
    </Routes>,
    {
      rota,
      caminho: "/*",
      sessao: null,
      sb: sbFalso({
        rpcs: {
          academy_validar_certificado: (a) => {
            chamadas.push(a);
            return validar(a);
          },
        },
      }),
    },
  );
  return { ...r, chamadas };
}

describe("validação pública do certificado", () => {
  it("código válido, sem login, mostra só nome, curso, carga horária e data", async () => {
    const { chamadas } = abrir("/certificado/cyd-7f3a-29c1-b84e-0d56", () => ({ data: valido }));
    expect(await screen.findByText("Certificado válido")).toBeInTheDocument();
    expect(screen.getByText("Mariana Albuquerque dos Santos")).toBeInTheDocument();
    expect(screen.getByText(/com carga horária de 6 horas, em 18 de novembro de 2026/)).toBeInTheDocument();
    expect(chamadas).toEqual([{ p_codigo: "CYD-7F3A-29C1-B84E-0D56" }]);
    expect(screen.queryByText(/nota/i)).not.toBeInTheDocument();
  });

  it("código inexistente ou com validação desativada recebe a mesma resposta", async () => {
    abrir("/certificado/CYD-0000-0000-0000-0000", () => ({ data: null }));
    expect(await screen.findByRole("heading", { name: "Não encontramos este certificado" })).toBeInTheDocument();
    expect(screen.getByText(/desativou a validação pública/)).toBeInTheDocument();
  });

  it("formato inválido não consulta o banco", async () => {
    const { chamadas } = abrir("/certificado/qualquer-coisa", () => ({ data: valido }));
    expect(await screen.findByText(/não está no formato dos códigos/)).toBeInTheDocument();
    expect(chamadas).toEqual([]);
  });

  it("formulário normaliza o código e abre a validação", async () => {
    const { chamadas } = abrir("/certificado", () => ({ data: valido }));
    await userEvent.type(screen.getByLabelText("Código de validação"), "7f3a 29c1 b84e 0d56");
    await userEvent.click(screen.getByRole("button", { name: "Validar" }));
    expect(await screen.findByText("Certificado válido")).toBeInTheDocument();
    expect(chamadas).toEqual([{ p_codigo: "CYD-7F3A-29C1-B84E-0D56" }]);
  });

  it("código digitado errado mostra a ajuda no campo", async () => {
    abrir("/certificado", () => ({ data: valido }));
    await userEvent.type(screen.getByLabelText("Código de validação"), "123");
    await userEvent.click(screen.getByRole("button", { name: "Validar" }));
    expect(screen.getByText(/CYD e mais 16 letras e números/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Código de validação")).toHaveAttribute("aria-invalid", "true"));
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { container } = abrir("/certificado/CYD-7F3A-29C1-B84E-0D56", () => ({ data: valido }));
    await screen.findByText("Certificado válido");
    expect(await violacoesGraves(container)).toEqual([]);
  });
});
