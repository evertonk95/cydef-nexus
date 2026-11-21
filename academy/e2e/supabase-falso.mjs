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
import { readFileSync } from "node:fs";
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
    // Fase 14: vitrine do curso pago de exemplo e trilhas.
    vitrine: { situacao: "em_breve", checkout_url: null, hotmart_produto_id: null, preco_centavos: null, preco_observacao: "", preco_conferido_em: null, trilhas: ["soc"] },
    // Fase 16: acessos pagos e produtos da Hotmart.
    concessoes: [{
      id: "c1", email: "pessoal@exemplo.com", nome: "Bia Compradora", origem: "hotmart", escopo: "curso", curso: "soc-analyst", trilha: null, cursos: [],
      alvo: "SOC Analyst: Formação Completa", inicio: "2026-11-19T15:00:00Z", fim: null, transacao: "HP1234567890", produto: 1001,
      revogada_em: null, motivo: null, conta: false, situacao: "ativa", criado_em: "2026-11-19T15:00:00Z",
    }],
    produtos: [{ hotmart_produto_id: 3003, nome: "Academy completa por 12 meses", escopo: "plataforma", trilha: null, trilha_titulo: null, duracao_dias: 365, ativo: true, vendas: 0,
      situacao: "a_venda", checkout_url: "https://pay.hotmart.com/P1234567Q", preco_centavos: 99700, preco_observacao: "ou em até 12x no cartão", preco_conferido_em: "2026-11-20T12:00:00Z" }],
    // Fase 17: empresas. Começa vazio; /__cenario { empresa: "convite" } cria o convite do aluno.
    empresas: [],
    membros: [],
    // Fase 15: missões. Começa sem; /__cenario { missao: true } publica a MSN-001.
    missoes: [],
    tentativasMissao: [],
    enviosConvite: [],
    trilhas: [
      { slug: "soc", titulo: "SOC", descricao: "Para quem quer trabalhar em um Centro de Operações de Segurança.", publicado: true, formacao: null },
      { slug: "blue-team", titulo: "Blue Team", descricao: "Defesa em profundidade.", publicado: true, formacao: null },
      { slug: "red-team", titulo: "Red Team", descricao: "Do lado de quem ataca, com autorização.", publicado: true, formacao: null },
    ],
  };
}

/** Curso pago de exemplo (fase 14): o que o site anunciava, agora no banco. */
const PAGO = {
  slug: "soc-analyst",
  titulo: "SOC Analyst: Formação Completa",
  descricao: "Formação completa para atuar como Analista SOC Nível 1 e 2, com foco em detecção, análise e resposta a incidentes.",
  nivel: "intermediario",
  objetivos: ["Dominar análise de logs e correlação de eventos", "Operar SIEM e ferramentas de detecção", "Investigar e responder a incidentes"],
  publico: "Profissionais que desejam atuar em SOC.",
  pre_requisitos: "Conhecimentos em redes e sistemas operacionais.",
  modulos: [
    { ordem: 1, titulo: "Introdução ao SOC", resumo: "Estrutura e processos de um SOC; papéis e responsabilidades; métricas.", aulas: [] },
    { ordem: 2, titulo: "Análise de Logs", resumo: "Logs de sistemas operacionais, rede e aplicações; correlação de eventos.", aulas: [] },
  ],
};
const CHECKOUT = /^https:\/\/(pay|checkout)\.hotmart\.com\/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$/;

function vitrineAdm() {
  const v = estado.vitrine;
  return {
    curso: PAGO.slug, situacao: v.situacao, situacao_efetiva: v.situacao, checkout_url: v.checkout_url, hotmart_produto_id: v.hotmart_produto_id,
    preco_centavos: v.preco_centavos, preco_observacao: v.preco_observacao, preco_conferido_em: v.preco_conferido_em, atualizado_em: `2026-11-19T1${estado.escritasAdm.length % 10}:00:00Z`,
    trilhas: estado.trilhas.map((t) => ({ slug: t.slug, titulo: t.titulo, publicado: t.publicado, no_curso: v.trilhas.includes(t.slug) })),
    pendencias: ["sem_instrutor"],
  };
}

function trilhasAdm() {
  return estado.trilhas.map((t, i) => ({
    ...t, ordem: i + 1,
    cursos: estado.vitrine.trilhas.includes(t.slug) ? [{ slug: PAGO.slug, titulo: PAGO.titulo, ordem: 1, situacao: estado.vitrine.situacao }] : [],
  }));
}

function catalogoPublico() {
  const v = estado.vitrine;
  const ofertas = estado.produtos.filter((p) => p.situacao === "a_venda" && p.ativo).map((p) => ({
    tipo: p.escopo, nome: p.nome, trilha: p.trilha, duracao_dias: p.duracao_dias, cursos: 1,
    preco_centavos: p.preco_centavos, preco_observacao: p.preco_observacao, checkout_url: p.checkout_url,
  }));
  if (v.situacao === "oculto") return { trilhas: [], cursos: [], ofertas };
  const venda = v.situacao === "a_venda";
  return {
    trilhas: estado.trilhas.filter((t) => t.publicado && v.trilhas.includes(t.slug)).map((t) => ({ slug: t.slug, titulo: t.titulo, descricao: t.descricao, cursos: [PAGO.slug] })),
    cursos: [{
      ...PAGO, situacao: v.situacao, carga_horaria_h: 80,
      preco_centavos: venda ? v.preco_centavos : null, preco_observacao: venda ? v.preco_observacao : "", checkout_url: venda ? v.checkout_url : null,
      trilhas: v.trilhas,
      instrutores: [{ nome: "Everton Nascimento", cargo: "Wazuh Ambassador", bio: "Especialista em SOC e SIEM.", linkedin: null, site: null, papel: "instrutor" }],
      atualizado_em: "2026-11-19T12:00:00Z",
    }],
    ofertas,
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
    competencias: competenciasFalsas(),
    missao: proximaMissao(),
    dias_estudo: ["2026-11-17", "2026-11-18"],
    hoje: "2026-11-18",
  };
}

// Fase 15: missões ---------------------------------------------------------------

const MISSAO_EXEMPLO = JSON.parse(readFileSync(new URL("../src/test/missao-exemplo.json", import.meta.url), "utf8"));

const aprovadaM = (m) => estado.tentativasMissao.some((t) => t.missao === m.id && t.aprovado);

function competenciasFalsas() {
  const base = [{ slug: "fundamentos-seguranca", titulo: "Fundamentos de segurança", percentual: 25 }];
  if (estado.missoes.length === 0) return base;
  return [...base, { slug: "triagem-alertas", titulo: "Triagem de alertas", percentual: estado.missoes.some(aprovadaM) ? 70 : 60 }];
}

function missaoResumo(m) {
  const notas = estado.tentativasMissao.filter((t) => t.missao === m.id).map((t) => t.nota);
  return {
    id: m.id, codigo: m.codigo, slug: m.slug, titulo: m.titulo, severidade: m.severidade, mitre: m.mitre, briefing: m.briefing, selo: m.selo,
    requisito: m.requisito, curso: m.curso, curso_titulo: CURSO.titulo, perguntas_total: m.perguntas.length,
    competencias: [{ slug: "triagem-alertas", titulo: "Triagem de alertas" }],
    situacao: "liberada", aulas_total: AULAS.length, aulas_concluidas: AULAS.length,
    melhor_nota: notas.length ? Math.max(...notas) : null, aprovada: aprovadaM(m), tentativas: notas.length,
  };
}

function proximaMissao() {
  const m = estado.missoes.find((x) => x.publicado && !aprovadaM(x));
  return m ? missaoResumo(m) : null;
}

function missaoAluno(m) {
  const ts = estado.tentativasMissao.filter((t) => t.missao === m.id);
  const ultima = [...ts].reverse().find((t) => t.enviada_em) ?? null;
  const aberta = ts.find((t) => !t.enviada_em) ?? null;
  return {
    ...missaoResumo(m), encerramento: ultima ? m.encerramento : "", evidencias: m.evidencias,
    perguntas: m.perguntas.map((p) => ({ id: p.id, enunciado: p.enunciado, dica: p.dica, alternativas: p.alternativas, multipla: p.corretas.length > 1 })),
    aberta: aberta ? { iniciada_em: aberta.iniciada_em } : null,
    ultima: ultima ? ultima.json : null,
  };
}

function corrigirMissao(m, t, respostas, evidencias) {
  const correcao = m.perguntas.map((p) => {
    const esc = [...new Set((respostas[p.id] ?? []).map(Number))].sort((a, b) => a - b);
    const cor = [...p.corretas].sort((a, b) => a - b);
    return { id: p.id, enunciado: p.enunciado, alternativas: p.alternativas, escolhidas: esc, corretas: cor, explicacao: p.explicacao, acertou: JSON.stringify(esc) === JSON.stringify(cor) };
  });
  const acertos = correcao.filter((c) => c.acertou).length;
  const nota = Math.round((acertos * 100) / correcao.length);
  const antes = estado.missoes.some(aprovadaM) ? 70 : 60;
  Object.assign(t, { enviada_em: "2026-11-20T12:07:05Z", nota, aprovado: nota >= 80 });
  t.json = {
    id: t.id, enviada_em: t.enviada_em, acertos, total: correcao.length, nota, aprovado: nota >= 80, duracao_seg: 425, evidencias: evidencias.slice(0, 30),
    correcao, encerramento: m.encerramento,
    competencias: [{ slug: "triagem-alertas", titulo: "Triagem de alertas", antes, depois: nota >= 80 ? 70 : antes }],
  };
  return t.json;
}

// Fase 17: empresas --------------------------------------------------------------

function membroNovo(empresaId, email, gestor) {
  return { id: `m${Math.random().toString(16).slice(2, 10)}`, empresa_id: empresaId, email, gestor, situacao: "convidado", nome: null,
    convidado_em: "2026-11-20T12:00:00Z", convite_enviado_em: null, aceito_em: null, ultimo_acesso: null, cursos: [] };
}

const usadas = (e) => estado.membros.filter((m) => m.empresa_id === e.id && ["convidado", "ativo"].includes(m.situacao)).length;

function empresaJson(e) {
  const ms = estado.membros.filter((m) => m.empresa_id === e.id);
  return {
    ...e, alvo: e.escopo === "plataforma" ? "Plataforma toda" : e.escopo === "trilha" ? "Trilha SOC" : PAGO.titulo,
    usadas: usadas(e), ativos: ms.filter((m) => m.situacao === "ativo").length, convites: ms.filter((m) => m.situacao === "convidado").length,
    gestoras: ms.filter((m) => m.gestor && ["convidado", "ativo"].includes(m.situacao)).map((m) => m.email),
    situacao: e.encerrada_em ? "encerrada" : "vigente",
  };
}

function painelEmpresa(e) {
  return { empresa: empresaJson(e), membros: estado.membros.filter((m) => m.empresa_id === e.id && ["convidado", "ativo"].includes(m.situacao)) };
}

function minhasEmpresas() {
  const minhas = estado.membros.filter((m) => m.email === USUARIO.email);
  const e = (m) => estado.empresas.find((x) => x.id === m.empresa_id);
  return {
    convites: minhas.filter((m) => m.situacao === "convidado").map((m) => ({ id: m.id, empresa: e(m).nome, gestor: m.gestor, alvo: empresaJson(e(m)).alvo, inicio: e(m).inicio, fim: e(m).fim, convidado_em: m.convidado_em })),
    empresas: minhas.filter((m) => m.situacao === "ativo").map((m) => ({ id: m.empresa_id, membro: m.id, empresa: e(m).nome, gestor: m.gestor, alvo: empresaJson(e(m)).alvo,
      inicio: e(m).inicio, fim: e(m).fim, situacao: "vigente", aceito_em: m.aceito_em, aviso_versao: m.aviso_versao })),
  };
}

function criarEmpresaComConvite() {
  estado.empresas.push({ id: "e1", nome: "Banco Exemplo", tipo: "consultoria", escopo: "plataforma", curso: null, trilha: null, inicio: "2026-11-20", fim: "2027-11-19",
    vagas: 5, observacao: "", encerrada_em: null, motivo: null, criado_em: "2026-11-20T12:00:00Z" });
  estado.membros.push({ ...membroNovo("e1", USUARIO.email, true), id: "m-eu", convite_enviado_em: "2026-11-20T12:00:00Z" });
  estado.membros.push({ ...membroNovo("e1", "ana@banco.com", false), id: "m-ana", situacao: "ativo", nome: "Ana Analista", aceito_em: "2026-11-20T12:30:00Z",
    ultimo_acesso: "2026-11-20T14:00:00Z", cursos: [{ slug: PAGO.slug, titulo: PAGO.titulo, total: 24, concluidas: 9, aprovado: false, certificado_em: null }] });
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
          if (corpo.empresa === "convite") criarEmpresaComConvite();
          if (corpo.missao) estado.missoes = [{ ...MISSAO_EXEMPLO, curso: CURSO.slug, publicado: true }];
          return enviar({ ok: true });
        case "/functions/v1/academy-empresa": {
          const pend = estado.membros.filter((m) => m.empresa_id === corpo.empresa_id && m.situacao === "convidado" && !m.convite_enviado_em);
          for (const m of pend) m.convite_enviado_em = "2026-11-20T12:00:00Z";
          estado.enviosConvite.push({ empresa_id: corpo.empresa_id, emails: pend.map((m) => m.email) });
          return enviar({ enviados: pend.length, falhas: 0, pendentes: 0, email: "ligado" });
        }
        case "/rest/v1/rpc/academy_minhas_missoes":
          return enviar(estado.missoes.filter((m) => m.publicado).map(missaoResumo));
        case "/rest/v1/rpc/academy_minhas_competencias":
          return enviar(competenciasFalsas());
        case "/rest/v1/rpc/academy_missao": {
          const m = estado.missoes.find((x) => x.slug === String(corpo.p_slug).toLowerCase() && x.publicado);
          return m ? enviar(missaoAluno(m)) : enviar({ message: "missao_inexistente" }, 400);
        }
        case "/rest/v1/rpc/academy_iniciar_missao": {
          const m = estado.missoes.find((x) => x.slug === String(corpo.p_slug).toLowerCase() && x.publicado);
          if (!m) return enviar({ message: "missao_inexistente" }, 400);
          let t = estado.tentativasMissao.find((x) => x.missao === m.id && !x.enviada_em);
          if (!t) estado.tentativasMissao.push((t = { id: `t${estado.tentativasMissao.length + 1}`, missao: m.id, iniciada_em: new Date(Date.now() - 65_000).toISOString(), enviada_em: null }));
          return enviar({ iniciada_em: t.iniciada_em });
        }
        case "/rest/v1/rpc/academy_enviar_missao": {
          const m = estado.missoes.find((x) => x.slug === String(corpo.p_slug).toLowerCase());
          const t = m && estado.tentativasMissao.find((x) => x.missao === m.id && !x.enviada_em);
          if (!t) return enviar({ message: "missao_nao_iniciada" }, 400);
          estado.escritasAdm.push({ fn: "academy_enviar_missao", p_dados: corpo });
          return enviar(corrigirMissao(m, t, corpo.p_respostas ?? {}, corpo.p_evidencias ?? []));
        }
        case "/rest/v1/rpc/academy_adm_missoes":
          return enviar({
            missoes: estado.missoes.filter((m) => m.curso === corpo.p_curso).map((m) => ({ ...m, tentativas: estado.tentativasMissao.filter((t) => t.missao === m.id && t.enviada_em).length, aprovados: aprovadaM(m) ? 1 : 0 })),
            competencias: [{ slug: "triagem-alertas", titulo: "Triagem de alertas" }, { slug: "analise-logs", titulo: "Análise de logs" }, { slug: "mitre-attack", titulo: "MITRE ATT&CK" }],
          });
        case "/rest/v1/rpc/academy_adm_salvar_missao": {
          const d = corpo.p_dados ?? {};
          estado.escritasAdm.push({ fn: "academy_adm_salvar_missao", p_dados: d });
          const atual = estado.missoes.find((m) => m.id === d.id);
          const nova = { ...(atual ?? { id: `m${estado.missoes.length + 1}`, ordem: 1, atualizado_em: "2026-11-20T12:00:00Z" }), ...d, curso: corpo.p_curso, slug: String(d.codigo).toLowerCase() };
          estado.missoes = atual ? estado.missoes.map((m) => (m.id === d.id ? nova : m)) : [...estado.missoes, nova];
          return enviar({ missoes: estado.missoes.filter((m) => m.curso === corpo.p_curso).map((m) => ({ ...m, tentativas: 0, aprovados: 0 })), competencias: [] });
        }
        case "/rest/v1/rpc/academy_minhas_empresas":
          return enviar(minhasEmpresas());
        case "/rest/v1/rpc/academy_aceitar_convite":
        case "/rest/v1/rpc/academy_recusar_convite": {
          const m = estado.membros.find((x) => x.id === corpo.p_membro && x.email === USUARIO.email && x.situacao === "convidado");
          if (!m) return enviar({ message: "convite_inexistente" }, 400);
          if (u.pathname.endsWith("aceitar_convite")) Object.assign(m, { situacao: "ativo", nome: estado.nomeAluno, aceito_em: "2026-11-20T13:00:00Z", ultimo_acesso: "2026-11-20T13:00:00Z", aviso_versao: "v2026.5" });
          else m.situacao = "recusado";
          return enviar(minhasEmpresas());
        }
        case "/rest/v1/rpc/academy_sair_empresa": {
          const m = estado.membros.find((x) => x.id === corpo.p_membro && x.email === USUARIO.email && x.situacao === "ativo");
          if (!m) return enviar({ message: "membro_inexistente" }, 400);
          m.situacao = "saiu";
          return enviar(minhasEmpresas());
        }
        case "/rest/v1/rpc/academy_empresa_painel": {
          const e = estado.empresas.find((x) => x.id === corpo.p_empresa);
          if (!e) return enviar({ message: "empresa_inexistente" }, 400);
          return enviar(painelEmpresa(e));
        }
        case "/rest/v1/rpc/academy_empresa_convidar": {
          const e = estado.empresas.find((x) => x.id === corpo.p_empresa);
          const emails = [...new Set((corpo.p_emails ?? []).map((x) => String(x).trim().toLowerCase()))];
          const ja = emails.filter((x) => estado.membros.some((m) => m.empresa_id === e.id && m.email === x && ["convidado", "ativo"].includes(m.situacao)));
          const novos = emails.filter((x) => !ja.includes(x));
          if (usadas(e) + novos.length > e.vagas) return enviar({ message: "sem_vagas" }, 400);
          for (const x of novos) estado.membros.push(membroNovo(e.id, x, Boolean(corpo.p_gestor)));
          estado.escritasAdm.push({ fn: "academy_empresa_convidar", p_dados: corpo });
          return enviar({ convidados: novos.length, ja_na_empresa: ja });
        }
        case "/rest/v1/rpc/academy_empresa_cancelar_convite":
        case "/rest/v1/rpc/academy_empresa_remover":
        case "/rest/v1/rpc/academy_empresa_definir_gestor":
        case "/rest/v1/rpc/academy_empresa_reenviar_convite": {
          const m = estado.membros.find((x) => x.id === corpo.p_membro);
          if (!m) return enviar({ message: "membro_inexistente" }, 400);
          if (u.pathname.endsWith("cancelar_convite")) m.situacao = "cancelado";
          if (u.pathname.endsWith("remover")) m.situacao = "removido";
          if (u.pathname.endsWith("definir_gestor")) m.gestor = Boolean(corpo.p_gestor);
          if (u.pathname.endsWith("reenviar_convite")) m.convite_enviado_em = null;
          return enviar(painelEmpresa(estado.empresas.find((x) => x.id === m.empresa_id)));
        }
        case "/rest/v1/rpc/academy_adm_empresas":
          return enviar(estado.empresas.map(empresaJson));
        case "/rest/v1/rpc/academy_adm_salvar_empresa": {
          const d = corpo.p_dados ?? {};
          estado.escritasAdm.push({ fn: "academy_adm_salvar_empresa", p_dados: d });
          let e = estado.empresas.find((x) => x.id === d.id);
          const campos = { nome: d.nome, tipo: d.tipo, escopo: d.escopo, curso: d.curso ?? null, trilha: d.trilha ?? null, inicio: d.inicio, fim: d.fim, vagas: Number(d.vagas), observacao: d.observacao ?? "" };
          if (e) Object.assign(e, campos);
          else {
            e = { id: `e${estado.empresas.length + 1}`, ...campos, encerrada_em: null, motivo: null, criado_em: "2026-11-20T12:00:00Z" };
            estado.empresas.push(e);
            estado.membros.push(membroNovo(e.id, String(d.gestor_email).trim().toLowerCase(), true));
          }
          return enviar(empresaJson(e));
        }
        case "/rest/v1/rpc/academy_adm_encerrar_empresa": {
          const e = estado.empresas.find((x) => x.id === corpo.p_id);
          Object.assign(e, { encerrada_em: "2026-11-20T15:00:00Z", motivo: corpo.p_motivo });
          return enviar(empresaJson(e));
        }
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
        // Fase 20: indicadores e pessoas (só admin).
        case "/rest/v1/rpc/academy_adm_indicadores": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          const por_dia = Array.from({ length: 30 }, (_, i) => ({
            dia: new Date(Date.UTC(2026, 9, 23 + i)).toISOString().slice(0, 10),
            pre_inscricoes: [2, 0, 1, 3][i % 4],
            contas: i % 3 === 0 ? 1 : 0,
          }));
          return enviar({
            gerado_em: "2026-11-21T15:00:00Z",
            pre_inscricoes: { total: 42, ult_7: 9, ult_30: 30 },
            contas: { total: 25, ult_7: 6, ult_30: 20 },
            ativos: { ult_7: 11, ult_30: 19 },
            certificados: { total: 3, ult_30: 3 },
            funil: { pre_inscritos: 42, entraram: 25, comecaram: 18, concluiram_curso: 4, certificados: 3 },
            por_dia,
            perfil_declarado: { iniciante: 20, transicao: 12, profissional: 7, estudante: 3 },
            areas: { seguranca: 6, infraestrutura: 3, suporte: 2 },
            experiencia: { menos_1: 4, "1_3": 5, "3_5": 2 },
            cursos: [
              { slug: CURSO.slug, titulo: CURSO.titulo, gratuito: true, aulas: 5, matriculados: 25, comecaram: 18, concluiram: 4, media_conclusao: 37, aprovados_final: 3, certificados: 3 },
              { slug: "fundamentos-para-soc", titulo: "Fundamentos para SOC", gratuito: true, aulas: 0, matriculados: 25, comecaram: 0, concluiram: 0, media_conclusao: 0, aprovados_final: 0, certificados: 0 },
            ],
          });
        }
        case "/rest/v1/rpc/academy_adm_pessoas": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          estado.pessoaAdm ??= { papel: null, empresa: null, cursos: [] };
          const todas = [
            { tipo: "conta", user_id: USUARIO.id, lead_id: "l1", nome: estado.nomeAluno, email: USUARIO.email, papel: "admin", perfil_declarado: "profissional", cadastro_em: "2026-11-17T12:00:00Z", ultimo_acesso_em: "2026-11-21T12:00:00Z", cursos: 2, certificados: 0 },
            { tipo: "conta", user_id: "00000000-0000-4000-8000-0000000000a1", lead_id: "l2", nome: "Ana Souza", email: "ana@exemplo.com", papel: estado.pessoaAdm.papel, perfil_declarado: "iniciante", cadastro_em: "2026-11-20T12:00:00Z", ultimo_acesso_em: "2026-11-21T10:00:00Z", cursos: 2, certificados: 0 },
            { tipo: "pre_inscricao", user_id: null, lead_id: "l3", nome: "Bia Lima", email: "bia@exemplo.com", papel: null, perfil_declarado: "transicao", cadastro_em: "2026-11-21T09:00:00Z", ultimo_acesso_em: null, cursos: 0, certificados: 0 },
          ];
          const b = String(corpo.p_busca ?? "").toLowerCase();
          const f = corpo.p_filtro ?? "todos";
          const itens = todas.filter((p) => (!b || p.nome.toLowerCase().includes(b) || p.email.includes(b))
            && (f === "todos" || (f === "contas" && p.tipo === "conta") || (f === "sem_conta" && p.tipo === "pre_inscricao") || (f === "equipe" && p.papel)));
          return enviar({ total: itens.length, itens });
        }
        case "/rest/v1/rpc/academy_adm_pessoa":
        case "/rest/v1/rpc/academy_adm_salvar_perfil":
        case "/rest/v1/rpc/academy_adm_definir_equipe":
        case "/rest/v1/rpc/academy_adm_remover_equipe": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          estado.pessoaAdm ??= { papel: null, empresa: null, cursos: [] };
          const pa = estado.pessoaAdm;
          if (u.pathname.endsWith("salvar_perfil")) pa.empresa = String(corpo.p_dados?.empresa ?? "").trim() || null;
          if (u.pathname.endsWith("definir_equipe")) Object.assign(pa, { papel: corpo.p_papel, cursos: corpo.p_cursos ?? [] });
          if (u.pathname.endsWith("remover_equipe")) Object.assign(pa, { papel: null, cursos: [] });
          if (u.pathname.endsWith("definir_equipe") || u.pathname.endsWith("remover_equipe")) return enviar([]);
          return enviar({
            user_id: "00000000-0000-4000-8000-0000000000a1",
            perfil: { nome: "Ana Souza", email: "ana@exemplo.com", data_nascimento: null, telefone: null, cidade: "Recife", pais: "Brasil", empresa: pa.empresa, cargo: null,
              area: null, experiencia: null, bio: null, linkedin: null, atualizado_em: pa.empresa ? "2026-11-21T16:00:00Z" : null },
            criado_em: "2026-11-20T12:00:00Z", ultimo_acesso_em: "2026-11-21T10:00:00Z", papel: pa.papel, eu: false, cursos_equipe: pa.cursos,
            pre_inscricao: { perfil: "iniciante", criado_em: "2026-11-20T11:00:00Z", status: "confirmed" },
            cursos: [{ slug: CURSO.slug, titulo: CURSO.titulo, origem: "gratuito", matriculado_em: "2026-11-20T12:00:00Z", progresso: { aulas: 5, concluidas: 2, ultima_atividade: "2026-11-21T10:00:00Z" } }],
            certificados: [], missoes: { tentativas: 0, aprovadas: 0 },
          });
        }
        // Fase 21: o dono da plataforma é a conta logada (o Everton).
        case "/rest/v1/rpc/academy_adm_dono":
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          return enviar({ user_id: USUARIO.id, eu: true });
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
        case "/rest/v1/rpc/academy_adm_concessoes": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          const b = String(corpo.p_busca ?? "").toLowerCase();
          return enviar(estado.concessoes.filter((c) => !b || c.email.includes(b) || c.transacao?.toLowerCase() === b));
        }
        case "/rest/v1/rpc/academy_adm_conceder": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          const d = corpo.p_dados ?? {};
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email ?? "")) return enviar({ message: "email_invalido" }, 400);
          const c = { id: `c${estado.concessoes.length + 1}`, email: d.email.toLowerCase(), nome: d.nome ?? "", origem: "manual", escopo: d.escopo,
            curso: d.curso, trilha: d.trilha, cursos: [], alvo: d.escopo === "plataforma" ? "Plataforma toda" : d.escopo === "trilha" ? "Trilha SOC" : PAGO.titulo,
            inicio: "2026-11-20T12:00:00Z", fim: d.dias ? "2027-11-20T12:00:00Z" : null, transacao: null, produto: null, revogada_em: null, motivo: null,
            conta: false, situacao: "ativa", criado_em: "2026-11-20T12:00:00Z" };
          estado.concessoes.unshift(c);
          estado.escritasAdm.push({ fn: "academy_adm_conceder", ...corpo });
          return enviar(c);
        }
        case "/rest/v1/rpc/academy_adm_transferir_concessao": {
          const c = estado.concessoes.find((x) => x.id === corpo.p_id);
          if (!c) return enviar({ message: "concessao_inexistente" }, 400);
          c.email = String(corpo.p_email).trim().toLowerCase();
          estado.escritasAdm.push({ fn: "academy_adm_transferir_concessao", ...corpo });
          return enviar(c);
        }
        case "/rest/v1/rpc/academy_adm_revogar_concessao": {
          const c = estado.concessoes.find((x) => x.id === corpo.p_id);
          if (String(corpo.p_motivo ?? "").trim().length < 5) return enviar({ message: "motivo_obrigatorio" }, 400);
          Object.assign(c, { situacao: "encerrada", revogada_em: "2026-11-20T12:00:00Z", motivo: corpo.p_motivo });
          return enviar(c);
        }
        case "/rest/v1/rpc/academy_adm_produtos":
        case "/rest/v1/rpc/academy_adm_salvar_produto": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          if (u.pathname.endsWith("salvar_produto")) {
            const d = corpo.p_dados ?? {};
            estado.produtos = estado.produtos.filter((p) => String(p.hotmart_produto_id) !== String(d.hotmart_produto_id));
            estado.produtos.push({ hotmart_produto_id: Number(d.hotmart_produto_id), nome: d.nome, escopo: d.escopo, trilha: d.trilha,
              trilha_titulo: estado.trilhas.find((t) => t.slug === d.trilha)?.titulo ?? null, duracao_dias: d.duracao_dias, ativo: d.ativo !== false, vendas: 0,
              situacao: d.situacao ?? "oculto", checkout_url: d.checkout_url || null, preco_centavos: d.preco_centavos ?? null,
              preco_observacao: d.preco_observacao ?? "", preco_conferido_em: d.preco_centavos != null ? "2026-11-20T12:00:00Z" : null });
          }
          return enviar({
            produtos: estado.produtos,
            cursos: estado.vitrine.hotmart_produto_id ? [{ hotmart_produto_id: estado.vitrine.hotmart_produto_id, curso: PAGO.slug, titulo: PAGO.titulo, vendas: 1 }] : [],
            eventos: [{ evento: "PURCHASE_APPROVED", resultado: "liberado", produto: 1001, transacao: "HP1234567890", recebido_em: "2026-11-19T15:00:00Z" }],
          });
        }
        case "/rest/v1/rpc/academy_catalogo_publico":
          return enviar(catalogoPublico());
        case "/rest/v1/rpc/academy_adm_vitrine":
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          return enviar(vitrineAdm());
        case "/rest/v1/rpc/academy_adm_salvar_vitrine": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          const d = corpo.p_dados ?? {};
          estado.escritasAdm.push({ fn: "academy_adm_salvar_vitrine", ...corpo });
          const url = d.checkout_url || null;
          if (url && !CHECKOUT.test(url)) return enviar({ message: "checkout_invalido" }, 400);
          if (d.situacao === "a_venda" && (!url || d.preco_centavos == null)) return enviar({ message: "venda_incompleta" }, 400);
          Object.assign(estado.vitrine, {
            situacao: d.situacao, checkout_url: url, hotmart_produto_id: d.hotmart_produto_id ? Number(d.hotmart_produto_id) : null,
            preco_centavos: d.preco_centavos ?? null, preco_observacao: d.preco_observacao ?? "", trilhas: d.trilhas ?? estado.vitrine.trilhas,
            preco_conferido_em: d.preco_centavos != null ? "2026-11-19T12:00:00Z" : null,
          });
          return enviar(vitrineAdm());
        }
        case "/rest/v1/rpc/academy_adm_trilhas":
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          return enviar(trilhasAdm());
        case "/rest/v1/rpc/academy_adm_mover_trilha": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          const i = estado.trilhas.findIndex((t) => t.slug === corpo.p_slug);
          const j = i + corpo.p_direcao;
          if (i < 0 || j < 0 || j >= estado.trilhas.length) return enviar({ message: "limite" }, 400);
          [estado.trilhas[i], estado.trilhas[j]] = [estado.trilhas[j], estado.trilhas[i]];
          return enviar(trilhasAdm());
        }
        case "/rest/v1/rpc/academy_adm_salvar_trilha": {
          if (estado.equipe !== "admin") return enviar({ message: "sem_permissao" }, 400);
          const d = corpo.p_dados ?? {};
          if (!corpo.p_slug) {
            if (estado.trilhas.some((t) => t.slug === d.slug)) return enviar({ message: "slug_em_uso" }, 400);
            estado.trilhas.push({ slug: d.slug, titulo: d.titulo, descricao: d.descricao ?? "", publicado: Boolean(d.publicado), formacao: null });
          } else {
            Object.assign(estado.trilhas.find((t) => t.slug === corpo.p_slug), d);
          }
          return enviar(trilhasAdm());
        }
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
              ...c._resumo, questoes: 7, questoes_publicadas: 7 },
              { slug: PAGO.slug, titulo: PAGO.titulo, nivel: PAGO.nivel, gratuito: false, publicado: true, ordem: 2, modulos: PAGO.modulos.length,
                aulas: 0, aulas_publicadas: 0, aulas_sem_video: 0, questoes: 0, questoes_publicadas: 0 }]);
          }
          if (fn === "academy_adm_curso" && corpo.p_slug === PAGO.slug)
            return enviar({ slug: PAGO.slug, titulo: PAGO.titulo, descricao: PAGO.descricao, nivel: PAGO.nivel, gratuito: false, publicado: true, ordem: 2,
              eh_admin: estado.equipe === "admin", requisitos: null, questoes_final: 0, questoes_final_publicadas: 0,
              objetivos: PAGO.objetivos, publico: PAGO.publico, pre_requisitos: PAGO.pre_requisitos,
              modulos: PAGO.modulos.map((m) => ({ id: `p${m.ordem}`, ordem: m.ordem, titulo: m.titulo, resumo: m.resumo, questoes: 0, questoes_publicadas: 0, aulas: [] })) });
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
        case "/rest/v1/rpc/academy_meu_perfil":
        case "/rest/v1/rpc/academy_salvar_meu_perfil": {
          const base = { nome: estado.nomeAluno ?? "Everton Nascimento", email: "aluno@exemplo.com", data_nascimento: null, telefone: null, cidade: null, pais: null,
            empresa: null, cargo: null, area: null, experiencia: null, bio: null, linkedin: null, atualizado_em: null };
          if (u.pathname.endsWith("salvar_meu_perfil")) {
            const d = corpo.p_dados ?? {};
            if (typeof d.nome !== "string" || d.nome.trim().length < 2) return enviar({ message: "nome_invalido" }, 400);
            const limpo = Object.fromEntries(Object.keys(base).filter((k) => k in d).map((k) => [k, String(d[k]).trim() || null]));
            limpo.nome = String(d.nome).trim().replace(/\s+/g, " ");
            estado.nomeAluno = limpo.nome;
            estado.perfil = { ...base, ...(estado.perfil ?? {}), ...limpo, email: base.email, atualizado_em: "2026-11-21T15:00:00Z" };
          }
          return enviar({ ...(estado.perfil ?? base), nome: estado.nomeAluno ?? base.nome });
        }
        case "/rest/v1/rpc/academy_meus_avisos":
        case "/rest/v1/rpc/academy_definir_aviso_aula_nova": {
          if (u.pathname.endsWith("definir_aviso_aula_nova")) {
            if (typeof corpo.p_ligado !== "boolean") return enviar({ message: "invalid_payload" }, 400);
            estado.avisoAulaNovaDesde = corpo.p_ligado ? (estado.avisoAulaNovaDesde ?? "2026-11-20T17:00:00Z") : null;
          }
          return enviar({ aula_nova: estado.avisoAulaNovaDesde != null, aula_nova_desde: estado.avisoAulaNovaDesde ?? null });
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
