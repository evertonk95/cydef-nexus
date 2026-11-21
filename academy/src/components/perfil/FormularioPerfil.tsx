import { useState, type FormEvent, type ReactNode } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { usePortal } from "@/lib/portal";
import { urlAviso } from "@/lib/privacidade";
import { AREAS, EXPERIENCIAS, nascimentoMaximo, paraFormulario, preenchidos, type Perfil, type PerfilForm } from "@/lib/perfil";
import { Botao } from "@/components/ui/Botao";
import { AreaTexto, Campo, ErroFormulario, Selecao } from "@/components/instrutor/Campos";

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-5 border-0 border-t border-line p-0 pt-8 first:border-t-0 first:pt-0">
      <legend className="float-left mb-1 w-full p-0">
        <span className="block font-display text-lg font-semibold">{titulo}</span>
        {descricao && <span className="mt-1 block text-sm leading-relaxed text-muted">{descricao}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** Textos de quem preenche (o aluno) e de quem edita a ficha de outra pessoa (o admin). */
const TEXTOS = {
  aluno: {
    quem: "Quem é você",
    onde: "Onde você está",
    sobre: "Sobre você",
    email: "O e-mail é o seu login e não muda por aqui. Para trocar, escreva para contato@cydef.com.br.",
    nome: "Aparece no portal e vem preenchido na emissão do certificado. Certificado já emitido não muda.",
    bio: "Algumas linhas sobre a sua trajetória e o que você quer aprender.",
  },
  admin: {
    quem: "Identificação",
    onde: "Localização",
    sobre: "Sobre a pessoa",
    email: "O e-mail é o login da pessoa e não muda por aqui.",
    nome: "Aparece no portal e vem preenchido quando a pessoa emite um certificado. Certificado já emitido não muda.",
    bio: "Trajetória e o que a pessoa quer aprender.",
  },
} as const;

/**
 * Formulário do perfil (fase 19), usado pelo aluno em Meu perfil e pelo admin
 * na ficha da pessoa (fase 20). O e-mail aparece só para leitura.
 */
export function FormularioPerfil({
  perfil,
  salvar,
  visao = "aluno",
}: {
  perfil: Perfil;
  salvar: UseMutationResult<unknown, Error, PerfilForm>;
  visao?: keyof typeof TEXTOS;
}) {
  const t = TEXTOS[visao];
  const { config } = usePortal();
  const [f, setF] = useState<PerfilForm>(() => paraFormulario(perfil));

  const original = paraFormulario(perfil);
  const mudou = (Object.keys(f) as (keyof PerfilForm)[]).some((k) => f[k].trim() !== original[k].trim());
  const { feitos, total } = preenchidos(f);
  const campo = (k: keyof PerfilForm) => ({
    value: f[k],
    onChange: (e: { target: { value: string } }) => setF((v) => ({ ...v, [k]: e.target.value })),
  });
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate(f);
  };

  return (
    <form onSubmit={enviar} className="flex max-w-3xl flex-col gap-8" aria-describedby="perfil-progresso">
      <div className="painel-card flex items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p id="perfil-progresso" className="m-0 text-sm font-medium">
            {feitos === total ? "Perfil completo" : `${feitos} de ${total} campos opcionais preenchidos`}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${Math.round((feitos / total) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="painel-card flex flex-col gap-8 p-6 sm:p-8">
        <Secao titulo={t.quem}>
          <Campo rotulo="Nome completo" {...campo("nome")} limite={80} required minLength={2} autoComplete="name"
            ajuda={t.nome} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo rotulo="Data de nascimento" type="date" {...campo("data_nascimento")} min="1900-01-01" max={nascimentoMaximo()} autoComplete="bday" />
            <Campo rotulo="Telefone" type="tel" {...campo("telefone")} limite={20} autoComplete="tel" placeholder="+55 61 99999-0000" inputMode="tel" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-sm font-medium">E-mail</p>
            <p className="m-0 text-[15px] break-all text-ink">{perfil.email}</p>
            <p className="m-0 text-[13px] text-muted">{t.email}</p>
          </div>
        </Secao>

        <Secao titulo={t.onde}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo rotulo="Cidade" {...campo("cidade")} limite={80} autoComplete="address-level2" />
            <Campo rotulo="País" {...campo("pais")} limite={60} autoComplete="country-name" />
          </div>
        </Secao>

        <Secao titulo="Trabalho" descricao="Ajuda a CyDef a montar cursos e trilhas para quem está estudando aqui.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo rotulo="Empresa onde trabalha" {...campo("empresa")} limite={120} autoComplete="organization" />
            <Campo rotulo="Cargo" {...campo("cargo")} limite={120} autoComplete="organization-title" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Selecao rotulo="Área de atuação" {...campo("area")}>
              <option value="">Prefiro não dizer</option>
              {AREAS.map((a) => (
                <option key={a.valor} value={a.valor}>{a.rotulo}</option>
              ))}
            </Selecao>
            <Selecao rotulo="Tempo de experiência na área" {...campo("experiencia")}>
              <option value="">Prefiro não dizer</option>
              {EXPERIENCIAS.map((a) => (
                <option key={a.valor} value={a.valor}>{a.rotulo}</option>
              ))}
            </Selecao>
          </div>
        </Secao>

        <Secao titulo={t.sobre}>
          <AreaTexto rotulo="Bio" {...campo("bio")} limite={600} rows={4} ajuda={t.bio} />
          <Campo rotulo="LinkedIn" type="url" {...campo("linkedin")} limite={200} placeholder="https://www.linkedin.com/in/seu-nome" inputMode="url" />
        </Secao>

        <ErroFormulario erro={salvar.error} />
        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <Botao type="submit" className="h-11 px-5" disabled={!mudou || salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Salvar perfil"}
          </Botao>
          <a href={urlAviso(config.siteUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-muted underline underline-offset-4 hover:text-ink">
            Como tratamos esses dados
          </a>
        </div>
      </div>
    </form>
  );
}
