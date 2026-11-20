import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { chamar } from "@/lib/instrutor";
import { linkDownload, tamanhoLegivel, TIPOS, type MaterialAluno } from "@/lib/materiais";
import { rotuloModulo } from "@/lib/aula";
import type { CursoDetalhe } from "@/lib/cursos";

/**
 * Material complementar aprovado do curso. Complementar: se a consulta
 * falhar, a página do curso segue normal e o bloco não aparece.
 */
export function MaterialComplementar({ curso }: { curso: CursoDetalhe }) {
  const { sb, sessao } = usePortal();
  const lista = useQuery({
    queryKey: ["materiais", curso.slug, sessao?.user.id],
    queryFn: () => chamar<MaterialAluno[]>(sb, "academy_materiais_curso", { p_curso: curso.slug }),
    enabled: Boolean(sessao && curso.matriculado),
    retry: false,
    staleTime: 60_000,
  });
  const [baixando, setBaixando] = useState<string | null>(null);
  const [erro, setErro] = useState(false);
  if (!Array.isArray(lista.data) || lista.data.length === 0) return null;

  const modulo = (id: string | null) => {
    const m = id ? curso.modulos.find((x) => x.id === id) : null;
    return m ? rotuloModulo(m.ordem, m.titulo) : "Curso todo";
  };
  const baixar = async (m: MaterialAluno) => {
    setBaixando(m.id);
    setErro(false);
    try {
      window.location.assign(await linkDownload(sb, m));
    } catch {
      setErro(true);
    } finally {
      setBaixando(null);
    }
  };

  return (
    <section aria-labelledby="h-material" className="mt-10">
      <h2 id="h-material" className="m-0 mb-4 font-display text-xl font-semibold">
        Material complementar
      </h2>
      <ul className="m-0 flex list-none flex-col overflow-hidden rounded-[14px] border border-line p-0">
        {lista.data.map((m, i) => (
          <li key={m.id} className={i > 0 ? "border-t border-line" : undefined}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
              <FileText className="size-5 shrink-0 text-muted" aria-hidden="true" />
              <div className="min-w-0 flex-1 basis-56">
                <p className="m-0 font-medium">{m.titulo}</p>
                <p className="m-0 text-[13px] text-muted">
                  {modulo(m.modulo_id)}, {TIPOS[m.extensao].rotulo}, {tamanhoLegivel(m.tamanho)}
                </p>
                {m.descricao && <p className="m-0 mt-1 text-sm text-[#d4d4d4]">{m.descricao}</p>}
              </div>
              <button
                type="button"
                onClick={() => void baixar(m)}
                disabled={baixando === m.id}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line-hi px-4 text-sm font-semibold transition-colors duration-150 hover:border-muted disabled:opacity-60"
              >
                <Download className="size-4" aria-hidden="true" /> {baixando === m.id ? "Preparando…" : "Baixar"}
                <span className="sr-only">{m.titulo}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
      {erro && (
        <p role="alert" className="m-0 mt-3 text-sm">
          Não foi possível baixar agora. Tente de novo em instantes.
        </p>
      )}
    </section>
  );
}
