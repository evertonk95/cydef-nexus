import { motion, useReducedMotion } from "motion/react";
import { usePainel, useBoletim } from "@/lib/consultas";
import { primeiroNome } from "@/lib/formato";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { CartaoContinuar } from "@/components/painel/CartaoContinuar";
import { CartaoFormacao } from "@/components/painel/CartaoFormacao";
import { CartaoBoletim } from "@/components/painel/CartaoBoletim";
import { CartaoCompetencias } from "@/components/painel/CartaoCompetencias";
import { CartaoSequencia } from "@/components/painel/CartaoSequencia";
import { SemCadastro, FalhaCarregamento } from "./Estados";

export default function Painel() {
  const painel = usePainel();
  const boletim = useBoletim();
  const reduzir = useReducedMotion();

  if (painel.isError) return <FalhaCarregamento tentar={() => void painel.refetch()} />;
  if (painel.isSuccess && painel.data === null) return <SemCadastro />;

  const p = painel.data;
  return (
    <>
      <section className="mt-1.5 mb-7 flex flex-col gap-2">
        <span className="rotulo-mono flex items-center gap-2.5 before:size-3.5 before:border-t-2 before:border-l-2 before:border-orange before:content-['']">
          {p ? `Olá, ${primeiroNome(p.nome)}` : "Carregando seu painel"}
        </span>
        <motion.h1
          initial={reduzir ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="m-0 flex flex-wrap items-center gap-[18px] font-display text-[clamp(30px,3.4vw,44px)] leading-tight font-bold tracking-tight"
        >
          Sua jornada na{" "}
          <span className="bg-[linear-gradient(90deg,var(--color-orange),#fdba74,var(--color-orange))] bg-[length:200%_100%] bg-clip-text text-transparent animate-[brilho-texto_6s_linear_infinite]">
            defesa cibernética
          </span>
          <span aria-hidden="true" className="relative inline-block h-[3px] w-16 overflow-hidden rounded bg-[linear-gradient(90deg,var(--color-orange),transparent)] after:absolute after:inset-0 after:-translate-x-full after:bg-[linear-gradient(90deg,transparent,#fff,transparent)] after:animate-[varrer_2.8s_var(--ease-out-soft)_infinite] after:content-['']" />
        </motion.h1>
        <p className="m-0 text-[16.5px] text-muted">Aprenda na prática, evolua suas habilidades e atue como um analista de SOC.</p>
      </section>

      {!p ? (
        <div aria-busy="true" aria-label="Carregando o painel" className="grid gap-5 lg:grid-cols-[1.15fr_1fr_1.1fr]">
          {[0, 1, 2].map((c) => (
            <div key={c} className="flex flex-col gap-5">
              <div className="painel-card flex flex-col gap-4 p-[22px]">
                <Esqueleto className="h-9 w-48" />
                <Esqueleto className="aspect-[16/8.4] w-full rounded-xl" />
                <Esqueleto className="h-5 w-3/4" />
                <Esqueleto className="h-12 w-full rounded-xl" />
              </div>
              <div className="painel-card flex flex-col gap-3 p-[22px]">
                <Esqueleto className="h-9 w-40" />
                <Esqueleto className="h-24 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1.1fr]">
          <div className="flex flex-col gap-5">
            <CartaoContinuar painel={p} />
            {p.formacoes.map((f, i) => (
              <CartaoFormacao key={f.slug} formacao={f} indice={3 + i} />
            ))}
          </div>
          <div className="flex flex-col gap-5">
            <CartaoBoletim itens={boletim.data ?? []} carregando={boletim.isPending} erro={boletim.isError} />
          </div>
          <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-1">
            <CartaoCompetencias competencias={p.competencias} />
            <CartaoSequencia dias={p.dias_estudo} hoje={p.hoje} />
          </div>
        </div>
      )}
    </>
  );
}
