#!/usr/bin/env node
/**
 * scripts/sca-check.mjs
 *
 * Gate de SCA (SEC-015): reprova qualquer dependencia com severidade high ou
 * critical, e aceita excecao apenas quando ela esta declarada, dentro do prazo
 * e aprovada em .github/sca-excecoes.json.
 *
 * Regras (fail closed):
 *   - auditoria completa, sem --omit=dev: ferramentas de build tambem contam;
 *   - excecao vencida reprova o gate;
 *   - excecao sem ghsa, pacote, motivo, revisao ou aprovadoPor reprova o gate;
 *   - advisory sem GHSA identificavel nao tem como ser exceto, entao reprova;
 *   - falha do proprio npm audit (rede, registro) reprova.
 *
 * Uso:
 *   node scripts/sca-check.mjs                 (audita a raiz do repo)
 *   node scripts/sca-check.mjs --pasta academy (audita uma pasta do repo)
 *   node scripts/sca-check.mjs --excecoes <arquivo>   (teste local do gate)
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXCECOES_PADRAO = join(RAIZ, ".github", "sca-excecoes.json");
const CAMPOS_OBRIGATORIOS = ["ghsa", "pacote", "motivo", "revisao", "aprovadoPor"];
const SEVERIDADES = new Set(["high", "critical"]);

function argumento(nome, padrao) {
  const i = process.argv.indexOf(nome);
  if (i === -1 || i === process.argv.length - 1) return padrao;
  return process.argv[i + 1];
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function falhar(mensagem) {
  console.error(`SCA: ${mensagem}`);
  process.exit(1);
}

function carregarExcecoes(arquivo) {
  let bruto;
  try {
    bruto = readFileSync(arquivo, "utf8");
  } catch {
    falhar(`lista de excecoes ilegivel em ${arquivo}. Sem ela, nenhuma excecao vale (fail closed).`);
  }

  let dados;
  try {
    dados = JSON.parse(bruto);
  } catch (erro) {
    falhar(`lista de excecoes nao e JSON valido: ${erro.message}`);
  }

  const lista = Array.isArray(dados?.excecoes) ? dados.excecoes : null;
  if (!lista) falhar("lista de excecoes precisa do campo \"excecoes\" como array.");

  const validas = [];
  const problemas = [];
  for (const [indice, excecao] of lista.entries()) {
    const faltando = CAMPOS_OBRIGATORIOS.filter((campo) => {
      const valor = excecao?.[campo];
      return typeof valor !== "string" || valor.trim() === "";
    });
    if (faltando.length > 0) {
      problemas.push(`excecao #${indice + 1} sem ${faltando.join(", ")}`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(excecao.revisao)) {
      problemas.push(`excecao ${excecao.ghsa} com revisao fora do formato AAAA-MM-DD: ${excecao.revisao}`);
      continue;
    }
    validas.push({ ...excecao, ghsa: excecao.ghsa.toUpperCase() });
  }
  return { validas, problemas };
}

function rodarAudit(pasta) {
  const resultado = spawnSync("npm audit --json", {
    cwd: pasta,
    encoding: "utf8",
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
  });

  if (resultado.error) falhar(`nao foi possivel rodar npm audit em ${pasta}: ${resultado.error.message}`);
  if (!resultado.stdout || resultado.stdout.trim() === "") {
    falhar(`npm audit nao devolveu JSON em ${pasta}${resultado.stderr ? `: ${resultado.stderr.trim()}` : ""}`);
  }

  try {
    return JSON.parse(resultado.stdout);
  } catch (erro) {
    falhar(`saida do npm audit nao e JSON valido em ${pasta}: ${erro.message}`);
  }
}

function ghsaDoAdvisory(via) {
  const texto = [via?.url, via?.title, via?.source].filter(Boolean).join(" ");
  const achado = texto.match(/GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/i);
  return achado ? achado[0].toUpperCase() : null;
}

function auditar() {
  const pastaRelativa = argumento("--pasta", ".");
  const pasta = resolve(RAIZ, pastaRelativa);
  const arquivoExcecoes = resolve(RAIZ, argumento("--excecoes", EXCECOES_PADRAO));

  const { validas, problemas } = carregarExcecoes(arquivoExcecoes);
  const data = hoje();

  const vencidas = validas.filter((excecao) => excecao.revisao < data);
  const vigentes = validas.filter((excecao) => excecao.revisao >= data);
  const aceitas = new Map(vigentes.map((excecao) => [`${excecao.ghsa}::${excecao.pacote}`, excecao]));

  const relatorio = rodarAudit(pasta);
  const vulnerabilidades = relatorio?.vulnerabilities ?? {};
  const graves = Object.entries(vulnerabilidades).filter(([, v]) => SEVERIDADES.has(v?.severity));

  const bloqueios = [];
  const cobertas = [];
  const semAdvisoryProprio = [];

  for (const [pacote, dados] of graves) {
    const advisories = (Array.isArray(dados.via) ? dados.via : []).filter((via) => typeof via === "object");

    if (advisories.length === 0) {
      // Severidade herdada de um pacote filho: o filho e avaliado por conta propria.
      semAdvisoryProprio.push(pacote);
      continue;
    }

    const idsSemExcecao = [];
    for (const advisory of advisories) {
      const ghsa = ghsaDoAdvisory(advisory);
      if (!ghsa) {
        idsSemExcecao.push(`advisory sem GHSA identificavel (${advisory.title ?? "sem titulo"})`);
        continue;
      }
      const chave = `${ghsa}::${pacote}`;
      if (!aceitas.has(chave)) idsSemExcecao.push(ghsa);
    }

    if (idsSemExcecao.length === 0) {
      cobertas.push(pacote);
    } else {
      const titulo = advisories.map((a) => a.title).filter(Boolean).join(" | ");
      bloqueios.push({ pacote, severidade: dados.severity, ids: idsSemExcecao, titulo });
    }
  }

  console.log(`SCA em ${pastaRelativa === "." ? "raiz" : pastaRelativa}: auditoria completa (sem --omit=dev).`);
  console.log(
    `Total pelo npm: ${JSON.stringify(relatorio?.metadata?.vulnerabilities ?? {})}`,
  );

  if (problemas.length > 0) {
    console.error("SCA: lista de excecoes invalida (fail closed):");
    for (const problema of problemas) console.error(`  - ${problema}`);
    process.exit(1);
  }

  if (vencidas.length > 0) {
    console.error(`SCA: ${vencidas.length} excecao(oes) vencida(s) em ${data}:`);
    for (const excecao of vencidas) {
      console.error(`  - ${excecao.ghsa} (${excecao.pacote}) venceu em ${excecao.revisao}`);
    }
    process.exit(1);
  }

  for (const excecao of vigentes) {
    const usada = cobertas.includes(excecao.pacote);
    const prazo = `revisar ate ${excecao.revisao}, aprovada por ${excecao.aprovadoPor}`;
    if (usada) {
      console.log(`  excecao aplicada: ${excecao.ghsa} em ${excecao.pacote} (${prazo}).`);
    } else {
      console.log(`  excecao sem uso agora: ${excecao.ghsa} em ${excecao.pacote} (${prazo}).`);
    }
  }

  if (semAdvisoryProprio.length > 0) {
    console.log(`  severidade herdada de dependencia filha (avaliada na origem): ${semAdvisoryProprio.join(", ")}`);
  }

  if (bloqueios.length > 0) {
    console.error(`SCA: ${bloqueios.length} pacote(s) com severidade high/critical sem excecao valida:`);
    for (const bloqueio of bloqueios) {
      console.error(`  - ${bloqueio.pacote} [${bloqueio.severidade}]: ${bloqueio.ids.join(", ")}${bloqueio.titulo ? ` - ${bloqueio.titulo}` : ""}`);
    }
    console.error("Corrija a dependencia ou abra excecao com motivo, prazo e aprovacao em .github/sca-excecoes.json.");
    process.exit(1);
  }

  console.log(`SCA: nenhuma severidade high/critical fora de excecao vigente.`);
}

auditar();
