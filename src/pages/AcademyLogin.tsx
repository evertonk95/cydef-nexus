import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LANDING_PATH } from "@/lib/config";

type View = "login" | "dash" | "pend";

interface Conta {
  nome: string;
  email: string;
  perfil: string;
  status: "confirmed" | "pending_confirmation";
  ola: string;
}

const CONTAS: Record<string, Conta> = {
  "ana.teste1@example.com": { nome: "Ana Beatriz Souza", email: "ana.teste1@example.com", perfil: "estudante", status: "confirmed", ola: "Ana" },
  "bruno.teste2@example.com": { nome: "Bruno Ferreira Lima", email: "bruno.teste2@example.com", perfil: "iniciante", status: "confirmed", ola: "Bruno" },
  "carla.teste3@example.com": { nome: "Carla Mendes Rocha", email: "carla.teste3@example.com", perfil: "transicao", status: "confirmed", ola: "Carla" },
  "diego.teste4@example.com": { nome: "Diego Almeida Santos", email: "diego.teste4@example.com", perfil: "profissional", status: "confirmed", ola: "Diego" },
  "elisa.teste5@example.com": { nome: "Elisa Farias Duarte", email: "elisa.teste5@example.com", perfil: "outro", status: "pending_confirmation", ola: "Elisa" },
};

const MODULOS = [
  { num: "M01", nome: "Fundamentos de Segurança", st: "LIBERADO" },
  { num: "M02", nome: "Redes e Logs", st: "EM BREVE" },
  { num: "M03", nome: "Operação de SIEM", st: "EM BREVE" },
  { num: "M04", nome: "Triagem e Investigação", st: "EM BREVE" },
  { num: "M05", nome: "MITRE ATT&CK na prática", st: "EM BREVE" },
];

const AcademyLogin = () => {
  const [view, setView] = useState<View>("login");
  const [conta, setConta] = useState<Conta | null>(null);
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState(false);
  const [params] = useSearchParams();

  const entrar = (rawEmail: string) => {
    const e = rawEmail.trim().toLowerCase();
    const c = CONTAS[e];
    if (!c) {
      setErro(true);
      return;
    }
    setErro(false);
    setConta(c);
    setView(c.status === "confirmed" ? "dash" : "pend");
  };

  // ?demo=ana | ?demo=elisa → auto-login (demo direta / screenshots)
  useEffect(() => {
    const demo = params.get("demo");
    if (demo === "ana") entrar("ana.teste1@example.com");
    else if (demo === "elisa") entrar("elisa.teste5@example.com");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sair = () => {
    setView("login");
    setConta(null);
    setEmail("");
    setErro(false);
  };

  return (
    <div className="academy-login">
      <Navigation />
      <main style={{ paddingTop: 96, minHeight: "100vh" }}>
        <div className="al-wrap">
          {/* ============ LOGIN ============ */}
          {view === "login" && (
            <div className="al-login-card">
              <h1>Área do Aluno</h1>
              <p className="al-sub">Entre para acessar seus cursos, trilhas e certificados da formação.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  entrar(email);
                }}
              >
                <div className="al-field">
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    autoComplete="off"
                  />
                </div>
                <div className="al-field">
                  <label>Senha</label>
                  <input type="password" placeholder="•••••••• (simulada)" />
                </div>
                <button type="submit" className="al-btn">
                  Entrar
                </button>
              </form>
              {erro && <div className="al-erro">Conta não encontrada. Use uma das contas de teste abaixo.</div>}
              <div className="al-testes">
                <div className="al-t-title">Contas de teste · clique para entrar</div>
                <div className="al-chips">
                  {Object.entries(CONTAS).map(([em, c]) => (
                    <button key={em} className="al-chip" onClick={() => entrar(em)}>
                      {c.nome.split(" ")[0]} {c.nome.split(" ")[1] || ""} ·{" "}
                      {c.status === "confirmed" ? <span className="al-ok">✔ aprovada</span> : <span className="al-wait">⏳ pendente</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="al-foot-links">
                <span>Não tem conta? </span>
                <Link to={LANDING_PATH} className="al-link">
                  Pré-inscreva-se no curso gratuito
                </Link>
              </div>
              <Link to="/academy" className="al-back">
                ← Voltar para a Academy
              </Link>
            </div>
          )}

          {/* ============ DASHBOARD (confirmado) ============ */}
          {view === "dash" && conta && (
            <>
              <div className="al-dash-head">
                <h1>Olá, {conta.ola}! 👋</h1>
                <span className="al-badge al-badge-ok">CONFIRMADO · ACESSO LIBERADO</span>
              </div>
              <div className="al-sessao">
                {conta.nome} · {conta.email} · perfil: {conta.perfil}
              </div>
              <div className="al-banner-prod">
                ⚙️ <span>
                  <b>Prévia da experiência.</b> O conteúdo dos cursos está em produção — esta tela mostra como
                  ficará a área do aluno quando as aulas estiverem disponíveis.
                </span>
              </div>
              <div className="al-grid">
                <div>
                  <div className="al-card">
                    <div className="al-card-label">// Meus cursos</div>
                    <div className="al-curso">
                      <div>
                        <div className="al-curso-nome">Formação SOC Analyst</div>
                        <div className="al-curso-desc">
                          Fundamentos para SOC + Cybersecurity Fundamentals · Trilha de entrada
                        </div>
                      </div>
                      <span className="al-tag-curso">✔ Acesso liberado</span>
                    </div>
                    <div className="al-progresso">
                      <div className="al-linha">
                        <div className="al-fill"></div>
                      </div>
                      <div className="al-txt">
                        <span>0% concluído</span>
                        <span>0 / 24 aulas</span>
                      </div>
                    </div>
                    <div className="al-btn-blocked">📦 Conteúdo em produção — aulas chegam em breve</div>
                    <div className="al-modulos">
                      {MODULOS.map((m) => (
                        <div key={m.num} className="al-mod">
                          <span className="al-num">{m.num}</span>
                          <span className="al-mod-nome">{m.nome}</span>
                          <span className={`al-st ${m.st === "LIBERADO" ? "al-st-open" : "al-st-soon"}`}>{m.st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="al-lateral">
                  <div className="al-card">
                    <div className="al-card-label">// Minha trilha</div>
                    <div className="al-stat">
                      <span>Progresso</span>
                      <span className="al-v">0%</span>
                    </div>
                    <div className="al-stat">
                      <span>Aulas concluídas</span>
                      <span className="al-v">0</span>
                    </div>
                    <div className="al-stat">
                      <span>Dias de atividade</span>
                      <span className="al-v">0</span>
                    </div>
                    <div className="al-lock-msg">🔒 Certificado será liberado ao concluir a formação.</div>
                  </div>
                  <div className="al-card">
                    <div className="al-card-label">// Status da conta</div>
                    <div className="al-stat">
                      <span>Cadastro</span>
                      <span className="al-v" style={{ color: "#22C55E" }}>
                        Confirmado
                      </span>
                    </div>
                    <div className="al-stat">
                      <span>Acesso aos cursos</span>
                      <span className="al-v" style={{ color: "#22C55E" }}>
                        Liberado
                      </span>
                    </div>
                    <div className="al-stat">
                      <span>Plano</span>
                      <span className="al-v" style={{ color: "#F69021" }}>
                        Curso gratuito
                      </span>
                    </div>
                  </div>
                  <button className="al-btn-sair" onClick={sair}>
                    Sair da conta
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ============ PENDENTE ============ */}
          {view === "pend" && conta && (
            <div className="al-pend-card">
              <div className="al-ico">⏳</div>
              <span className="al-badge al-badge-wait" style={{ display: "inline-block", marginBottom: 14 }}>
                AGUARDANDO CONFIRMAÇÃO
              </span>
              <h1>Olá, {conta.ola}!</h1>
              <p>
                Recebemos sua pré-inscrição. O acesso aos cursos será liberado assim que a confirmação do
                cadastro for concluída — acompanhe seu e-mail.
              </p>
              <div className="al-curso-lock">
                🔒&nbsp;{" "}
                <span>
                  <b>Fundamentos para SOC</b>
                  <br />
                  <span style={{ color: "#9CA3AF", fontSize: 12 }}>Bloqueado até a confirmação</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button className="al-btn al-btn-inline" onClick={sair}>
                  Trocar de conta
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        .academy-login{--bg:#0A0A0C;--panel:#131318;--panel2:#17171D;--border:#24242C;--orange:#F46B27;--orange2:#F69021;--green:#22C55E;--amber:#F59E0B;--red:#EF4444;--text:#EDEDF0;--muted:#9CA3AF;--mono:'Cascadia Code',Consolas,'Courier New',monospace;background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
        .al-wrap{max-width:1080px;margin:0 auto;padding:24px 24px 60px}
        .al-login-card{max-width:440px;margin:0 auto;background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:36px 32px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
        .al-login-card h1{font-size:22px;margin-bottom:6px}
        .al-sub{color:var(--muted);font-size:13.5px;margin-bottom:24px}
        .al-field{margin-bottom:16px}
        .al-field label{display:block;font-family:var(--mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px}
        .al-field input{width:100%;background:#0E0E12;border:1px solid var(--border);border-radius:9px;color:var(--text);font-size:14px;padding:11px 13px;outline:none;box-sizing:border-box}
        .al-field input:focus{border-color:var(--orange)}
        .al-btn{display:block;width:100%;background:linear-gradient(90deg,var(--orange),var(--orange2));border:none;border-radius:9px;color:#0A0A0C;font-weight:700;font-size:14.5px;padding:12px;cursor:pointer;margin-top:6px;font-family:inherit}
        .al-btn:hover{filter:brightness(1.08)}
        .al-btn-inline{width:auto;display:inline-block;padding:12px 22px}
        .al-erro{font-family:var(--mono);font-size:12px;color:var(--red);margin-top:12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:9px 12px}
        .al-testes{margin-top:26px;border-top:1px dashed var(--border);padding-top:18px}
        .al-t-title{font-family:var(--mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
        .al-chips{display:flex;flex-wrap:wrap;gap:8px}
        .al-chip{font-size:12px;padding:7px 12px;border-radius:999px;border:1px solid var(--border);background:var(--panel2);color:var(--text);cursor:pointer;font-family:inherit}
        .al-chip:hover{border-color:var(--orange)}
        .al-ok{color:var(--green)} .al-wait{color:var(--amber)}
        .al-foot-links{margin-top:20px;font-size:13px;color:var(--muted)}
        .al-link{color:var(--orange2);text-decoration:underline}
        .al-back{display:inline-block;margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--muted)}
        .al-back:hover{color:var(--text)}
        .al-dash-head{display:flex;align-items:center;gap:14px;margin-bottom:8px;flex-wrap:wrap}
        .al-dash-head h1{font-size:24px}
        .al-badge{font-family:var(--mono);font-size:11px;padding:5px 12px;border-radius:999px;letter-spacing:.5px}
        .al-badge-ok{color:var(--green);border:1px solid rgba(34,197,94,.45);background:rgba(34,197,94,.09)}
        .al-badge-wait{color:var(--amber);border:1px solid rgba(245,158,11,.45);background:rgba(245,158,11,.09)}
        .al-sessao{font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:22px}
        .al-banner-prod{display:flex;gap:10px;align-items:center;background:rgba(244,107,39,.07);border:1px solid rgba(244,107,39,.28);border-radius:10px;padding:12px 16px;margin-bottom:26px;font-size:13.5px;color:#F5C7AC}
        .al-banner-prod b{color:var(--orange2)}
        .al-grid{display:grid;grid-template-columns:1fr 320px;gap:22px}
        @media(max-width:860px){.al-grid{grid-template-columns:1fr}}
        .al-card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:22px;margin-bottom:16px}
        .al-card-label{font-family:var(--mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px}
        .al-curso{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
        .al-curso-nome{font-size:19px;font-weight:700;margin-bottom:4px}
        .al-curso-desc{color:var(--muted);font-size:13.5px;margin-bottom:14px}
        .al-tag-curso{font-family:var(--mono);font-size:11px;color:var(--green);border:1px solid rgba(34,197,94,.4);background:rgba(34,197,94,.08);border-radius:999px;padding:4px 10px;white-space:nowrap}
        .al-progresso{margin:16px 0 6px}
        .al-linha{height:8px;background:#0E0E12;border:1px solid var(--border);border-radius:99px;overflow:hidden}
        .al-fill{height:100%;width:0%;background:linear-gradient(90deg,var(--orange),var(--orange2))}
        .al-txt{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:7px}
        .al-btn-blocked{display:block;width:100%;text-align:center;background:transparent;border:1px dashed #3A3A44;color:var(--muted);border-radius:9px;padding:11px;font-size:13.5px;margin-top:14px;cursor:not-allowed}
        .al-modulos{margin-top:22px}
        .al-mod{display:flex;align-items:center;gap:14px;padding:13px 14px;border:1px solid var(--border);border-radius:10px;margin-bottom:9px;background:var(--panel2)}
        .al-num{font-family:var(--mono);font-size:11px;color:var(--muted);width:44px;flex-shrink:0}
        .al-mod-nome{flex:1;font-size:13.5px}
        .al-st{font-family:var(--mono);font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;padding:3px 9px;border-radius:99px}
        .al-st-open{color:var(--green);border:1px solid rgba(34,197,94,.4);background:rgba(34,197,94,.08)}
        .al-st-soon{color:var(--muted);border:1px solid var(--border)}
        .al-stat{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dashed var(--border);font-size:13px}
        .al-stat:last-child{border-bottom:none}
        .al-v{font-family:var(--mono);color:var(--orange2);font-weight:700}
        .al-lock-msg{font-family:var(--mono);font-size:11.5px;color:var(--muted);display:flex;gap:8px;align-items:center;margin-top:12px}
        .al-btn-sair{width:100%;background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:9px;padding:10px;font-size:13px;cursor:pointer;font-family:inherit}
        .al-btn-sair:hover{color:var(--text);border-color:#3A3A44}
        .al-pend-card{max-width:560px;margin:20px auto 0;background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:34px;text-align:center}
        .al-ico{width:52px;height:52px;margin:0 auto 18px;border-radius:14px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);display:flex;align-items:center;justify-content:center;font-size:24px}
        .al-pend-card h1{font-size:21px;margin-bottom:8px}
        .al-pend-card p{color:var(--muted);font-size:14px;line-height:1.55;margin-bottom:22px}
        .al-curso-lock{display:flex;align-items:center;gap:10px;text-align:left;background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:13px 15px;margin-bottom:20px}
      `}</style>
    </div>
  );
};

export default AcademyLogin;
