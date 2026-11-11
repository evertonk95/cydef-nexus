import type { BlogPost } from "./posts";

/**
 * Andamento do redesign da plataforma CyDef Inora (PT canônico).
 * Fonte: registros internos das fases 1 a 8 do redesign (10 e 11/11/2026).
 * Capa: public/assets/blog/cydef-inora-redesign-thumb.webp
 */
export const cydefInoraRedesignPost: BlogPost = {
  slug: "cydef-inora-andamento-redesign",
  title: "CyDef Inora: o andamento do redesign da plataforma",
  category: "SOC Engineering",
  excerpt:
    "Redesign completo da interface, migração para React 19 e Tailwind 4, base de conhecimento reconstruída e busca nova. O que já está entregue no CyDef Inora, o que a validação cobriu e o que ainda falta.",
  date: "11 de Novembro, 2026",
  dateISO: "2026-11-11",
  readTime: "6 min",
  image: "/assets/blog/cydef-inora-redesign-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "CyDef Inora",
    "SOC",
    "Produto",
    "Engenharia",
    "Design de Interface",
    "Qualidade",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "O CyDef Inora é a plataforma de operação de SOC que a CyDef está construindo em aberto. Nas últimas semanas o trabalho saiu da funcionalidade e foi para a experiência: cada tela principal foi reescrita, o front migrou de base técnica e a validação passou a cobrir a plataforma nos dois bancos suportados. Este texto é um relato de andamento, não um anúncio de disponibilidade.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Resumo em uma frase",
            body: "A interface foi refeita tela por tela, a base do front foi atualizada para React 19 e Tailwind 4, e cada fase foi entregue com o mesmo gate de validação: tipagem, lint, testes nos dois bancos, isolamento entre organizações, build, análise de dependências e varredura de segredos.",
          },
        },
      ],
    },
    {
      heading: "O que foi refeito na interface",
      blocks: [
        {
          type: "p",
          text: "O redesign não foi um ajuste de cores. Cada tela ganhou estrutura própria, com estados vazios, filtros e contagens vindos da API, em vez de cálculos feitos no navegador. A ordem abaixo segue a sequência em que as fases foram entregues.",
        },
        {
          type: "list",
          title: "Telas entregues",
          items: [
            "**Login**: layout em duas colunas, com painel de marca, marca própria em SVG e microinterações que respeitam a preferência de movimento reduzido do sistema.",
            "**Estrutura e dashboard**: barra lateral com contadores, modo recolhido, busca global, sino de notificações e faixa de indicadores com série diária de alertas por severidade.",
            "**Alertas e aprovações**: fila e detalhe do alerta refeitos, com resumo por severidade, alertas relacionados, filtro por responsável e uma tela própria de aprovações.",
            "**Caso**: cabeçalho novo, faixa de resumo com responsável, SLA restante, risco e playbook, e as abas de tarefas, observáveis, evidências e resposta governada separadas em arquivos próprios.",
            "**Mesclar alertas**: modal no padrão do produto, com prévia do que a mesclagem vai fazer antes de confirmar, incluindo observáveis unificados e tags novas.",
            "**Configuração**: o monolito virou seções endereçáveis por URL, de organizações e usuários a playbooks, SLA, SSO, webhooks, segurança e preferências.",
            "**Base de conhecimento**: virou biblioteca, com leitura em Markdown, sumário lateral, edição com pré-visualização, histórico com comparação entre versões e verificação de integridade da cadeia.",
            "**Busca**: paleta por atalho, com resultados agrupados por tipo, filtros digitados, buscas recentes e uma página de resultados com painel de refinamento e estado sem resultado que sugere o próximo passo.",
          ],
        },
        {
          type: "note",
          text: "Todas as telas novas usam os três idiomas do produto (português, inglês e espanhol) e o mesmo conjunto de componentes, para que a identidade visual não se perca entre páginas.",
        },
      ],
    },
    {
      heading: "A base técnica também mudou",
      blocks: [
        {
          type: "p",
          text: "A interface estava em React 18 com uma camada de estilos que crescia sem regra. A fase de migração levou o projeto para React 19 e Tailwind 4, com uma entrada única de CSS e o estilo antigo preservado em uma camada de compatibilidade, justamente para o redesign não quebrar o que já funcionava.",
        },
        {
          type: "p",
          text: "A consequência mais visível foi o tamanho do pacote inicial: as rotas passaram a ser carregadas sob demanda, com limites de erro em todas as páginas, e o primeiro carregamento caiu de cerca de 689 kB para cerca de 490 kB. Em uma ferramenta usada durante todo o turno de um analista, isso aparece como abertura mais rápida e navegação sem espera entre telas.",
        },
        {
          type: "list",
          title: "Na prática",
          items: [
            "Rotas carregadas por demanda, com fallback discreto durante a transição.",
            "Componentes de interface padronizados, com os mesmos estados de foco, erro e carregamento em todas as telas.",
            "Estilos organizados por área, sem duplicação de regras entre páginas.",
            "Nenhuma dependência nova entrou sem passar pela análise de dependências do gate.",
          ],
        },
      ],
    },
    {
      heading: "Qualidade: o que a validação encontrou",
      blocks: [
        {
          type: "p",
          text: "Cada fase foi entregue com o mesmo conjunto de verificações, e é aí que o trabalho fica interessante: o processo pegou defeitos reais, não apenas problemas de estilo de código.",
        },
        {
          type: "list",
          items: [
            "Uma atualização parcial de tarefa apagava campos que não tinham sido enviados, porque o esquema de validação mantinha valores padrão. O esquema passou a ser declarado campo a campo.",
            "Ao publicar um artigo da base de conhecimento, a tela continuava mostrando o estado anterior, porque a leitura reaproveitava o cache da edição. A publicação passou a invalidar a leitura.",
            "Um painel rolável de pré-visualização não tinha acesso por teclado. Ganhou foco, papel de região e rótulo acessível.",
          ],
        },
        {
          type: "p",
          text: "Os testes de integração rodam nos dois bancos suportados, SQLite e PostgreSQL, com o mesmo cenário e a mesma expectativa de resultado, incluindo o isolamento entre organizações. A suíte de ponta a ponta, que percorre as telas como um analista faria, fechou a fase mais recente com 38 de 38 cenários aprovados.",
        },
      ],
    },
    {
      heading: "O que ainda não está pronto",
      blocks: [
        {
          type: "p",
          text: "Para não transformar andamento em promessa: a plataforma ainda não está aberta ao público e há frentes conhecidas em aberto.",
        },
        {
          type: "list",
          items: [
            "Segundo fator por chave de segurança (WebAuthn) e federação de identidade completa (OIDC e SAML) seguem em desenvolvimento.",
            "Canais de notificação além do que já existe hoje.",
            "Teste de carga na faixa de 10 mil eventos e o procedimento de backup e restauração ainda não foram executados.",
          ],
        },
        {
          type: "p",
          text: "Quando essas frentes fecharem, o próximo relato de andamento mostra o resultado medido, não a intenção. É o mesmo critério que usamos nos artigos técnicos: só afirmar o que foi verificado.",
        },
      ],
    },
  ],
  sources: [
    { label: "CyDef Labs", url: "https://cydef.com.br/pt/labs" },
    { label: "CyDef Academy", url: "https://cydef.com.br/pt/academy" },
  ],
  changelog: [
    "2026-11-11: primeira versão, com base nos registros internos das fases 1 a 8 do redesign.",
  ],
};
