import { describe, expect, it } from "vitest";
import { proximoModuloEmProducao, resumoDoCurso } from "./aula";
import type { CursoDetalhe } from "./cursos";

const aula = (id: string, numero: number, concluida: boolean) => ({ id, ordem: numero, numero, titulo: `Aula ${numero}`, resumo: "", duracao_seg: 120, concluida, posicao_seg: 0 });

const curso = (modulos: Omit<CursoDetalhe["modulos"][number], "resumo">[]): CursoDetalhe => ({
  slug: "c", titulo: "Curso", descricao: "", nivel: "iniciante", gratuito: true, ordem: 1, matriculado: true,
  objetivos: [], publico: "", pre_requisitos: "", instrutores: [],
  modulos: modulos.map((m) => ({ ...m, resumo: "" })),
});

describe("progresso honesto do curso", () => {
  it("curso com módulo sem aula não vira concluído", () => {
    const c = curso([
      { id: "m0", ordem: 0, titulo: "Introdução", aulas: [aula("a1", 1, true)] },
      { id: "m1", ordem: 1, titulo: "Princípios", aulas: [] },
      { id: "m2", ordem: 2, titulo: "Redes", aulas: [] },
    ]);
    const r = resumoDoCurso(c);
    expect(r.texto).toBe("Concluídas: 1 de 1 aula publicada. 2 módulos estão em produção.");
    expect(r.emProducao).toBe(2);
    expect(proximoModuloEmProducao(c, "m0")?.titulo).toBe("Princípios");
  });

  it("curso todo publicado mostra a fração sem falar em produção", () => {
    const c = curso([{ id: "m1", ordem: 1, titulo: "Único", aulas: [aula("a1", 1, true), aula("a2", 2, false)] }]);
    expect(resumoDoCurso(c).texto).toBe("Concluídas: 1 de 2 aulas.");
    expect(proximoModuloEmProducao(c, "m1")).toBeNull();
  });

  it("curso sem nenhuma aula publicada", () => {
    expect(resumoDoCurso(curso([{ id: "m1", ordem: 1, titulo: "Único", aulas: [] }])).texto).toBe("As aulas deste curso estão em produção.");
  });
});
