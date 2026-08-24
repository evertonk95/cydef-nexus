/**
 * Converte os article.md do squad cydef-security-editorial para o data file
 * src/lib/blog/posts-extra.generated.ts (estrutura BlogPost do site).
 *
 * Uso: node scripts/convert-blog-posts.mjs
 * Entrada: Documents/Squads100/squads/cydef-security-editorial/output/2026-08-24-183100-articleNN/article.md
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "C:/Users/User/Documents/Squads100/squads/cydef-security-editorial/output";
const RUNS = [
  "2026-08-24-183100-article02",
  "2026-08-24-183100-article03",
  "2026-08-24-183100-article04",
  "2026-08-24-183100-article05",
  "2026-08-24-183100-article06",
  "2026-08-24-183100-article07",
  "2026-08-24-183100-article08",
];

// slugs das thumbs (ordem = runs)
const THUMBS = [
  "mitre-attack-thumb.webp",
  "threat-hunting-thumb.webp",
  "hardening-linux-thumb.webp",
  "carreira-thumb.webp",
  "cloud-aws-thumb.webp",
  "analise-logs-thumb.webp",
  "threat-intel-thumb.webp",
];

// excerpts dos cards originais do blog (mesma ordem)
const EXCERPTS = [
  "Entenda como usar o framework MITRE ATT&CK para mapear ameaças e criar regras de detecção eficazes no seu ambiente.",
  "Introdução ao threat hunting com metodologias, ferramentas e dicas práticas para caçar ameaças proativamente.",
  "Passo a passo para implementar hardening em servidores Linux seguindo as recomendações do CIS Benchmark.",
  "Análise das principais certificações de segurança e como escolher as mais adequadas para seu momento profissional.",
  "Guia prático de segurança para ambientes AWS com foco em IAM, VPC, CloudTrail e outros serviços críticos.",
  "Aprenda a correlacionar eventos de log e identificar padrões que indicam atividades suspeitas ou maliciosas.",
  "Entenda como coletar, validar e aplicar Indicadores de Comprometimento no contexto de defesa proativa.",
];

const CATEGORIES = [
  "Blue Team",
  "Detecção e Resposta",
  "Hardening",
  "Carreira e Certificações",
  "Cloud Security",
  "SOC",
  "Inteligência de Ameaças",
];

const SLUGS = [
  "mitre-attack-deteccao-tecnicas-adversarios",
  "threat-hunting-por-onde-comecar",
  "hardening-linux-cis-benchmarks",
  "certificacoes-ciberseguranca-carreira",
  "seguranca-cloud-aws-melhores-praticas",
  "analise-de-logs-comportamentos-maliciosos",
  "inteligencia-de-ameacas-como-usar-iocs",
];

function parseInline(text) {
  // O renderer React (BlogPost.tsx) já processa **negrito** e [texto](url) inline.
  // Devolver o texto original sem marcadores de controle.
  return text;
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseArticle(md, meta) {
  const lines = md.split(/\r?\n/);
  // Remove o frontmatter YAML inicial (entre --- e ---)
  let startIdx = 0;
  if (lines.length > 0 && lines[0].trim() === "---") {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        startIdx = i + 1;
        break;
      }
    }
  }
  const body = lines.slice(startIdx);
  const sections = [];
  let current = null;
  let listBuffer = [];
  let inCode = false;
  let codeBuffer = [];
  let inSources = false;
  let inChangelog = false;
  const sources = [];
  const changelog = [];

  const flushList = () => {
    if (listBuffer.length) {
      if (!current) current = { paragraphs: [], lists: [] };
      current.lists.push({ items: [...listBuffer] });
      listBuffer = [];
    }
  };

  const flushParagraph = (buf) => {
    if (!buf.length) return;
    const text = buf.join(" ").trim();
    if (!text) return;
    if (!current) current = { paragraphs: [] };
    current.paragraphs.push(parseInline(text));
  };

  let paraBuf = [];

  for (const raw of body) {
    const line = raw.trimEnd();

    if (inCode) {
      if (line.trim().startsWith("```")) {
        inCode = false;
        flushParagraph(paraBuf);
        paraBuf = [];
        if (!current) current = { paragraphs: [], lists: [] };
        current.code = codeBuffer.join("\n");
        codeBuffer = [];
      } else {
        codeBuffer.push(line);
      }
      continue;
    }

    if (line.trim().startsWith("```")) {
      flushParagraph(paraBuf);
      paraBuf = [];
      flushList();
      inCode = true;
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph(paraBuf);
      paraBuf = [];
      flushList();
      const heading = line.slice(3).trim();
      if (heading.toLowerCase() === "fontes") { inSources = true; current = null; continue; }
      if (heading.toLowerCase().startsWith("changelog")) { inChangelog = true; inSources = false; current = null; continue; }
      inSources = false;
      inChangelog = false;
      current = { heading, paragraphs: [], lists: [] };
      sections.push(current);
      continue;
    }

    if (inSources) {
      const m = line.match(/^[-*]\s*(.+?):\s*(https?:\/\/\S+)$/);
      if (m) {
        const label = m[1].replace(/^F\d+\s*[—-]\s*/, "").trim();
        sources.push({ label: parseInline(label), url: m[2] });
      } else {
        const m2 = line.match(/^[-*]\s*(.+?)\s+(https?:\/\/\S+)$/);
        if (m2) sources.push({ label: parseInline(m2[1].replace(/^F\d+\s*[—-]\s*/, "").trim()), url: m2[2] });
      }
      continue;
    }

    if (inChangelog) {
      const m = line.match(/^[-*]\s*(.+)$/);
      if (m) changelog.push(parseInline(m[1].trim()));
      continue;
    }

    if (line.startsWith("# ")) continue; // H1 (título já vem do frontmatter)

    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph(paraBuf);
      paraBuf = [];
      listBuffer.push(parseInline(line.replace(/^[-*]\s+/, "").trim()));
      continue;
    }

    if (line.trim() === "") {
      flushParagraph(paraBuf);
      paraBuf = [];
      flushList();
      continue;
    }

    // parágrafo normal (não é H2, não é lista, não é código)
    if (!current) { current = { paragraphs: [] }; sections.push(current); }
    paraBuf.push(line.trim());
  }
  flushParagraph(paraBuf);
  flushList();

  const fullText = md.replace(/```[\s\S]*?```/g, " ");
  const words = fullText.split(/\s+/).length;
  const readTime = Math.max(4, Math.round(words / 180));

  return {
    slug: meta.slug,
    title: meta.title,
    category: meta.category,
    excerpt: meta.excerpt,
    date: "24 de Agosto, 2026",
    dateISO: "2026-08-24",
    readTime: `${readTime} min`,
    image: `/assets/blog/${meta.thumb}`,
    author: "Equipe CyDef",
    sections,
    sources,
    changelog,
  };
}

const posts = [];
for (let i = 0; i < RUNS.length; i++) {
  const mdPath = join(BASE, RUNS[i], "article.md");
  const md = readFileSync(mdPath, "utf8");
  const titleMatch = md.match(/^title:\s*"?(.+?)"?\s*$/m);
  const title = titleMatch ? titleMatch[1].trim() : RUNS[i];
  posts.push(
    parseArticle(md, {
      slug: SLUGS[i],
      title,
      category: CATEGORIES[i],
      excerpt: EXCERPTS[i],
      thumb: THUMBS[i],
    })
  );
}

const out = `// GERADO AUTOMATICAMENTE por scripts/convert-blog-posts.mjs — não editar manualmente.
// Fonte: squad cydef-security-editorial (output/2026-08-24-183100-article02..08).
import type { BlogPost } from "./posts";

export const extraPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)};
`;

const dest = join(process.cwd(), "src/lib/blog/posts-extra.generated.ts");
writeFileSync(dest, out, "utf8");
console.log(`OK — ${posts.length} posts gerados em ${dest}`);
posts.forEach((p) => console.log(`  ${p.slug} | ${p.sections.length} seções | ${p.readTime} | ${p.sources.length} fontes`));
