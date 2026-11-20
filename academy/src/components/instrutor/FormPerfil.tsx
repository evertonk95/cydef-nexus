import { useState, type FormEvent, type ReactNode } from "react";
import type { PerfilInstrutor } from "@/lib/instrutor";
import { Botao } from "@/components/ui/Botao";
import { AreaTexto, Campo, ErroFormulario } from "./Campos";

export type DadosPerfil = Pick<PerfilInstrutor, "nome" | "cargo" | "bio" | "linkedin" | "site">;

/** Perfil público de quem ensina: o que o aluno vê na página do curso. */
export function FormPerfil({
  inicial,
  salvar,
  salvando,
  erro,
  rotuloSalvar,
  extra,
}: {
  inicial: DadosPerfil;
  salvar: (d: DadosPerfil) => void;
  salvando: boolean;
  erro?: Error | null;
  rotuloSalvar: string;
  extra?: ReactNode;
}) {
  const [f, setF] = useState({ ...inicial, linkedin: inicial.linkedin ?? "", site: inicial.site ?? "" });
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar({ nome: f.nome, cargo: f.cargo, bio: f.bio, linkedin: f.linkedin.trim() || null, site: f.site.trim() || null });
  };
  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Nome público" value={f.nome} onChange={(e) => setF((x) => ({ ...x, nome: e.target.value }))} limite={80} required minLength={2} />
        <Campo rotulo="Cargo" placeholder="Analista de SOC na CyDef" value={f.cargo} onChange={(e) => setF((x) => ({ ...x, cargo: e.target.value }))} limite={120} />
      </div>
      <AreaTexto
        rotulo="Mini bio"
        value={f.bio}
        onChange={(e) => setF((x) => ({ ...x, bio: e.target.value }))}
        limite={1200}
        ajuda="Experiência e o que a pessoa traz para o curso, em poucas linhas."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          rotulo="LinkedIn"
          type="url"
          placeholder="https://www.linkedin.com/in/…"
          value={f.linkedin}
          onChange={(e) => setF((x) => ({ ...x, linkedin: e.target.value }))}
          limite={300}
        />
        <Campo rotulo="Site" type="url" placeholder="https://" value={f.site} onChange={(e) => setF((x) => ({ ...x, site: e.target.value }))} limite={300} />
      </div>
      <ErroFormulario erro={erro} />
      <div className="flex flex-wrap gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={salvando}>
          {salvando ? "Salvando…" : rotuloSalvar}
        </Botao>
        {extra}
      </div>
    </form>
  );
}
