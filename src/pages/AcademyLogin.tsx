import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LANDING_PATH } from "@/lib/config";

// Tela de login simulada (protótipo). Sem contas de demonstração — o acesso real
// chega por e-mail após a pré-inscrição confirmada na landing de captura.
const AcademyLogin = () => {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState(false);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setErro(true);
  };

  return (
    <div className="academy-login">
      <Navigation />
      <main style={{ paddingTop: 96, minHeight: "100vh" }}>
        <div className="al-wrap">
          <div className="al-login-card">
            <h1>Área do Aluno</h1>
            <p className="al-sub">Entre para acessar seus cursos, trilhas e certificados da formação.</p>
            <p className="al-sub" style={{ fontSize: 12.5, color: "#F59E0B", marginBottom: 20 }}>
              Portal em desenvolvimento — o acesso será liberado por e-mail após a
              pré-inscrição confirmada na landing gratuita.
            </p>
            <form onSubmit={enviar}>
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
            {erro && (
              <div className="al-erro">
                Login ainda não está disponível — o acesso aos cursos chega por e-mail após a pré-inscrição confirmada.
              </div>
            )}
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
        .al-erro{font-family:var(--mono);font-size:12px;color:var(--red);margin-top:12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:9px 12px;line-height:1.5}
        .al-foot-links{margin-top:20px;font-size:13px;color:var(--muted)}
        .al-link{color:var(--orange2);text-decoration:underline}
        .al-back{display:inline-block;margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--muted)}
        .al-back:hover{color:var(--text)}
      `}</style>
    </div>
  );
};

export default AcademyLogin;
