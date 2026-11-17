import { useQuery } from "@tanstack/react-query";
import { usePortal } from "./portal";
import { buscarBoletim, buscarPainel } from "./painel";
import { buscarCurso } from "./cursos";

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
