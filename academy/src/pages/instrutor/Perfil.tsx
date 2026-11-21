import { chamar, useAcao, useMeuPerfil, type PerfilInstrutor } from "@/lib/instrutor";
import { iniciais } from "@/lib/formato";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FormPerfil, type DadosPerfil } from "@/components/instrutor/FormPerfil";
import { FalhaCarregamento } from "../Estados";

export default function PerfilInstrutor() {
  const perfil = useMeuPerfil();
  const aviso = useAvisos();
  const salvar = useAcao(
    (sb, d: DadosPerfil) => chamar<PerfilInstrutor>(sb, "academy_adm_salvar_meu_perfil", { p_dados: d }),
    () => aviso({ titulo: "Perfil salvo", texto: "Aparece nos cursos em que você está como instrutor.", tipo: "ok" }),
  );
  if (perfil.isError) return <FalhaCarregamento tentar={() => void perfil.refetch()} />;

  return (
    <>
      <h1 className="m-0 mb-3 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Perfil de instrutor</h1>
      <p className="m-0 mb-8 max-w-2xl text-muted">É assim que você aparece para o aluno na página dos cursos em que ensina.</p>
      {!perfil.data ? (
        <div aria-busy="true" aria-label="Carregando o perfil" className="flex max-w-3xl flex-col gap-5">
          <Esqueleto className="h-11 w-full" />
          <Esqueleto className="h-28 w-full" />
        </div>
      ) : (
        <div className="flex max-w-3xl flex-col gap-8">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-full border border-line-hi bg-panel font-display text-lg font-semibold">
              {iniciais(perfil.data.nome || "?")}
            </span>
            <p className="m-0 text-sm text-muted">A foto entra numa próxima etapa. Por enquanto o portal mostra as suas iniciais.</p>
          </div>
          <FormPerfil
            inicial={perfil.data}
            salvar={(d) => salvar.mutate(d)}
            salvando={salvar.isPending}
            erro={salvar.error}
            rotuloSalvar={perfil.data.id ? "Salvar perfil" : "Criar perfil"}
          />
        </div>
      )}
    </>
  );
}
