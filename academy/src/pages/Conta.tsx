import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, LogOut, Mail } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { usePainel } from "@/lib/consultas";
import { urlAviso } from "@/lib/privacidade";
import { dataPorExtenso } from "@/lib/avaliacao";
import {
  arquivoDados,
  baixarArquivo,
  definirAvisoAulaNova,
  definirValidacao,
  emailExclusao,
  meusAvisos,
  meusCertificados,
  meusDados,
  type ErroConta,
  type MeuCertificado,
  type MeusAvisos,
} from "@/lib/conta";
import { chamar as chamarPainel, useAcao } from "@/lib/instrutor";
import { dia, useMinhasEmpresas, type MinhaEmpresa } from "@/lib/empresas";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { ErroFormulario } from "@/components/instrutor/Campos";
import { FalhaCarregamento, SemCadastro } from "./Estados";

export default function Conta() {
  const painel = usePainel();
  if (painel.isError) return <FalhaCarregamento tentar={() => void painel.refetch()} />;
  if (painel.isSuccess && painel.data === null) return <SemCadastro />;

  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Minha conta</h1>
      <p className="m-0 mb-10 max-w-2xl leading-relaxed text-muted">Seus dados, seus certificados e o que você pode fazer com eles.</p>
      <div className="flex max-w-3xl flex-col gap-12">
        <Bloco id="h-dados" titulo="Seus dados">
          {painel.data ? <Dados key={painel.data.nome} nome={painel.data.nome} /> : <Esqueleto className="h-24 w-full" />}
        </Bloco>
        <Bloco id="h-certificados" titulo="Certificados">
          <Certificados />
        </Bloco>
        <AvisosEmail />
        <Empresas />
        <Bloco id="h-acesso" titulo="Acesso">
          <Acesso />
        </Bloco>
        <Bloco id="h-privacidade" titulo="Privacidade">
          <Privacidade />
        </Bloco>
      </div>
    </>
  );
}

function Bloco({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="m-0 mb-4 font-display text-xl font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Dados({ nome }: { nome: string }) {
  const { sessao } = usePortal();
  return (
    <div className="painel-card flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-sm font-medium">Nome</p>
        <p className="m-0 text-[15px] text-ink">{nome}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-sm font-medium">E-mail</p>
        <p className="m-0 text-[15px] break-all text-ink">{sessao?.user.email}</p>
        <p className="m-0 text-[13px] text-muted">O e-mail é o seu login. Para trocar, escreva para contato@cydef.com.br.</p>
      </div>
      <p className="m-0 border-t border-line pt-4 text-sm leading-relaxed text-muted">
        Nome, contato, trabalho e bio ficam em{" "}
        <Link to="/perfil" className="text-ink underline underline-offset-4">
          Meu perfil
        </Link>
        .
      </p>
    </div>
  );
}

function Certificados() {
  const { sb, sessao } = usePortal();
  const qc = useQueryClient();
  const chave = ["meus-certificados", sessao?.user.id];
  const lista = useQuery({ queryKey: chave, queryFn: () => meusCertificados(sb), enabled: Boolean(sessao) });
  const alternar = useMutation<MeuCertificado[], ErroConta, { codigo: string; ativa: boolean }>({
    mutationFn: ({ codigo, ativa }) => definirValidacao(sb, codigo, ativa),
    onSuccess: (dados) => qc.setQueryData(chave, dados),
  });

  if (lista.isError) return <FalhaCarregamento tentar={() => void lista.refetch()} />;
  if (!lista.data) return <Esqueleto className="h-24 w-full" />;
  if (lista.data.length === 0)
    return (
      <p className="painel-card m-0 p-6 leading-relaxed text-muted">
        Você ainda não tem certificado. Ele aparece aqui quando você concluir um curso e emitir o certificado.
      </p>
    );

  return (
    <>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {lista.data.map((c) => (
          <li key={c.codigo} className="painel-card flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <h3 className="m-0 font-display text-lg font-semibold">{c.curso_titulo}</h3>
              <p className="m-0 text-sm text-muted">Concluído em {dataPorExtenso(c.concluido_em)}</p>
            </div>
            <p className="m-0 text-sm tracking-wider text-ink">{c.codigo}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to={`/cursos/${c.curso_slug}/certificado`} className="text-sm font-semibold text-ink hover:text-orange-hi">
                Abrir certificado
              </Link>
              {c.validacao_publica && (
                <a href={`/certificado/${c.codigo}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                  Página de validação <ExternalLink className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              )}
            </div>
            <label className="flex items-start gap-3 border-t border-line pt-4">
              <input
                type="checkbox"
                checked={c.validacao_publica}
                disabled={alternar.isPending}
                onChange={(e) => alternar.mutate({ codigo: c.codigo, ativa: e.target.checked })}
                className="mt-0.5 size-[18px] shrink-0 accent-ink"
              />
              <span>
                <span className="block text-[15px] font-medium">Validação pública ligada</span>
                <span className="block text-[13px] leading-snug text-muted">
                  {c.validacao_publica
                    ? "Quem tiver o código confere nome, curso, carga horária e data."
                    : "Desligada: a página de validação responde como se o código não existisse."}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <ErroFormulario erro={alternar.error} />
    </>
  );
}

/**
 * Avisos por e-mail (fase 18). Certificado emitido chega sempre; aula nova só
 * para quem ligar. Antes da 0028 no banco, o bloco não aparece.
 */
function AvisosEmail() {
  const { sb, sessao } = usePortal();
  const qc = useQueryClient();
  const chave = ["meus-avisos", sessao?.user.id];
  const atual = useQuery({ queryKey: chave, queryFn: () => meusAvisos(sb), enabled: Boolean(sessao), retry: false });
  const alternar = useMutation<MeusAvisos, ErroConta, boolean>({
    mutationFn: (ligado) => definirAvisoAulaNova(sb, ligado),
    onSuccess: (dados) => qc.setQueryData(chave, dados),
  });

  if (atual.isError || (atual.data && typeof atual.data.aula_nova !== "boolean")) return null;
  return (
    <Bloco id="h-avisos" titulo="Avisos por e-mail">
      {!atual.data ? (
        <Esqueleto className="h-24 w-full" />
      ) : (
        <div className="painel-card flex flex-col gap-4 p-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={atual.data.aula_nova}
              disabled={alternar.isPending}
              onChange={(e) => alternar.mutate(e.target.checked)}
              className="mt-0.5 size-[18px] shrink-0 accent-ink"
            />
            <span>
              <span className="block text-[15px] font-medium">Avisar quando sair aula nova</span>
              <span className="block text-[13px] leading-snug text-muted">
                {atual.data.aula_nova
                  ? `Ligado${atual.data.aula_nova_desde ? ` desde ${dataPorExtenso(atual.data.aula_nova_desde)}` : ""}. Um e-mail por curso, uma vez por dia, quando sair aula nova nos cursos em que você está matriculado.`
                  : "Desligado. Ligue para receber um e-mail por curso, uma vez por dia, quando sair aula nova nos cursos em que você está matriculado."}
              </span>
            </span>
          </label>
          <p className="m-0 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            O e-mail de certificado emitido chega sempre, com o código de validação e o link para baixar o PDF.
          </p>
          <ErroFormulario erro={alternar.error} />
        </div>
      )}
    </Bloco>
  );
}

function Acesso() {
  const { sb, sair } = usePortal();
  const [confirmar, setConfirmar] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const sairDeTodos = async () => {
    setSaindo(true);
    try {
      await sb.auth.signOut({ scope: "global" });
    } finally {
      await sair();
    }
  };

  return (
    <div className="painel-card flex flex-col gap-4 p-6">
      <div>
        <p className="m-0 font-medium">Sair de todos os dispositivos</p>
        <p className="m-0 mt-1 text-sm leading-relaxed text-muted">
          Encerra a sessão aqui e em qualquer outro navegador onde você entrou, como um computador emprestado. Para voltar, peça um link novo na tela de entrada.
        </p>
      </div>
      {confirmar ? (
        <div className="flex flex-wrap items-center gap-3">
          <Botao onClick={() => void sairDeTodos()} disabled={saindo} className="h-11 px-5">
            <LogOut className="size-4" aria-hidden="true" /> {saindo ? "Saindo…" : "Sair de todos agora"}
          </Botao>
          <Botao variante="contorno" className="h-11 px-5" onClick={() => setConfirmar(false)}>
            Cancelar
          </Botao>
        </div>
      ) : (
        <div>
          <Botao variante="contorno" className="h-11 px-5" onClick={() => setConfirmar(true)}>
            <LogOut className="size-4" aria-hidden="true" /> Sair de todos os dispositivos
          </Botao>
        </div>
      )}
    </div>
  );
}

function Privacidade() {
  const { sb, sessao, config } = usePortal();
  const aviso = useAvisos();
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState(false);
  const baixar = async () => {
    setBaixando(true);
    setErro(false);
    try {
      const dados = await meusDados(sb);
      const nome = arquivoDados();
      baixarArquivo(JSON.stringify(dados, null, 2), nome, "application/json");
      aviso({ tipo: "ok", titulo: "Cópia dos dados baixada", texto: nome });
    } catch {
      setErro(true);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="painel-card flex flex-col gap-4 p-6">
        <div>
          <p className="m-0 font-medium">Cópia dos seus dados</p>
          <p className="m-0 mt-1 text-sm leading-relaxed text-muted">
            Um arquivo JSON com a sua conta, a pré-inscrição e o consentimento, as matrículas, o progresso, as questões e avaliações (com as suas respostas) e os certificados.
          </p>
        </div>
        <div>
          <Botao variante="contorno" onClick={() => void baixar()} disabled={baixando} className="h-11 px-5">
            <Download className="size-4" aria-hidden="true" /> {baixando ? "Preparando…" : "Baixar meus dados"}
          </Botao>
        </div>
        {erro && (
          <p role="alert" className="m-0 text-sm">
            Não foi possível preparar a cópia agora. Tente de novo em instantes.
          </p>
        )}
      </div>

      <div className="painel-card flex flex-col gap-4 p-6">
        <div>
          <p className="m-0 font-medium">Excluir a conta</p>
          <p className="m-0 mt-1 text-sm leading-relaxed text-muted">
            A exclusão encerra o acesso aos cursos e ao histórico de estudo e desativa a validação dos certificados emitidos. O pedido vai por e-mail para contato@cydef.com.br, e a CyDef responde em até 15 dias.
          </p>
        </div>
        <div>
          <a
            href={emailExclusao(sessao?.user.email ?? "")}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line-hi px-5 font-semibold transition-colors duration-150 hover:border-muted"
          >
            <Mail className="size-4" aria-hidden="true" /> Pedir a exclusão por e-mail
          </a>
        </div>
      </div>

      <p className="m-0 text-sm text-muted">
        Os outros pedidos da LGPD seguem o mesmo canal. Detalhes no{" "}
        <a href={urlAviso(config.siteUrl)} target="_blank" rel="noopener" className="text-ink underline-offset-2 hover:underline">
          Aviso de Privacidade da Academy
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
        .
      </p>
    </div>
  );
}

/** Empresas pelas quais a pessoa tem acesso (fase 17). Só aparece para quem tem. */
function Empresas() {
  const minhas = useMinhasEmpresas();
  const empresas = minhas.data?.empresas ?? [];
  if (empresas.length === 0) return null;
  return (
    <Bloco id="h-empresas" titulo="Empresas">
      <div className="flex flex-col gap-4">
        {empresas.map((e) => (
          <CartaoEmpresa key={e.membro} e={e} />
        ))}
      </div>
    </Bloco>
  );
}

function CartaoEmpresa({ e }: { e: MinhaEmpresa }) {
  const aviso = useAvisos();
  const [confirmar, setConfirmar] = useState(false);
  const sair = useAcao(
    (sb: Parameters<typeof chamarPainel>[0]) => chamarPainel(sb, "academy_sair_empresa", { p_membro: e.membro }),
    () => aviso({ titulo: `Você saiu da ${e.empresa}`, texto: "A gestão dela deixa de ver o seu progresso.", tipo: "ok" }),
  );
  return (
    <div className="painel-card flex flex-col gap-4 p-6">
      <div>
        <p className="m-0 font-medium">{e.empresa}</p>
        <p className="m-0 mt-1 text-sm leading-relaxed text-muted">
          {e.alvo === "Plataforma toda" ? "Todos os cursos pagos" : e.alvo} até {dia(e.fim)}. Desde que você aceitou o convite, a gestão da empresa vê as
          aulas concluídas, a aprovação na avaliação final e os certificados dos cursos do contrato, além do seu último acesso. Ela não vê notas, respostas nem
          missões práticas.
        </p>
      </div>
      {confirmar ? (
        <div className="flex flex-wrap items-center gap-3">
          <Botao onClick={() => sair.mutate(null)} disabled={sair.isPending} className="h-11 px-5">
            {sair.isPending ? "Saindo…" : "Sair da empresa agora"}
          </Botao>
          <Botao variante="contorno" className="h-11 px-5" onClick={() => setConfirmar(false)}>
            Cancelar
          </Botao>
          <p className="m-0 basis-full text-sm text-muted">Você perde o acesso aos cursos do contrato. Conta, progresso e certificados continuam seus.</p>
        </div>
      ) : (
        <div>
          <Botao variante="contorno" className="h-11 px-5" onClick={() => setConfirmar(true)}>
            Sair da empresa
          </Botao>
        </div>
      )}
      <ErroFormulario erro={sair.error} />
    </div>
  );
}
