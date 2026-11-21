import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePortal } from "@/lib/portal";
import { meuPerfil, salvarMeuPerfil, type ErroPerfil, type Perfil, type PerfilForm } from "@/lib/perfil";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FormularioPerfil } from "@/components/perfil/FormularioPerfil";
import { FalhaCarregamento, SemCadastro } from "./Estados";

/**
 * Meu perfil (fase 19): qualquer papel completa o próprio perfil. Só o nome é
 * obrigatório; o e-mail é o login e aparece só para leitura.
 */
export default function MeuPerfil() {
  const { sb, sessao } = usePortal();
  const atual = useQuery({ queryKey: ["meu-perfil", sessao?.user.id], queryFn: () => meuPerfil(sb), enabled: Boolean(sessao), retry: false });

  if (atual.isError) {
    return (atual.error as ErroPerfil).codigo === "sem_cadastro" ? <SemCadastro /> : <FalhaCarregamento tentar={() => void atual.refetch()} />;
  }
  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Meu perfil</h1>
      <p className="m-0 mb-10 max-w-2xl leading-relaxed text-muted">
        Conte um pouco sobre você. Só o nome é obrigatório; o resto você preenche se quiser e apaga quando quiser. Quem vê o perfil é
        você e a administração da CyDef Academy. Instrutores e empresas não veem.
      </p>
      {atual.data ? <Formulario key={atual.data.atualizado_em ?? "novo"} perfil={atual.data} /> : <Esqueleto className="h-[640px] w-full max-w-3xl" />}
    </>
  );
}

function Formulario({ perfil }: { perfil: Perfil }) {
  const { sb, sessao } = usePortal();
  const qc = useQueryClient();
  const aviso = useAvisos();
  const salvar = useMutation<Perfil, ErroPerfil, PerfilForm>({
    mutationFn: (dados) => salvarMeuPerfil(sb, dados),
    onSuccess: (novo) => {
      qc.setQueryData(["meu-perfil", sessao?.user.id], novo);
      void qc.invalidateQueries({ queryKey: ["painel"] });
      aviso({ tipo: "ok", titulo: "Perfil salvo" });
    },
  });
  return <FormularioPerfil perfil={perfil} salvar={salvar} />;
}
