import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PaletaComandos } from "./PaletaComandos";
import { painelTeste, renderizar } from "@/test/utilidades";

const CURSO = {
  slug: "cybersecurity-fundamentals",
  titulo: "Cybersecurity Fundamentals",
  descricao: "Fundamentos.",
  nivel: "iniciante",
  gratuito: true,
  modulos: [
    { id: "m0", ordem: 0, titulo: "Introdução", aulas: [{ id: "a1", ordem: 1, numero: 1, titulo: "Boas-vindas ao curso", resumo: "", duracao_seg: 122 }] },
    { id: "m2", ordem: 2, titulo: "Redes e protocolos essenciais", aulas: [] },
  ],
};

function sbBusca(): SupabaseClient {
  const cadeia = (resultado: unknown) => {
    const c: Record<string, unknown> = {};
    for (const m of ["select", "eq", "in", "order"]) c[m] = () => c;
    c.maybeSingle = () => Promise.resolve(resultado);
    c.then = (ok: (v: unknown) => unknown) => Promise.resolve(resultado).then(ok);
    return c;
  };
  const painel = painelTeste({
    continuar: null,
    cursos: [{ slug: CURSO.slug, titulo: CURSO.titulo, total: 1, concluidas: 1, ultimo_acesso: null }],
  });
  return {
    rpc: () => Promise.resolve({ data: painel, error: null }),
    from: (tabela: string) => {
      if (tabela === "cursos") return cadeia({ data: CURSO, error: null });
      if (tabela === "matriculas") return cadeia({ data: { curso_slug: CURSO.slug }, error: null });
      return cadeia({ data: [], error: null });
    },
    auth: { signOut: () => Promise.resolve({ error: null }) },
  } as unknown as SupabaseClient;
}

describe("busca da Academy", () => {
  it("acha módulo e aula pelo nome, sem depender de acento", async () => {
    renderizar(<PaletaComandos aberta fechar={() => undefined} />, { sb: sbBusca() });
    const campo = screen.getByLabelText("Buscar");
    await screen.findByRole("option", { name: /Cybersecurity Fundamentals/ });

    await userEvent.type(campo, "rede");
    expect(await screen.findByRole("option", { name: /Módulo 2: Redes e protocolos essenciais/ })).toBeInTheDocument();

    await userEvent.clear(campo);
    await userEvent.type(campo, "introducao");
    expect(await screen.findByRole("option", { name: /Introdução/ })).toBeInTheDocument();

    await userEvent.clear(campo);
    await userEvent.type(campo, "boas-vindas");
    expect(await screen.findByRole("option", { name: /Aula 01: Boas-vindas ao curso/ })).toBeInTheDocument();
  });

  it("sem texto, mostra só cursos e páginas; sem resultado, orienta a busca", async () => {
    renderizar(<PaletaComandos aberta fechar={() => undefined} />, { sb: sbBusca() });
    expect(await screen.findByRole("option", { name: /1 de 1 aula$/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Boas-vindas/ })).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Buscar"), "kubernetes");
    expect(await screen.findByText(/Nada encontrado para "kubernetes"/)).toBeInTheDocument();
  });
});
