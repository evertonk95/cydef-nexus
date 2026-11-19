import { useQueries, useQuery } from "@tanstack/react-query";
import { usePortal } from "./portal";
import { buscarBoletim, buscarPainel } from "./painel";
import { buscarCurso, type CursoDetalhe } from "./cursos";
import { buscarSituacao } from "./avaliacao";

export function usePainel() {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["painel", sessao?.user.id],
    queryFn: () => buscarPainel(sb),
    enabled: Boolean(sessao),
    staleTime: 30_000,
  });
}

export function useBoletim() {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["boletim", sessao?.user.id],
    queryFn: () => buscarBoletim(sb),
    enabled: Boolean(sessao),
    staleTime: 60_000,
  });
}

export function useCurso(slug: string) {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["curso", slug, sessao?.user.id],
    queryFn: () => buscarCurso(sb, slug, sessao!.user.id),
    enabled: Boolean(sessao && slug),
  });
}

/** Une os resultados em uma lista só, fora do hook para manter a referência estável. */
function combinarCursos(r: { data?: CursoDetalhe | null; isPending: boolean }[]) {
  return {
    cursos: r.map((q) => q.data).filter((c): c is CursoDetalhe => Boolean(c)),
    carregando: r.some((q) => q.isPending),
  };
}

/**
 * Detalhe (módulos e aulas) de cada curso do aluno. Usa a mesma chave de
 * useCurso, então reaproveita o cache de quem já abriu o curso.
 */
export function useCursosDetalhados(slugs: string[]) {
  const { sb, sessao } = usePortal();
  return useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ["curso", slug, sessao?.user.id],
      queryFn: () => buscarCurso(sb, slug, sessao!.user.id),
      enabled: Boolean(sessao),
    })),
    combine: combinarCursos,
  });
}

/**
 * Questões, avaliação final e certificado do curso para o aluno. Nas telas do
 * curso e da aula é complementar: se falhar, a sala de aula segue normal.
 */
export function useSituacao(slug: string, ativo = true) {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["situacao", slug, sessao?.user.id],
    queryFn: () => buscarSituacao(sb, slug),
    enabled: Boolean(sessao && slug && ativo),
    staleTime: 15_000,
    retry: false,
  });
}
