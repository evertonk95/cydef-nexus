import { Link } from "react-router";
import { Award, Check, ClipboardCheck, Hourglass, ListChecks, Lock } from "lucide-react";
import { caminhoAvaliacao, caminhoCertificado, caminhoQuestoes, mostraConclusao, quandoLibera, type ModuloSituacao, type Situacao } from "@/lib/avaliacao";
import { Cartao } from "@/components/ui/Cartao";
import { cn } from "@/lib/cn";

/**
 * Linha "Questões do módulo" no fim da lista de aulas de um módulo. Só aparece
 * quando o módulo tem questões cadastradas: curso sem questões fica como antes.
 */
export function LinhaQuestoes({ slug, modulo, compacta = false }: { slug: string; modulo: ModuloSituacao; compacta?: boolean }) {
  if (!modulo.tem_questoes) return null;
  const estado = modulo.aprovado ? "aprovado" : modulo.liberado ? "pendente" : "bloqueado";
  return (
    <li className="border-t border-[#1a1a1d]">
      <Link
        to={caminhoQuestoes(slug, modulo.ordem)}
        className={cn("flex items-center gap-3 text-sm transition-colors duration-150 hover:bg-white/[0.03]", compacta ? "px-3.5 py-3" : "px-4 py-3")}
      >
        <span
          className={cn(
            "grid size-[22px] flex-none place-items-center rounded-full border-[1.5px]",
            estado === "aprovado" ? "border-ok bg-ok text-[#052e13]" : estado === "pendente" ? "border-orange text-orange" : "border-line-hi text-dim",
          )}
        >
          {estado === "aprovado" ? (
            <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
          ) : estado === "bloqueado" ? (
            <Lock className="size-3" aria-hidden="true" />
          ) : (
            <ListChecks className="size-3" aria-hidden="true" />
          )}
        </span>
        {!compacta && <span className="w-6" aria-hidden="true" />}
        <span className="flex-1 font-semibold">Questões do módulo</span>
        <span
          className={cn(
            "text-[13px] whitespace-nowrap",
            estado === "aprovado" ? "text-ok" : estado === "pendente" ? "text-orange-hi" : "text-dim",
          )}
        >
          {estado === "aprovado" ? "Aprovado" : estado === "pendente" ? "Responder" : "Bloqueado"}
        </span>
      </Link>
    </li>
  );
}

/** Aviso dentro de um módulo bloqueado, no topo da lista de aulas. */
export function AvisoBloqueio({ pendente }: { pendente: ModuloSituacao | null }) {
  return (
    <li className="flex items-center gap-2.5 border-t border-[#1a1a1d] bg-white/[0.02] px-4 py-2.5 text-[13px] text-muted">
      <Lock className="size-3.5 flex-none text-dim" aria-hidden="true" />
      {pendente ? `Abre depois que você passar nas questões do ${pendente.ordem === 0 ? pendente.titulo : `Módulo ${pendente.ordem}`}.` : "Abre depois das questões do módulo anterior."}
    </li>
  );
}

export function CartaoConclusao({ slug, s }: { slug: string; s: Situacao }) {
  if (!mostraConclusao(s)) return null;
  const f = s.final;
  const cert = s.certificado;
  const temCert = Boolean(cert.codigo);
  const liberado = cert.elegivel || temCert;

  const linha = liberado
    ? {
        icone: <Award className="size-[22px]" aria-hidden="true" />,
        titulo: temCert ? "Certificado emitido" : "Certificado liberado",
        texto: temCert ? "Veja os dados e o código de validação." : "Confira seu nome e emita o certificado.",
        para: caminhoCertificado(slug),
        cta: temCert ? "Ver certificado" : "Emitir certificado",
      }
    : f.situacao === "aguarde"
      ? {
          icone: <Hourglass className="size-[22px]" aria-hidden="true" />,
          titulo: "Avaliação final",
          texto: f.proxima_em ? `Nova tentativa ${quandoLibera(f.proxima_em)}.` : "Nova tentativa em breve.",
          para: caminhoAvaliacao(slug),
          cta: "Ver detalhes",
        }
      : {
          icone: <ClipboardCheck className="size-[22px]" aria-hidden="true" />,
          titulo: "Avaliação final",
          texto: f.prova_aberta ? "Você tem uma avaliação em andamento." : f.situacao === "aprovado" ? "Você passou na avaliação final." : "Sua avaliação final está liberada.",
          para: caminhoAvaliacao(slug),
          cta: f.prova_aberta ? "Continuar a avaliação" : f.situacao === "aprovado" ? "Ver resultado" : "Fazer a avaliação",
        };

  return (
    <Cartao rotulo="Conclusão do curso" className={liberado ? "border-ok/30" : undefined}>
      <div className="mb-4 flex items-center gap-3.5">
        <span
          className={cn(
            "grid size-11 flex-none place-items-center rounded-xl border",
            liberado ? "border-ok/30 bg-ok/10 text-ok" : "border-line-hi text-muted",
          )}
        >
          {linha.icone}
        </span>
        <div className="min-w-0">
          <p className="m-0 font-display text-lg font-semibold">{linha.titulo}</p>
          <p className="m-0 text-[13.5px] text-muted">{linha.texto}</p>
        </div>
      </div>
      <Link
        to={linha.para}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-orange px-4 text-[15px] font-semibold text-orange-ink transition-colors duration-150 hover:bg-orange-hi"
      >
        {linha.cta}
      </Link>
    </Cartao>
  );
}
