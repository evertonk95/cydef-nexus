import { Link } from "react-router";
import { Play } from "lucide-react";
import { relogio } from "@/lib/formato";
import { caminhoAula, numeroAula, rotuloModulo } from "@/lib/aula";
import type { Painel } from "@/lib/painel";

/** A ação principal do painel: voltar para a aula onde o aluno parou. */
export function CartaoContinuar({ painel }: { painel: Painel }) {
  const c = painel.continuar;
  if (!c) {
    const temCurso = painel.cursos.length > 0;
    return (
      <section aria-labelledby="h-continuar" className="painel-card flex flex-col gap-3 p-8">
        <h2 id="h-continuar" className="m-0 font-display text-[26px] leading-tight font-semibold tracking-tight">
          {temCurso ? "Tudo em dia" : "Seus cursos"}
        </h2>
        <p className="m-0 max-w-[60ch] leading-relaxed text-muted">
          {temCurso
            ? "Você concluiu todas as aulas publicadas dos seus cursos. Quando uma aula nova sair, ela aparece aqui."
            : "Os cursos da sua inscrição aparecem aqui assim que as primeiras aulas forem publicadas. Avisamos por e-mail."}
        </p>
      </section>
    );
  }
  const assistido = c.duracao_seg > 0 ? Math.min(100, Math.round((c.posicao_seg / c.duracao_seg) * 100)) : 0;
  const caminho = caminhoAula(c.curso_slug, c.aula_numero);
  return (
    <section aria-labelledby="h-continuar" className="painel-card flex flex-col gap-5 p-8">
      <p className="m-0 text-sm text-muted">
        {c.curso_titulo}, {rotuloModulo(c.modulo_ordem, c.modulo_titulo)}
      </p>
      <h2 id="h-continuar" className="m-0 max-w-[26ch] font-display text-[30px] leading-tight font-semibold tracking-tight">
        Aula {numeroAula(c.aula_numero)}: {c.aula_titulo}
      </h2>
      {c.posicao_seg > 0 && (
        <div className="flex max-w-[480px] flex-col gap-2">
          <div role="progressbar" aria-label="Quanto você já assistiu desta aula" aria-valuemin={0} aria-valuemax={100} aria-valuenow={assistido} className="h-1 overflow-hidden rounded-full bg-line">
            <span className="block h-full origin-left bg-orange" style={{ transform: `scaleX(${assistido / 100})` }} />
          </div>
          <p className="m-0 text-sm text-muted">
            Você parou em {relogio(c.posicao_seg)} de {relogio(c.duracao_seg)}
          </p>
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-5">
        <Link to={caminho} className="inline-flex h-12 items-center gap-2.5 rounded-[10px] bg-orange px-6 font-semibold text-orange-ink transition-colors duration-150 hover:bg-orange-hi">
          <Play className="size-4 fill-current" aria-hidden="true" />
          {c.posicao_seg > 0 ? "Continuar aula" : "Começar aula"}
        </Link>
        <Link to={`/cursos/${c.curso_slug}`} className="text-[15px] font-medium text-muted underline underline-offset-4 hover:text-ink">
          Ver o curso
        </Link>
      </div>
    </section>
  );
}
