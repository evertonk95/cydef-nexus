/**
 * Filtros da lista de questões na URL (?mostrar= e ?situacao=). Vão junto para a
 * tela da questão, para que "Voltar" caia no mesmo recorte (fase 24).
 */
export function filtrosQuestoes(busca: URLSearchParams): string {
  const f = new URLSearchParams();
  const mostrar = busca.get("mostrar");
  const situacao = busca.get("situacao");
  if (mostrar && mostrar !== "todas") f.set("mostrar", mostrar);
  if (situacao === "rascunho" || situacao === "publicadas") f.set("situacao", situacao);
  return f.toString();
}
