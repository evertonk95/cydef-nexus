import { Link } from "react-router";
import { AlertTriangle, UserX } from "lucide-react";
import { Botao } from "@/components/ui/Botao";
import { usePortal } from "@/lib/portal";

export function SemCadastro() {
  const { sair, config } = usePortal();
  return (
    <section className="painel-card mx-auto mt-10 max-w-xl p-8 text-center">
      <UserX className="mx-auto mb-4 size-10 text-muted" aria-hidden="true" />
      <h1 className="m-0 mb-3 font-display text-2xl font-semibold">Cadastro não encontrado</h1>
      <p className="m-0 mb-6 leading-relaxed text-muted">
        Este login não tem uma inscrição ativa na CyDef Academy. Faça a inscrição gratuita e entre com o mesmo e-mail.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={`${config.siteUrl}/academy/gratuito`} className="inline-flex items-center rounded-[10px] bg-orange px-5 py-3 font-semibold text-orange-ink transition-colors duration-150 hover:bg-orange-hi">
          Fazer a inscrição
        </a>
        <Botao variante="fantasma" className="px-5 py-3" onClick={() => void sair()}>
          Sair
        </Botao>
      </div>
    </section>
  );
}

export function FalhaCarregamento({ tentar }: { tentar: () => void }) {
  return (
    <section role="alert" className="painel-card mx-auto mt-10 max-w-xl p-8 text-center">
      <AlertTriangle className="mx-auto mb-4 size-10 text-warn" aria-hidden="true" />
      <h1 className="m-0 mb-3 font-display text-2xl font-semibold">Não foi possível carregar</h1>
      <p className="m-0 mb-6 leading-relaxed text-muted">A conexão com a Academy falhou. Confira a internet e tente de novo.</p>
      <Botao className="px-6 py-3" onClick={tentar}>Tentar de novo</Botao>
    </section>
  );
}

export function NaoEncontrado() {
  return (
    <section className="painel-card mx-auto mt-10 max-w-xl p-8 text-center">
      <p className="rotulo m-0 mb-2">Erro 404</p>
      <h1 className="m-0 mb-3 font-display text-2xl font-semibold">Página não encontrada</h1>
      <p className="m-0 mb-6 text-muted">O endereço não existe ou mudou de lugar.</p>
      <Link to="/" className="inline-flex items-center rounded-[10px] bg-orange px-5 py-3 font-semibold text-orange-ink transition-colors duration-150 hover:bg-orange-hi">
        Voltar ao painel
      </Link>
    </section>
  );
}
