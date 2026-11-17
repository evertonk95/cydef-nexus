import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { LinkIcon, ShieldAlert, UserX } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { retornoInicial } from "@/lib/retorno";
import { FundoParticulas } from "@/components/fx/FundoParticulas";
import { Logo } from "@/components/ui/Logo";

type Estado = "verificando" | "link_invalido" | "sem_cadastro" | "falha";

const LINHAS = ["Validando o link de acesso", "Abrindo sua sessão segura", "Carregando seu painel"];

export default function Retorno() {
  const { sb, sessao, carregando, sair, config } = usePortal();
  const navegar = useNavigate();
  const qc = useQueryClient();
  const reduzir = useReducedMotion();
  const retorno = retornoInicial();
  const [estado, setEstado] = useState<Estado>(retorno.tipo === "erro" ? "link_invalido" : "verificando");
  const feito = useRef(false);

  useEffect(() => {
    if (estado !== "verificando" || carregando) return;
    if (!sessao) {
      const t = window.setTimeout(() => setEstado("link_invalido"), 8000);
      return () => window.clearTimeout(t);
    }
    if (feito.current) return;
    feito.current = true;
    void (async () => {
      const { error } = await sb.rpc("academy_registrar_acesso");
      if (error) {
        if (error.message?.includes("sem_cadastro")) {
          await sair();
          setEstado("sem_cadastro");
        } else {
          setEstado("falha");
        }
        return;
      }
      await qc.invalidateQueries();
      navegar("/", { replace: true });
    })();
  }, [estado, carregando, sessao, sb, sair, qc, navegar]);

  return (
    <div className="relative grid min-h-dvh place-items-center px-5">
      <FundoParticulas intensidade="discreta" />
      <motion.section
        initial={reduzir ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
        data-interativo="false"
        className="painel-card relative z-10 w-full max-w-[520px] border-line-hi p-8"
        aria-live="polite"
      >
        <div className="mb-7"><Logo para="/entrar" /></div>
        {estado === "verificando" && (
          <div>
            <h1 className="m-0 mb-5 font-display text-2xl font-bold">Entrando na Academy</h1>
            <ul className="m-0 flex list-none flex-col gap-2 rounded-xl border border-line bg-[#08080a] p-4 font-mono text-[13.5px] text-muted">
              {LINHAS.map((l, i) => (
                <motion.li
                  key={l}
                  initial={reduzir ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduzir ? 0 : 0.15 + i * 0.35, duration: 0.2 }}
                >
                  &gt; {l}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
        {estado === "link_invalido" && (
          <div role="alert">
            <LinkIcon className="mb-4 size-10 text-warn" aria-hidden="true" />
            <h1 className="m-0 mb-3 font-display text-2xl font-bold">Este link não vale mais</h1>
            <p className="m-0 mb-6 leading-relaxed text-muted">
              Os links de acesso valem uma vez e por pouco tempo. Peça um novo com o mesmo e-mail.
            </p>
            <Link to="/entrar" className="inline-flex rounded-xl border-[1.5px] border-orange px-5 py-3 font-semibold text-orange-hi hover:bg-orange/10">
              Pedir novo link
            </Link>
          </div>
        )}
        {estado === "sem_cadastro" && (
          <div role="alert">
            <UserX className="mb-4 size-10 text-orange" aria-hidden="true" />
            <h1 className="m-0 mb-3 font-display text-2xl font-bold">Cadastro não encontrado</h1>
            <p className="m-0 mb-6 leading-relaxed text-muted">Este e-mail não tem inscrição ativa na CyDef Academy.</p>
            <a href={`${config.siteUrl}/academy/gratuito`} className="inline-flex rounded-xl border-[1.5px] border-orange px-5 py-3 font-semibold text-orange-hi hover:bg-orange/10">
              Fazer a inscrição gratuita
            </a>
          </div>
        )}
        {estado === "falha" && (
          <div role="alert">
            <ShieldAlert className="mb-4 size-10 text-bad" aria-hidden="true" />
            <h1 className="m-0 mb-3 font-display text-2xl font-bold">Não foi possível concluir o acesso</h1>
            <p className="m-0 mb-6 leading-relaxed text-muted">A conexão com a Academy falhou. Tente abrir o painel de novo.</p>
            <Link to="/" className="inline-flex rounded-xl border-[1.5px] border-orange px-5 py-3 font-semibold text-orange-hi hover:bg-orange/10">
              Abrir o painel
            </Link>
          </div>
        )}
      </motion.section>
    </div>
  );
}
