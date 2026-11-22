import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePortal } from "@/lib/portal";
import { chamar } from "@/lib/instrutor";
import { baixarMaterial, type MaterialAluno } from "@/lib/materiais";
import type { CursoDetalhe } from "@/lib/cursos";

/**
 * Material complementar aprovado do curso, para o aluno matriculado, com o
 * check do download. Uma consulta só, usada na lista do fim da página, no
 * bloco de cada módulo e na tela de questões.
 */
export function useMateriaisCurso(curso: Pick<CursoDetalhe, "slug" | "matriculado"> | null | undefined) {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["materiais", curso?.slug, sessao?.user.id],
    queryFn: () => chamar<MaterialAluno[]>(sb, "academy_materiais_curso", { p_curso: curso!.slug }),
    enabled: Boolean(sessao && curso?.matriculado),
    retry: false,
    staleTime: 60_000,
  });
}

/** Baixar um material: registra, abre o link e atualiza o check e as questões. */
export function useBaixarMaterial(slug: string) {
  const { sb } = usePortal();
  const cliente = useQueryClient();
  const [baixando, setBaixando] = useState<string | null>(null);
  const [erro, setErro] = useState(false);
  const baixar = useCallback(
    async (m: MaterialAluno) => {
      setBaixando(m.id);
      setErro(false);
      try {
        const url = await baixarMaterial(sb, m);
        await Promise.all([
          cliente.invalidateQueries({ queryKey: ["materiais", slug] }),
          cliente.invalidateQueries({ queryKey: ["questoes-modulo"] }),
        ]);
        window.location.assign(url);
      } catch {
        setErro(true);
      } finally {
        setBaixando(null);
      }
    },
    [sb, cliente, slug],
  );
  return { baixar, baixando, erro };
}
