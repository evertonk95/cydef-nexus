import { extraPosts } from "./posts-extra.generated";
import { blogPostsEn } from "./posts.en";
import { blogPostsEs } from "./posts.es";
import type { BlogPost } from "./posts";
import type { Lang } from "@/i18n";

/**
 * Conteúdo completo dos artigos (sections/sources/changelog) — módulo PESADO.
 * P3-01 code-splitting: este módulo só deve ser importado por rotas lazy
 * (BlogPost.tsx). Home e listagens usam posts.ts (meta leve) — se você for
 * adicionar um import daqui fora de uma rota lazy, o corpo de ~400 KB volta
 * para o chunk inicial e o LCP regride. Se precisar só de listagem, use meta.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "como-estruturar-um-soc-do-zero",
    title: "Como estruturar um SOC do zero: Guia completo",
    category: "SOC",
    excerpt:
      "Guia em 5 fases para criar um SOC do zero: escopo, pessoas, processos, tecnologia e métricas, com referências oficiais do NIST, MITRE e CIS.",
    date: "24 de Agosto, 2026",
    dateISO: "2026-08-24",
    readTime: "8 min",
    image: "/assets/blog/soc-do-zero-thumb.webp",
    author: "Equipe CyDef",
    sections: [
      {
        paragraphs: [
          "Montar um Centro de Operações de Segurança (SOC) do zero é uma decisão estruturante: ela define como a organização enxerga ameaças, responde a incidentes e evolui a postura de segurança. Este guia apresenta um caminho em cinco fases — escopo, pessoas, processos, tecnologia e métricas — ancorado em fontes oficiais vigentes: NIST Cybersecurity Framework (CSF) 2.0, NIST SP 800-61r3, MITRE ATT&CK, CIS Controls e SOC-CMM. Até a data de corte desta verificação (24/08/2026), essas são as referências vigentes consultadas. A aplicação de cada fase depende do contexto da sua organização; nenhuma ferramenta específica é obrigatória.",
        ],
      },
      {
        heading: "O que é um SOC e quando faz sentido criar um",
        paragraphs: [
          "Um SOC é a função organizada que monitora, detecta, analisa e responde a eventos e incidentes de segurança. Na prática, ele centraliza visibilidade e resposta: em vez de cada área reagir isoladamente, existe um ponto único de triagem, investigação e escalonamento.",
          "Faz sentido estruturar um SOC quando a organização já enfrenta um volume de alertas que não consegue tratar de forma consistente, quando precisa demonstrar governança de segurança (clientes, auditorias, reguladores) ou quando incidentes recorrentes mostram lacunas de detecção. Não existe um tamanho mínimo obrigatório: o que importa é o escopo — e o escopo vem antes da ferramenta.",
        ],
      },
      {
        heading: "Fase 1 — Escopo, missão e modelo de serviço",
        paragraphs: [
          "Antes de contratar qualquer tecnologia, defina o que o SOC protege. O ponto de partida recomendado é a função Govern do NIST CSF 2.0: estabelecer a missão, as autoridades e a tolerância a risco.",
        ],
        lists: [
          {
            items: [
              "Quais ativos, sistemas e dados estão no escopo de monitoramento?",
              "O que está explicitamente fora do escopo?",
              "Quem decide prioridades e aprova investimento?",
              "Qual modelo de entrega faz sentido: equipe interna, serviço gerenciado (MSSP) ou híbrido?",
            ],
          },
        ],
        paragraphsAfter: [
          "O SOC-CMM, modelo de maturidade específico para SOCs, reforça que a maturidade começa pela definição clara de serviços e responsabilidades — tecnologia vem depois. Um escopo bem definido evita o erro clássico de comprar um SIEM antes de saber o que ele deve correlacionar.",
        ],
      },
      {
        heading: "Fase 2 — Pessoas: papéis essenciais e o mínimo viável",
        paragraphs: [
          "A equipe é o ativo mais caro e mais crítico do SOC. No início, o desenho mínimo costuma combinar:",
        ],
        lists: [
          {
            title: "Triagem (N1)",
            items: [
              "Analisa alertas, aplica critérios de priorização e escala o que não resolve.",
            ],
          },
          {
            title: "Análise e resposta (N2)",
            items: [
              "Investiga eventos, contém e coordena resposta.",
            ],
          },
          {
            title: "Coordenação/gestão",
            items: [
              "Dono do serviço, comunicação com a liderança e melhoria contínua.",
            ],
          },
        ],
        paragraphsAfter: [
          "O tamanho e os turnos dependem do escopo definido na Fase 1. Em equipes pequenas, os mesmos profissionais acumulam papéis — o que deve ser explícito, para evitar sobrecarga silenciosa. Treinamento contínuo e documentação são parte do papel de cada função: processos não podem depender de uma única pessoa.",
        ],
      },
      {
        heading: "Fase 3 — Processos: triagem, investigação e resposta",
        paragraphs: [
          "Processos são o que transforma pessoas e ferramentas em um serviço previsível. A referência vigente é o NIST SP 800-61r3 (finalizado em abril de 2025), que alinha a resposta a incidentes ao CSF 2.0 e substitui o ciclo rígido de quatro fases da revisão anterior.",
        ],
        lists: [
          {
            title: "Triagem",
            items: [
              "Critérios escritos para priorizar alertas (o que é crítico, o que é ruído).",
            ],
          },
          {
            title: "Runbooks/playbooks",
            items: [
              "Procedimentos para os cenários mais frequentes (phishing, malware, acesso suspeito, exfiltração).",
            ],
          },
          {
            title: "Escalonamento",
            items: [
              "Quando e para quem um evento sobe de nível.",
            ],
          },
          {
            title: "Preservação de evidência",
            items: [
              "O que coletar e como, antes de qualquer ação de contenção.",
            ],
          },
          {
            title: "Comunicação",
            items: [
              "Quem informa a liderança, o cliente e as autoridades (ex.: LGPD/CERT.br quando aplicável).",
            ],
          },
        ],
        paragraphsAfter: [
          "Processos precisam ser testados. Um playbook que nunca foi exercitado tende a falhar no momento em que mais importa.",
        ],
      },
      {
        heading: "Fase 4 — Tecnologia: o que priorizar (e o que evitar)",
        paragraphs: [
          "A ordem recomendada é: inventário, fontes de telemetria, detecção e, só então, correlação. Nenhuma ferramenta é obrigatória; a escolha depende do ambiente e do escopo.",
        ],
        lists: [
          {
            items: [
              "Inventário de ativos primeiro. Não é possível monitorar o que não se conhece.",
              "Logging e telemetria: endpoints, redes, autenticação e serviços críticos. Sem dados de qualidade, nenhuma camada superior funciona.",
              "CIS Controls (versão vigente 8.1) funcionam como base priorizada de controles técnicos e hardening — um bom ponto de partida para reduzir exposição antes de investir em detecção avançada.",
              "Detecção: EDR em endpoints e análise de rede, com regras e hipóteses documentadas.",
              "SIEM como camada de correlação, não como solução mágica. Ele agrega e correlaciona o que as fontes de telemetria produzem.",
              "MITRE ATT&CK (versão vigente: v19.2, desde abril de 2026) serve como linguagem comum para descrever comportamento adversário — útil para triagem, detecção e comunicação entre equipes.",
            ],
          },
        ],
        paragraphsAfter: [
          "Evite comprar tecnologia antes de validar as fontes de dado. Um SIEM conectado a logs incompletos gera falsa sensação de cobertura.",
        ],
      },
      {
        heading: "Fase 5 — Métricas, maturidade e evolução",
        paragraphs: [
          "Um SOC precisa saber se está cumprindo a missão. As métricas devem ser definidas localmente, com baseline próprio — por exemplo, tempo médio para detectar (MTTD) e para responder (MTTR) — e revisadas periodicamente. O SOC-CMM pode ser usado como referência para avaliar a maturidade do serviço e priorizar a próxima evolução.",
          "Atenção a um limite importante: métricas comparadas sem contexto geram conclusões inválidas. Um MTTD de uma organização não é diretamente comparável ao de outra com escopo, equipe e telemetria diferentes.",
        ],
      },
      {
        heading: "O que ainda não sabemos / limites do guia",
        paragraphs: [
          "Este guia não prescreve ferramentas específicas, não afirma telemetria ou experiência interna da CyDef e não garante proteção total — nenhum controle cobre 100% dos cenários. As versões dos frameworks citados foram verificadas em 24/08/2026 e devem ser revalidadas antes da publicação. Autor e revisor técnico deste artigo ainda não foram definidos.",
        ],
      },
      {
        heading: "Próximos passos",
        paragraphs: [
          "Avalie o ambiente atual contra as cinco fases: comece pelo escopo, desenhe os papéis, documente os processos, valide as fontes de telemetria e só então decida sobre tecnologia. Consulte as fontes oficiais listadas abaixo antes de investir.",
        ],
      },
    ],
    sources: [
      { label: "NIST CSF 2.0", url: "https://www.nist.gov/cyberframework" },
      { label: "NIST SP 800-61r3", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" },
      { label: "MITRE ATT&CK (v19.2)", url: "https://attack.mitre.org/" },
      { label: "CIS Controls (v8.1)", url: "https://www.cisecurity.org/controls" },
      { label: "SOC-CMM", url: "https://www.soc-cmm.com/" },
    ],
    changelog: [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-soc-01, READY).",
    ],
  },
  ...extraPosts,
];

export const blogPostsByLang: Record<Lang, BlogPost[]> = {
  en: blogPostsEn,
  pt: blogPosts,
  es: blogPostsEs,
};

/** Posts for a given language (content localized; PT is the fallback). */
export const postsForLang = (lang: Lang): BlogPost[] =>
  blogPostsByLang[lang] ?? blogPosts;

export const getPostBySlug = (slug: string, lang?: Lang): BlogPost | undefined =>
  (lang ? postsForLang(lang) : blogPosts).find((p) => p.slug === slug);
