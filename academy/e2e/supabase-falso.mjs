/**
 * Supabase falso para os testes de ponta a ponta do portal.
 *
 * Responde só o que o portal usa (REST, RPC, Auth e a função academy-acesso),
 * com dados de exemplo e estado em memória. Nada sai para a internet.
 *   POST /__reset   volta ao estado inicial (cada teste começa limpo)
 *   GET  /__estado  o que o portal pediu ao "servidor", para as conferências
 *   GET  /__saude   usado pelo Playwright para saber que o servidor subiu
 */
import http from "node:http";

const PORTA = Number(process.env.PORTA ?? 54399);
const USUARIO = { id: "00000000-0000-4000-8000-000000000001", email: "aluno@exemplo.com", aud: "authenticated", role: "authenticated" };
const VIDEO = { provedor: "youtube", ref: "AKtr_lmAB6Y" };

const MODULOS = [
  ["Introdução", [["Boas-vindas ao curso", "O que vamos estudar e para quem é o curso.", 122]]],
  ["Princípios de segurança", [
    ["Confidencialidade, integridade e disponibilidade", "O vocabulário que sustenta todo o resto do curso.", 1020],
    ["Risco, ameaça, vulnerabilidade e impacto", "Quatro termos que quase todo mundo usa como sinônimo.", 1020],
    ["Defesa em profundidade e menor privilégio", "Por que uma camada só nunca basta.", 960],
  ]],
];
let n = 0;
const CURSO = {
  slug: "cybersecurity-fundamentals",
  titulo: "Cybersecurity Fundamentals",
  descricao: "A base que todo profissional de tecnologia precisa.",
  nivel: "iniciante",
  gratuito: true,
  modulos: MODULOS.map(([titulo, aulas], i) => ({
    id: `m${i}`,
    ordem: i,
    titulo,
    aulas: aulas.map(([t, resumo, duracao], j) => ({ id: `a${++n}`, ordem: j + 1, numero: n, titulo: t, resumo, duracao_seg: duracao })),
  })),
};
const AULAS = CURSO.modulos.flatMap((m) => m.aulas.map((a) => ({ ...a, modulo: m })));

function novoEstado() {
  return {
    progresso: { a1: { posicao_seg: 122, concluida_em: "2026-11-18T10:00:00Z" } },
    pedidosAcesso: [],
    verificacoes: [],
    acessosRegistrados: 0,
    gravacoes: [],
    pedidosVideo: [],
  };
}
let estado = novoEstado();

function painel() {
  const feitas = AULAS.filter((a) => estado.progresso[a.id]?.concluida_em).length;
  const prox = AULAS.find((a) => !estado.progresso[a.id]?.concluida_em) ?? AULAS[AULAS.length - 1];
  return {
    nome: "Everton Nascimento",
    continuar: {
      curso_slug: CURSO.slug, curso_titulo: CURSO.titulo, modulo_ordem: prox.modulo.ordem, modulo_titulo: prox.modulo.titulo,
      aula_id: prox.id, aula_numero: prox.numero, aula_titulo: prox.titulo, duracao_seg: prox.duracao_seg,
      posicao_seg: estado.progresso[prox.id]?.posicao_seg ?? 0, progresso_curso: Math.round((feitas / AULAS.length) * 100),
    },
    cursos: [{ slug: CURSO.slug, titulo: CURSO.titulo, total: AULAS.length, concluidas: feitas, ultimo_acesso: "2026-11-18T10:00:00Z" }],
    formacoes: [{ slug: "analista-soc", titulo: "Formação Analista SOC", aulas_total: AULAS.length, aulas_concluidas: feitas,
      trilhas: [{ slug: "fundamentos", titulo: "Fundamentos", total: AULAS.length, concluidas: feitas }] }],
    competencias: [{ slug: "fundamentos-seguranca", titulo: "Fundamentos de segurança", percentual: 25 }],
    dias_estudo: ["2026-11-17", "2026-11-18"],
    hoje: "2026-11-18",
  };
}

function sessao() {
  const agora = Math.floor(Date.now() / 1000);
  return { access_token: "sessao-e2e", token_type: "bearer", expires_in: 3600, expires_at: agora + 3600, refresh_token: "renovacao-e2e", user: USUARIO };
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" };

http
  .createServer((req, res) => {
    const u = new URL(req.url ?? "/", "http://x");
    const enviar = (corpo, status = 200) => {
      res.writeHead(status, { "Content-Type": "application/json", ...CORS });
      res.end(corpo === undefined ? "" : JSON.stringify(corpo));
    };
    if (req.method === "OPTIONS") return enviar(undefined, 204);
    let bruto = "";
    req.on("data", (c) => (bruto += c));
    req.on("end", () => {
      let corpo = {};
      try {
        corpo = bruto ? JSON.parse(bruto) : {};
      } catch {
        corpo = {};
      }
      switch (u.pathname) {
        case "/__saude":
          return enviar({ ok: true });
        case "/__reset":
          estado = novoEstado();
          return enviar({ ok: true });
        case "/__estado":
          return enviar(estado);
        case "/functions/v1/academy-acesso":
          estado.pedidosAcesso.push(corpo);
          return enviar({ status: "enviado_se_inscrito" }, 202);
        case "/auth/v1/verify":
          estado.verificacoes.push(corpo);
          if (String(corpo.token_hash ?? "").startsWith("vencido")) {
            return enviar({ code: 403, error_code: "otp_expired", msg: "Email link is invalid or has expired" }, 403);
          }
          return enviar(sessao());
        case "/auth/v1/token":
          return enviar(sessao());
        case "/auth/v1/user":
          return enviar(USUARIO);
        case "/auth/v1/logout":
          return enviar(undefined, 204);
        case "/rest/v1/rpc/academy_registrar_acesso":
          estado.acessosRegistrados += 1;
          return enviar({ nome: "Everton Nascimento" });
        case "/rest/v1/rpc/academy_meu_painel":
          return enviar(painel());
        case "/rest/v1/rpc/academy_video_aula":
          estado.pedidosVideo.push(corpo.p_aula_id);
          return enviar(VIDEO);
        case "/rest/v1/rpc/academy_registrar_progresso": {
          estado.gravacoes.push(corpo);
          const atual = estado.progresso[corpo.p_aula_id] ?? { posicao_seg: 0, concluida_em: null };
          estado.progresso[corpo.p_aula_id] = {
            posicao_seg: corpo.p_posicao,
            concluida_em: atual.concluida_em ?? (corpo.p_concluida ? "2026-11-18T12:00:00Z" : null),
          };
          return enviar({ status: "ok", concluida: Boolean(estado.progresso[corpo.p_aula_id].concluida_em) });
        }
        case "/rest/v1/cursos":
          return enviar(CURSO);
        case "/rest/v1/matriculas":
          return enviar({ curso_slug: CURSO.slug });
        case "/rest/v1/progresso_aulas":
          return enviar(Object.entries(estado.progresso).map(([aula_id, p]) => ({ aula_id, ...p })));
        case "/rest/v1/boletim":
          return enviar([]);
        default:
          return enviar({ message: `rota não simulada: ${u.pathname}` }, 404);
      }
    });
  })
  .listen(PORTA, () => console.log(`supabase falso em http://localhost:${PORTA}`));
