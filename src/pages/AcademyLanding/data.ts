/**
 * Dados de conteúdo da landing (UX package v8).
 * REQ-009: nenhuma promessa de emprego/salário/certificação — oferta factual.
 */

export const COURSES = [
  {
    id: "fundamentos-para-soc",
    title: "Fundamentos para SOC",
    description:
      "Conceitos essenciais de segurança operacional, triagem de alertas e primeiros passos para atuar em um Centro de Operações de Segurança.",
    level: "Iniciante",
    duration: "~4h",
    topics: ["Conceitos de SOC", "Triagem de alertas", "Primeiros passos"],
  },
  {
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    description:
      "Base de segurança da informação para o dia a dia: princípios, ameaças comuns e boas práticas de defesa.",
    level: "Iniciante",
    duration: "~6h",
    topics: ["Princípios de segurança", "Ameaças comuns", "Boas práticas"],
  },
] as const;

export const STEPS = [
  {
    title: "Pré-inscreva-se",
    description: "Preencha o formulário em menos de 30 segundos e confirme seu e-mail.",
  },
  {
    title: "Receba o acesso",
    description: "Enviaremos o acesso aos cursos gratuitos no seu e-mail.",
  },
  {
    title: "Estude no seu ritmo",
    description: "Conteúdo prático para você começar a construir sua base em segurança.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "É realmente grátis?",
    answer:
      "Sim. Estes dois cursos de entrada são 100% gratuitos, sem cartão de crédito e sem cobrança escondida. A CyDef Academy terá cursos pagos no futuro — você será sempre informado com clareza sobre o que é grátis e o que é pago.",
  },
  {
    question: "Quando começa?",
    answer:
      "As turmas da fase de pré-inscrição começam quando o conteúdo estiver publicado e você receber o acesso por e-mail. A confirmação da pré-inscrição não garante vaga imediata — garante prioridade na comunicação.",
  },
  {
    question: "Preciso de experiência?",
    answer:
      "Não. Os dois cursos são de nível iniciante, desenhados para quem está começando ou migrando para a área de cibersegurança (SOC, Blue Team, governança e outras frentes).",
  },
  {
    question: "O que vem depois?",
    answer:
      "Depois dos cursos gratuitos, você conhecerá a CyDef Academy completa, com formações avançadas e pagas — sempre com transparência sobre custos e conteúdo.",
  },
] as const;
