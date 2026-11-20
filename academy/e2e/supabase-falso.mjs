/**
 * Supabase falso para os testes de ponta a ponta do portal.
 *
 * Responde só o que o portal usa (REST, RPC, Auth e a função academy-acesso),
 * com dados de exemplo e estado em memória. Nada sai para a internet.
 *   POST /__reset   volta ao estado inicial (cada teste começa limpo)
 *   GET  /__estado  o que o portal pediu ao "servidor", para as conferências
 *   GET  /__saude   usado pelo Playwright para saber que o servidor subiu
 *   POST /__cenario aulas todas concluídas e/ou módulo aprovado, para os
 *                   testes da avaliação final e do certificado; equipe
 *                   ("admin" ou "instrutor") abre o painel do instrutor
 *
 * O Módulo 1 tem questões (a primeira alternativa é sempre a certa) e a
 * avaliação final tem um banco de 4 questões, com nota mínima de 75%.
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
  objetivos: ["Explicar a tríade CID com exemplos do dia a dia", "Diferenciar risco, ameaça e vulnerabilidade", "Aplicar menor privilégio e defesa em profundidade"],
  publico: "Quem está começando em tecnologia ou quer migrar para segurança.",
  pre_requisitos: "Nenhum. Saber usar o computador no dia a dia basta.",
  cursos_instrutores: [
    { papel: "instrutor", ordem: 1, instrutores: { id: "i1", nome: "Everton Nascimento", cargo: "Fundador da CyDef", bio: "Especialista em SOC, SIEM e resposta a incidentes.", linkedin: "https://www.linkedin.com/in/exemplo", site: null } },
    { papel: "convidado", ordem: 2, instrutores: { id: "i2", nome: "Matheus", cargo: "Analista de SOC", bio: "", linkedin: null, site: null } },
  ],
  modulos: MODULOS.map(([titulo, aulas], i) => ({
    id: `m${i}`,
    ordem: i,
    titulo,
    resumo: i === 1 ? "Tríade CID, risco e as defesas que sustentam o resto do curso." : "",
    aulas: aulas.map(([t, resumo, duracao], j) => ({ id: `a${++n}`, ordem: j + 1, numero: n, titulo: t, resumo, duracao_seg: duracao })),
  })),
};
const AULAS = CURSO.modulos.flatMap((m) => m.aulas.map((a) => ({ ...a, modulo: m })));

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const banco = (base, temas) =>
  temas.map(([enunciado, alternativas], i) => ({
    id: id(base + i * 10),
    enunciado,
    alternativas: alternativas.map((texto, j) => ({ id: id(base + i * 10 + j + 1), texto })),
    explicacao: `A resposta certa é "${alternativas[0]}".`,
  }));
const QUESTOES_M1 = banco(100, [
  ["Qual pilar da tríade CIA garante que só quem tem permissão lê a informação?", ["Confidencialidade", "Integridade", "Disponibilidade", "Autenticidade"]],
  ["Uma falha que pode ser explorada é chamada de:", ["Vulnerabilidade", "Ameaça", "Impacto", "Risco residual"]],
  ["Dar a cada conta só o acesso de que ela precisa é o princípio do:", ["Menor privilégio", "Defesa em profundidade", "Não repúdio", "Segregação de rede"]],
]);
const QUESTOES_FINAL = banco(500, [
  ["Hash serve principalmente para verificar:", ["Integridade", "Confidencialidade", "Disponibilidade", "Velocidade"]],
  ["Phishing é um ataque de:", ["Engenharia social", "Negação de serviço", "Força bruta", "Injeção de SQL"]],
  ["MFA combina:", ["Fatores de autenticação diferentes", "Duas senhas iguais", "Dois navegadores", "Duas contas"]],
  ["Backup offline protege melhor contra:", ["Ransomware", "Phishing", "Spam", "Shoulder surfing"]],
]);
const publica = (q) => ({ id: q.id, enunciado: q.enunciado, alternativas: q.alternativas });
const corrigir = (qs, respostas) =>
  respostas.map((r) => {
    const q = qs.find((x) => x.id === r.questao);
    return { questao: r.questao, escolhida: r.alternativa, correta: q?.alternativas[0].id === r.alternativa, alternativa_correta: q?.alternativas[0].id, explicacao: q?.explicacao };
  });

function novoEstado() {
  return {
    progresso: { a1: { posicao_seg: 122, concluida_em: "2026-11-18T10:00:00Z" } },
    pedidosAcesso: [],
    verificacoes: [],
    acessosRegistrados: 0,
    gravacoes: [],
    pedidosVideo: [],
    moduloAprovado: false,
    respostasModulo: [],
    provaAberta: null,
    provas: [],
    esperaAte: null,
    certificado: null,
    equipe: null,
    adm: {
      publicado: true,
      modulos: CURSO.modulos.map((m) => ({
        id: m.id, ordem: m.ordem, titulo: m.titulo, resumo: m.resumo, questoes: m.id === "m1" ? 3 : 0, questoes_publicadas: m.id === "m1" ? 3 : 0,
        aulas: m.aulas.map((a) => ({ ...a, modulo_id: m.id, video_provedor: "youtube", video_ref: VIDEO.ref, publicado: true, atualizado_em: "2026-11-18T10:00:00Z", alunos_com_progresso: 1 })),
      })),
    },
    escritasAdm: [],
    nomeAluno: "Everton Nascimento",
    validacaoPublica: true,
    // Fase 11: quem está "logado" no fake (1 envia, 2 aprova) e os materiais.
    pessoa: 1,
    materiais: [],
    arquivos: {},
  };
}

/** Pega o arquivo de um corpo multipart (como o supabase-js envia File). */
function arquivoDoMultipart(req, bytes) {
  const m = /boundary=(.+)$/.exec(req.headers["content-type"] ?? "");
  if (!m) return bytes;
  const limite = Buffer.from(`--${m[1]}`);
  let i = 0;
  while ((i = bytes.indexOf(limite, i)) >= 0) {
    const ini = bytes.indexOf("\r\n\r\n", i);
    if (ini < 0) break;
    const cab = bytes.subarray(i, ini).toString();
    const fim = bytes.indexOf(limite, ini);
    if (/filename=|name=""/.test(cab)) return bytes.subarray(ini + 4, fim - 2);
    i = fim;
  }
  return bytes;
}

const CORS_ST = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" };

/** Storage do Supabase: upload, link assinado, download e remoção. */
function storage(req, res, u, bytes, bruto) {
  const json = (c, st = 200) => {
    res.writeHead(st, { "Content-Type": "application/json", ...CORS_ST });
    res.end(JSON.stringify(c));
  };
  const resto = decodeURIComponent(u.pathname.replace(/^\/storage\/v1\//, ""));
  let m;
  if (req.method === "POST" && (m = /^object\/sign\/academy-materiais\/(.+)$/.exec(resto))) {
    if (!estado.arquivos[m[1]]) return json({ message: "Object not found" }, 400);
    return json({ signedURL: `/object/sign/academy-materiais/${m[1]}?token=e2e` });
  }
  if (req.method === "GET" && (m = /^object\/sign\/academy-materiais\/(.+)$/.exec(resto))) {
    const a = estado.arquivos[m[1]];
    if (!a) return json({ message: "Object not found" }, 404);
    const nome = u.searchParams.get("download");
    res.writeHead(200, { "Content-Type": a.tipo, ...(nome !== null ? { "Content-Disposition": `attachment; filename="${nome || m[1].split("/").pop()}"` } : {}), ...CORS_ST });
    return res.end(a.dados);
  }
  if (req.method === "POST" && (m = /^object\/academy-materiais\/(.+)$/.exec(resto))) {
    const mat = estado.materiais.find((x) => x.caminho === m[1] && x.status === "enviando");
    if (!mat) return json({ statusCode: "403", message: "new row violates row-level security policy" }, 400);
    estado.arquivos[m[1]] = { dados: arquivoDoMultipart(req, bytes), tipo: mat.mime };
    return json({ Key: `academy-materiais/${m[1]}`, Id: m[1] });
  }
  if (req.method === "DELETE") {
    let corpo = {};
    try { corpo = JSON.parse(bruto); } catch { corpo = {}; }
    for (const p of corpo.prefixes ?? []) delete estado.arquivos[p];
    return json([]);
  }
  return json({ message: `storage não simulado: ${req.method} ${resto}` }, 404);
}

function materialJson(m) {
  const mod = CURSO.modulos.find((x) => x.id === m.modulo_id);
  return {
    ...m, curso_titulo: CURSO.titulo, modulo_titulo: mod?.titulo ?? null, modulo_ordem: mod?.ordem ?? null,
    enviado_por_nome: "Everton Nascimento", enviado_por_mim: m.enviado_por === estado.pessoa,
    revisado_por_nome: m.revisado_por ? "Revisor" : null,
  };
}

/** Painel do instrutor: o curso como a equipe vê, com rascunhos. */
function renumerar() {
  let k = 0;
  for (const m of estado.adm.modulos) m.aulas.forEach((a, i) => { a.ordem = i + 1; a.numero = ++k; });
}
function cursoAdm() {
  const todas = estado.adm.modulos.flatMap((m) => m.aulas);
  return {
    slug: CURSO.slug, titulo: CURSO.titulo, descricao: CURSO.descricao, nivel: CURSO.nivel, gratuito: true, publicado: estado.adm.publicado, ordem: 1,
    eh_admin: estado.equipe === "admin",
    requisitos: { exige_todas_aulas: true, exige_modulos: true, nota_minima_modulo: 70, questoes_modulo: 5, nota_minima_final: 75, questoes_final: 4,
      espera_final_horas: 24, tentativas_final_max: null, carga_horaria_h: 6, certificado_ativo: true },
    questoes_final: QUESTOES_FINAL.length, questoes_final_publicadas: QUESTOES_FINAL.length,
    objetivos: CURSO.objetivos, publico: CURSO.publico, pre_requisitos: CURSO.pre_requisitos,
    modulos: estado.adm.modulos,
    _resumo: { aulas: todas.length, aulas_publicadas: todas.filter((a) => a.publicado).length, aulas_sem_video: todas.filter((a) => !a.video_ref).length },
  };
}

function situacao() {
  const feitas = AULAS.filter((a) => estado.progresso[a.id]?.concluida_em).length;
  const aprovadoFinal = estado.provas.some((p) => p.aprovado);
  const preOk = feitas === AULAS.length && estado.moduloAprovado;
  const motivo = aprovadoFinal ? "aprovado" : !preOk ? "requisitos_pendentes" : estado.esperaAte && estado.esperaAte > Date.now() ? "aguarde" : "disponivel";
  return {
    requisitos: { exige_todas_aulas: true, exige_modulos: true, nota_minima_modulo: 70, nota_minima_final: 75, questoes_final: 4, espera_final_horas: 24, tentativas_final_max: null, carga_horaria_h: 6 },
    aulas: { total: AULAS.length, concluidas: feitas },
    modulos: CURSO.modulos.map((m) => ({
      id: m.id, ordem: m.ordem, titulo: m.titulo, tem_questoes: m.id === "m1", aprovado: m.id === "m1" && estado.moduloAprovado, liberado: true,
    })),
    final: {
      situacao: motivo,
      prova_aberta: estado.provaAberta,
      tentativas: estado.provas.length,
      melhor_nota: estado.provas.length ? Math.max(...estado.provas.map((p) => p.nota)) : null,
      proxima_em: motivo === "aguarde" ? new Date(estado.esperaAte).toISOString() : null,
    },
    certificado: {
      elegivel: aprovadoFinal && preOk && !estado.certificado,
      codigo: estado.certificado?.codigo ?? null,
      nome: estado.certificado?.nome ?? null,
      concluido_em: estado.certificado?.concluido_em ?? null,
    },
  };
}
let estado = novoEstado();

function painel() {
  const feitas = AULAS.filter((a) => estado.progresso[a.id]?.concluida_em).length;
  const prox = AULAS.find((a) => !estado.progresso[a.id]?.concluida_em) ?? AULAS[AULAS.length - 1];
  return {
    nome: estado.nomeAluno,
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
    const pedacos = [];
    req.on("data", (c) => pedacos.push(c));
    req.on("end", () => {
      const bytes = Buffer.concat(pedacos);
      const bruto = bytes.toString("utf8");
      if (u.pathname.startsWith("/storage/v1/")) return storage(req, res, u, bytes, bruto);
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
        case "/__cenario":
          if (corpo.aulas_concluidas) for (const a of AULAS) estado.progresso[a.id] = { posicao_seg: a.duracao_seg, concluida_em: "2026-11-18T12:00:00Z" };
          if (corpo.modulo_aprovado) estado.moduloAprovado = true;
          if (corpo.equipe) estado.equipe = corpo.equipe;
          if (corpo.pessoa) estado.pessoa = corpo.pessoa;
          return enviar({ ok: true });
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
        case "/rest/v1/rpc/academy_situacao_curso":
          return enviar(situacao());
        case "/rest/v1/rpc/academy_questoes_modulo":
          if (corpo.p_modulo_id !== "m1") return enviar({ message: "sem_questoes" }, 400);
          return enviar({ modulo_id: "m1", nota_minima: 70, aprovado: estado.moduloAprovado, questoes: QUESTOES_M1.map(publica) });
        case "/rest/v1/rpc/academy_responder_modulo": {
          estado.respostasModulo.push(corpo.p_respostas);
          const correcao = corrigir(QUESTOES_M1, corpo.p_respostas ?? []);
          const acertos = correcao.filter((c) => c.correta).length;
          const nota = Math.round((acertos * 100) / QUESTOES_M1.length);
          if (nota >= 70) estado.moduloAprovado = true;
          return enviar({ acertos, total: QUESTOES_M1.length, nota, nota_minima: 70, aprovado: nota >= 70, correcao });
        }
        case "/rest/v1/rpc/academy_iniciar_final": {
          const s = situacao();
          if (!estado.provaAberta && s.final.situacao !== "disponivel") return enviar({ message: s.final.situacao }, 400);
          estado.provaAberta ??= id(999);
          return enviar({ prova_id: estado.provaAberta, iniciada_em: "2026-11-18T12:00:00Z", questoes: QUESTOES_FINAL.map(publica) });
        }
        case "/rest/v1/rpc/academy_enviar_final": {
          if (corpo.p_prova_id !== estado.provaAberta) return enviar({ message: "prova_indisponivel" }, 400);
          const acertos = corrigir(QUESTOES_FINAL, corpo.p_respostas ?? []).filter((c) => c.correta).length;
          const nota = Math.round((acertos * 100) / QUESTOES_FINAL.length);
          const aprovado = nota >= 75;
          estado.provas.push({ nota, aprovado });
          estado.provaAberta = null;
          if (!aprovado) estado.esperaAte = Date.now() + 24 * 3600_000;
          return enviar({ acertos, total: QUESTOES_FINAL.length, nota, nota_minima: 75, aprovado, proxima_em: aprovado ? null : new Date(estado.esperaAte).toISOString() });
        }
        case "/rest/v1/rpc/academy_emitir_certificado":
          if (!situacao().certificado.elegivel && !estado.certificado) return enviar({ message: "nao_elegivel" }, 400);
          estado.certificado ??= { codigo: "CYD-1A2B-3C4D-5E6F-7A8B", nome: corpo.p_nome, concluido_em: "2026-11-18" };
          return enviar({ ...estado.certificado, curso_titulo: CURSO.titulo, carga_horaria_h: 6 });
        case "/rest/v1/rpc/academy_adm_eu":
          return enviar(estado.equipe ? { papel: estado.equipe, cursos: [CURSO.slug], aprova_materiais: estado.equipe === "admin" } : null);
        case "/rest/v1/rpc/academy_adm_boletim":
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          return enviar([
            { id: "b1", tipo: "aula", titulo: "Módulo 1 completo: defesa em profundidade e menor privilégio", link: null, publicado: true, publicado_em: "2026-11-18T10:00:00Z" },
            { id: "b2", tipo: "ameaca", titulo: "Campanha de phishing com QR code mirando bancos", link: "https://www.cydef.com.br/blog", publicado: false, publicado_em: "2026-11-17T09:00:00Z" },
          ]);
        case "/rest/v1/rpc/academy_adm_equipe":
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          return enviar([
            { user_id: USUARIO.id, email: USUARIO.email, nome: "Everton Nascimento", papel: "admin", eu: true, cursos: [] },
            { user_id: "u2", email: "matheus@exemplo.com", nome: "Matheus", papel: "instrutor", eu: false, cursos: [CURSO.slug] },
          ]);
        case "/rest/v1/rpc/academy_adm_registrar_material": {
          if (!estado.equipe) return enviar({ message: "sem_permissao" }, 400);
          const d = corpo.p_dados ?? {};
          const id = `00000000-0000-4000-8000-${String(900 + estado.materiais.length).padStart(12, "0")}`;
          const nome = String(d.nome_arquivo).replace(/[^A-Za-z0-9._-]+/g, "-");
          const m = { id, curso_slug: corpo.p_curso, modulo_id: d.modulo_id ?? null, titulo: d.titulo, descricao: d.descricao ?? "", nome_arquivo: nome,
            extensao: nome.split(".").pop(), mime: d.mime, tamanho: d.tamanho, sha256: d.sha256, caminho: `${corpo.p_curso}/${id}/${nome}`,
            status: "enviando", ordem: estado.materiais.length + 1, enviado_em: "2026-11-19T12:00:00Z", enviado_por: estado.pessoa,
            revisado_em: null, revisado_por: null, motivo_recusa: null };
          estado.materiais.push(m);
          return enviar({ id, caminho: m.caminho, mime: m.mime });
        }
        case "/rest/v1/rpc/academy_adm_confirmar_envio": {
          const m = estado.materiais.find((x) => x.id === corpo.p_id);
          const a = m && estado.arquivos[m.caminho];
          if (!a) return enviar({ message: "arquivo_ausente" }, 400);
          if (a.dados.length !== m.tamanho) return enviar({ message: "arquivo_divergente" }, 400);
          m.status = "pendente";
          return enviar(materialJson(m));
        }
        case "/rest/v1/rpc/academy_adm_materiais":
          return enviar(estado.materiais.filter((m) => m.status !== "enviando").map(materialJson));
        case "/rest/v1/rpc/academy_adm_aprovacoes":
          return enviar(estado.materiais.filter((m) => m.status === "pendente").map(materialJson));
        case "/rest/v1/rpc/academy_adm_revisar_material": {
          const m = estado.materiais.find((x) => x.id === corpo.p_id && x.status === "pendente");
          if (!m) return enviar({ message: "material_inexistente" }, 400);
          if (m.enviado_por === estado.pessoa) return enviar({ message: "mesma_pessoa" }, 400);
          Object.assign(m, { status: corpo.p_aprovar ? "aprovado" : "recusado", revisado_por: estado.pessoa, revisado_em: "2026-11-19T13:00:00Z", motivo_recusa: corpo.p_motivo ?? null });
          return enviar(estado.materiais.filter((x) => x.status === "pendente").map(materialJson));
        }
        case "/rest/v1/rpc/academy_materiais_curso":
          return enviar(estado.materiais.filter((m) => m.status === "aprovado" && m.curso_slug === corpo.p_curso)
            .map(({ id, modulo_id, titulo, descricao, nome_arquivo, extensao, tamanho, sha256, caminho }) => ({ id, modulo_id, titulo, descricao, nome_arquivo, extensao, tamanho, sha256, caminho })));
        case "/rest/v1/rpc/academy_adm_instrutores": {
          if (!estado.equipe) return enviar({ message: "sem_permissao" }, 400);
          const p = (v) => ({ ...v.instrutores, da_equipe: v.papel === "instrutor", eu: v.instrutores.id === "i1" });
          return enviar({ do_curso: CURSO.cursos_instrutores.map((v) => ({ papel: v.papel, ordem: v.ordem, instrutor: p(v) })), disponiveis: [] });
        }
        case "/rest/v1/rpc/academy_adm_meu_perfil":
          if (!estado.equipe) return enviar({ message: "sem_permissao" }, 400);
          return enviar({ ...CURSO.cursos_instrutores[0].instrutores, da_equipe: true, eu: true });
        case "/rest/v1/rpc/academy_adm_cursos":
        case "/rest/v1/rpc/academy_adm_curso":
        case "/rest/v1/rpc/academy_adm_questoes":
        case "/rest/v1/rpc/academy_adm_salvar_aula":
        case "/rest/v1/rpc/academy_adm_mover_aula": {
          if (!estado.equipe) return enviar({ message: "sem_permissao" }, 400);
          const fn = u.pathname.split("/").pop();
          if (fn === "academy_adm_cursos") {
            const c = cursoAdm();
            return enviar([{ slug: c.slug, titulo: c.titulo, nivel: c.nivel, gratuito: true, publicado: c.publicado, ordem: 1, modulos: c.modulos.length,
              ...c._resumo, questoes: 7, questoes_publicadas: 7 }]);
          }
          if (fn === "academy_adm_curso") return corpo.p_slug === CURSO.slug ? enviar(cursoAdm()) : enviar({ message: "curso_inexistente" }, 400);
          if (fn === "academy_adm_questoes") return enviar([]);
          estado.escritasAdm.push({ fn, ...corpo });
          if (fn === "academy_adm_mover_aula") {
            const m = estado.adm.modulos.find((x) => x.aulas.some((a) => a.id === corpo.p_id));
            const i = m.aulas.findIndex((a) => a.id === corpo.p_id);
            const j = i + corpo.p_direcao;
            if (j < 0 || j >= m.aulas.length) return enviar({ message: "limite" }, 400);
            [m.aulas[i], m.aulas[j]] = [m.aulas[j], m.aulas[i]];
            renumerar();
            return enviar(cursoAdm());
          }
          const d = corpo.p_dados ?? {};
          if (d.publicado && !d.video_ref) return enviar({ message: "aula_sem_video" }, 400);
          const destino = estado.adm.modulos.find((m) => m.id === d.modulo_id);
          let aula;
          if (!corpo.p_id) {
            aula = { id: `nova${estado.escritasAdm.length}`, modulo_id: destino.id, alunos_com_progresso: 0, atualizado_em: "2026-11-19T10:00:00Z" };
            destino.aulas.push(aula);
          } else {
            aula = estado.adm.modulos.flatMap((m) => m.aulas).find((a) => a.id === corpo.p_id);
          }
          Object.assign(aula, { titulo: d.titulo, resumo: d.resumo, duracao_seg: d.duracao_seg, video_provedor: d.video_provedor, video_ref: d.video_ref, publicado: Boolean(d.publicado) });
          renumerar();
          return enviar(aula);
        }
        case "/rest/v1/rpc/academy_atualizar_nome": {
          const n = String(corpo.p_nome ?? "").trim().replace(/\s+/g, " ");
          if (n.length < 2 || n.length > 80) return enviar({ message: "nome_invalido" }, 400);
          estado.nomeAluno = n;
          return enviar({ nome: n });
        }
        case "/rest/v1/rpc/academy_meus_certificados":
        case "/rest/v1/rpc/academy_validacao_publica": {
          if (u.pathname.endsWith("validacao_publica") && estado.certificado) estado.validacaoPublica = Boolean(corpo.p_ativa);
          return enviar(estado.certificado ? [{ ...estado.certificado, curso_slug: CURSO.slug, curso_titulo: CURSO.titulo, carga_horaria_h: 6, validacao_publica: estado.validacaoPublica }] : []);
        }
        case "/rest/v1/rpc/academy_meus_dados":
          return enviar({ gerado_em: "2026-11-19T12:00:00Z", conta: { nome: estado.nomeAluno, email: USUARIO.email }, matriculas: [{ curso: CURSO.titulo }], certificados: [] });
        case "/rest/v1/rpc/academy_meu_certificado":
          return enviar(estado.certificado ? { ...estado.certificado, curso_titulo: CURSO.titulo, carga_horaria_h: 6, modelo: "claro", conteudo: ["Princípios de segurança"] } : null);
        case "/rest/v1/rpc/academy_validar_certificado":
          if (!estado.certificado || !estado.validacaoPublica || String(corpo.p_codigo ?? "").toUpperCase() !== estado.certificado.codigo) return enviar(null);
          return enviar({ codigo: estado.certificado.codigo, nome: estado.certificado.nome, curso: CURSO.titulo, carga_horaria_h: 6, concluido_em: estado.certificado.concluido_em });
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
