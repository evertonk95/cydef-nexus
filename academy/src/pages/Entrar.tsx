import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Navigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Lock, Mail, ShieldCheck } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { emailValido, pedirLinkDeAcesso } from "@/lib/acesso";
import { Botao } from "@/components/ui/Botao";
import { Logo } from "@/components/ui/Logo";
import { Turnstile } from "@/components/Turnstile";
import { urlAviso } from "@/lib/privacidade";

/**
 * Espera antes de pedir outro link para o mesmo e-mail. Cada pedido novo
 * cancela o link anterior e, enquanto um provedor (como o Outlook) segura os
 * e-mails de um remetente novo, pedido repetido só aumenta a fila.
 */
const ESPERA_REENVIO = 300;

function mmss(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const MENSAGENS = {
  email_invalido: "Digite um e-mail válido, como nome@empresa.com.br.",
  muitas_tentativas: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
  verificacao_falhou: "A verificação de segurança expirou. Tente enviar de novo.",
  indisponivel: "Não foi possível enviar agora. Confira a conexão e tente de novo.",
} as const;

export default function Entrar() {
  const { config, sessao, carregando } = usePortal();
  const reduzir = useReducedMotion();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [reinicio, setReinicio] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [espera, setEspera] = useState(0);
  const [tremer, setTremer] = useState(0);
  const campoId = useId();
  const erroId = useId();
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (espera <= 0) return;
    const t = window.setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [espera]);

  const aoToken = useCallback((t: string) => setToken(t), []);

  if (!carregando && sessao) return <Navigate to="/" replace />;

  const enviar = async (e?: FormEvent) => {
    e?.preventDefault();
    setErro(null);
    if (!emailValido(email)) {
      setErro(MENSAGENS.email_invalido);
      setTremer((n) => n + 1);
      campo.current?.focus();
      return;
    }
    if (!token) {
      setErro("Aguarde a verificação de segurança terminar e envie de novo.");
      return;
    }
    setEnviando(true);
    const r = await pedirLinkDeAcesso(config.acessoApiUrl, {
      email,
      turnstileToken: token,
      requestId: crypto.randomUUID(),
    });
    setEnviando(false);
    setReinicio((n) => n + 1);
    if (r.ok) {
      setEnviado(email.trim());
      setEspera(ESPERA_REENVIO);
    } else {
      setErro(MENSAGENS[r.motivo]);
      setTremer((n) => n + 1);
    }
  };

  return (
    <div className="relative min-h-dvh">
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-[1240px] items-center gap-10 px-5 py-10 lg:grid-cols-[1.1fr_480px] lg:px-8">
        <section className="hidden lg:block" aria-hidden="true">
          <h2 className="m-0 mb-5 font-display text-[52px] leading-[1.05] font-semibold tracking-tight">
            A central de treinamento
            <br />
            da CyDef.
          </h2>
          <p className="m-0 max-w-[46ch] text-lg leading-relaxed text-muted">
            Aulas, questões e missões práticas de SOC num lugar só, com o seu progresso salvo a cada passo.
          </p>
          <ul className="m-0 mt-8 flex list-none flex-col gap-3 p-0 text-muted">
            <li className="flex items-center gap-3"><ShieldCheck className="size-5 text-muted" /> Acesso sem senha, por link no seu e-mail</li>
            <li className="flex items-center gap-3"><Lock className="size-5 text-muted" /> Cada link vale uma vez e expira em pouco tempo</li>
          </ul>
        </section>

        <motion.section
          key={tremer}
          initial={reduzir ? false : tremer ? { x: 0 } : { opacity: 0, y: 16 }}
          animate={tremer && !reduzir ? { x: [0, -7, 6, -4, 2, 0] } : { opacity: 1, y: 0 }}
          transition={{ duration: tremer ? 0.4 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="painel-card mx-auto w-full max-w-[480px] p-7 sm:p-9"
          aria-labelledby="titulo-entrar"
        >
          <div className="mb-8">
            <Logo para="/entrar" />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {enviado ? (
              <motion.div
                key="enviado"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.22 } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <CheckCircle2 className="mb-4 size-11 text-ok" aria-hidden="true" />
                <h1 id="titulo-entrar" className="m-0 mb-3 font-display text-[26px] font-semibold">Confira seu e-mail</h1>
                <p className="m-0 mb-3 leading-relaxed text-[#d6d6d6]" role="status">
                  Se <b className="break-all text-ink">{enviado}</b> tem inscrição na CyDef Academy, o link de acesso chega em alguns minutos.
                </p>
                <ul className="m-0 mb-7 flex list-none flex-col gap-1.5 p-0 text-sm leading-relaxed text-muted">
                  <li>Em Hotmail e Outlook, a entrega pode demorar um pouco mais. Olhe também o lixo eletrônico.</li>
                  <li>Pedir outro link cancela o anterior. Se puder, espere o primeiro chegar.</li>
                  <li>O link vale uma vez, por 60 minutos.</li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Botao variante="fantasma" className="px-4 py-2.5 text-sm" disabled={espera > 0 || enviando} onClick={() => void enviar()}>
                    {espera > 0 ? `Pedir outro link em ${mmss(espera)}` : "Pedir outro link"}
                  </Botao>
                  <Botao variante="fantasma" className="px-4 py-2.5 text-sm" onClick={() => { setEnviado(null); setEmail(""); }}>
                    Usar outro e-mail
                  </Botao>
                </div>
                {erro && <p role="alert" className="mt-4 mb-0 text-sm text-bad">{erro}</p>}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={(e) => void enviar(e)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.22 } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <h1 id="titulo-entrar" className="m-0 mb-2 font-display text-[28px] font-semibold">Entrar na Academy</h1>
                <p className="m-0 mb-7 leading-relaxed text-muted">Digite o e-mail da sua inscrição. Enviamos um link de acesso, sem senha.</p>
                <label htmlFor={campoId} className="mb-2 block text-sm font-medium">E-mail</label>
                <div className="relative mb-4">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-dim" aria-hidden="true" />
                  <input
                    ref={campo}
                    id={campoId}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(erro)}
                    aria-describedby={erro ? erroId : undefined}
                    placeholder="nome@empresa.com.br"
                    className="w-full rounded-[10px] border border-line-hi bg-bg py-3.5 pr-4 pl-11 text-base text-ink transition-colors duration-150 outline-none placeholder:text-dim focus:border-orange-hi aria-[invalid=true]:border-bad"
                  />
                </div>
                <Turnstile siteKey={config.turnstileSiteKey} reinicio={reinicio} aoToken={aoToken} />
                {erro && <p id={erroId} role="alert" className="mt-3 mb-0 text-sm text-bad">{erro}</p>}
                <Botao type="submit" className="mt-5 w-full py-4 text-[17px]" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar link de acesso"}
                </Botao>
                <p className="mt-6 mb-0 text-center text-sm text-muted">
                  Ainda não tem inscrição?{" "}
                  <a href={`${config.siteUrl}/academy/gratuito`} className="font-medium text-ink underline underline-offset-[3px]">
                    Inscreva-se grátis
                  </a>
                </p>
                <p className="mt-3 mb-0 text-center text-xs text-dim">
                  <a href={urlAviso(config.siteUrl)} target="_blank" rel="noopener" className="underline underline-offset-[3px] hover:text-muted">
                    Aviso de privacidade
                  </a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}
