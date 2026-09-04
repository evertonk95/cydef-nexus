// CyDef site — Privacy Policy content per language.
// PT canonical (honest revision, 2026-09-03, aligning copy with the real
// ecosystem state: no managed services yet). EN/ES editorial translations.
// Gate: human/legal review via PR before merge.
import type { Lang } from "@/i18n";

export interface LegalSection {
  title: string;
  paragraphs: string[];
  list?: { ordered?: boolean; items: string[] };
  closing?: string[];
}

export interface PrivacyDoc {
  docTitle: string;
  updatedLabel: string;
  updatedAt: string;
  contactIntro: string;
  dpoEmail: string;
  sections: LegalSection[];
}

export const privacyDocPt: PrivacyDoc = {
  docTitle: "Política de Privacidade",
  updatedLabel: "Última atualização:",
  updatedAt: "4 de setembro de 2026",
  contactIntro: "Dúvidas sobre esta Política? Fale com nosso encarregado:",
  dpoEmail: "contato@cydef.com.br",
  sections: [
    {
      title: "1. Quem somos",
      paragraphs: [
        "A **CyDef** é um ecossistema de cibersegurança em construção. Hoje publicamos conteúdo técnico verificável (Blog) e mantemos a CyDef Academy, com cursos gratuitos de entrada e pré-inscrição aberta. Ainda não prestamos serviços gerenciados de segurança; quando passarmos a oferecer novos produtos ou serviços, esta Política será revisada e atualizada antes.",
      ],
      list: {
        items: [
          "**Site:** https://www.cydef.com.br",
          "**Contato para privacidade (DPO):** contato@cydef.com.br",
        ],
      },
      closing: [
        "Esta Política explica como tratamos seus dados pessoais, em conformidade com a **Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)**.",
      ],
    },
    {
      title: "2. Dados que coletamos",
      paragraphs: [
        "**2.1. Contato e mensagens (WhatsApp, e-mail e formulários)** — Nome, e-mail, país e mensagem (incluindo objetivos informados). Fornecido voluntariamente por você.",
        "**2.2. Pré-inscrição na CyDef Academy** — Nome, e-mail e perfil declarado, para processar sua pré-inscrição nos cursos gratuitos e enviar o e-mail de confirmação. Quando a área do aluno for liberada, poderá incluir dados de progresso e histórico de acesso.",
        "**2.3. Dados de navegação e análise** — Endereço IP, tipo de navegador, páginas visitadas e tempo de permanência, coletados por ferramentas de análise (ex.: Google Analytics 4), quando aplicável e com seu consentimento.",
        "**2.4. Dados de pagamento (quando disponível)** — Processados exclusivamente por provedores de pagamento. Não armazenamos números de cartão ou dados completos de pagamento.",
      ],
    },
    {
      title: "3. Para que usamos seus dados",
      paragraphs: [],
      list: {
        items: [
          "Responder a solicitações de contato e mensagens — *Consentimento (art. 7º, I)*",
          "Processar pré-inscrição e entrega dos cursos gratuitos da Academy — *Execução de contrato ou de procedimentos preliminares (art. 7º, V)*",
          "Segurança do site (proteção contra fraudes e ataques) — *Legítimo interesse (art. 7º, IX)*",
          "Análise de audiência e melhoria do site — *Consentimento (quando exigido)*",
        ],
      },
      closing: [
        "Não utilizamos seus dados para finalidades incompatíveis com as descritas acima. Se uma nova finalidade surgir, você será informado previamente.",
      ],
    },
    {
      title: "4. Compartilhamento de dados",
      paragraphs: [
        "Compartilhamos seus dados apenas com:",
      ],
      list: {
        items: [
          "**Provedores de infraestrutura e hospedagem** (ex.: GitHub Pages, Cloudflare) — necessários ao funcionamento do site;",
          "**Ferramentas de análise** (ex.: Google Analytics) — para medir audiência, quando você consente;",
          "**Provedores de autenticação, e-mail e pagamento** — para viabilizar a Academy e transações, quando disponíveis;",
          "**Autoridades públicas** — quando exigido por lei ou ordem judicial.",
        ],
      },
      closing: [
        "**Nunca vendemos seus dados pessoais.**",
      ],
    },
    {
      title: "5. Cookies e tecnologias semelhantes",
      paragraphs: [
        "Utilizamos cookies essenciais (necessários ao funcionamento do site) e, com seu consentimento, cookies analíticos para entender o uso da página. Você pode gerenciar ou desativar cookies nas configurações do seu navegador. A desativação de cookies essenciais pode afetar o funcionamento do site.",
      ],
    },
    {
      title: "6. Retenção dos dados",
      paragraphs: [],
      list: {
        items: [
          "Mensagens de contato: até **12 meses** após o último contato;",
          "Pré-inscrições da Academy: enquanto a oferta gratuita estiver ativa e pelo prazo previsto no aviso de privacidade da pré-inscrição;",
          "Dados de navegação/análise: conforme período definido pela ferramenta utilizada (ex.: até 14 meses no GA4).",
        ],
      },
      closing: [
        "Ao final do período, os dados são excluídos ou anonimizados.",
      ],
    },
    {
      title: "7. Seus direitos (LGPD)",
      paragraphs: [
        "Você pode, a qualquer momento, solicitar:",
      ],
      list: {
        ordered: true,
        items: [
          "Confirmação da existência de tratamento;",
          "Acesso aos seus dados;",
          "Correção de dados incompletos, inexatos ou desatualizados;",
          "Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;",
          "Portabilidade dos dados a outro fornecedor (mediante regulamentação);",
          "Revogação do consentimento;",
          "Informação sobre compartilhamento com terceiros.",
        ],
      },
      closing: [
        "Para exercer seus direitos, envie e-mail para **contato@cydef.com.br** com o assunto \"LGPD — Solicitação de titular\". Responderemos em até **15 dias**.",
      ],
    },
    {
      title: "8. Segurança",
      paragraphs: [
        "Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:",
      ],
      list: {
        items: [
          "HTTPS em todo o site (criptografia em trânsito);",
          "Controles de acesso restritos;",
          "Revisões de segurança e boas práticas de hardening;",
          "Avaliação periódica de vulnerabilidades.",
        ],
      },
      closing: [
        "Nenhum sistema é 100% seguro. Em caso de incidente que possa causar risco a você, notificaremos conforme exigido pela LGPD.",
      ],
    },
    {
      title: "9. Transferência internacional",
      paragraphs: [
        "Parte dos nossos serviços pode envolver provedores com servidores fora do Brasil (ex.: GitHub, Cloudflare, Google). Nesses casos, adotamos cláusulas contratuais e garantias adequadas ao nível de proteção exigido pela LGPD.",
      ],
    },
    {
      title: "10. Menores de idade",
      paragraphs: [
        "Nosso site não é direcionado a menores de 13 anos e não coletamos intencionalmente dados de crianças. Se identificarmos coleta acidental, os dados serão excluídos.",
      ],
    },
    {
      title: "11. Alterações desta Política",
      paragraphs: [
        "Esta Política pode ser atualizada a qualquer momento. A versão vigente estará sempre disponível nesta página, com a data de atualização no topo. Mudanças relevantes serão comunicadas por e-mail ou aviso no site.",
      ],
    },
    {
      title: "12. Encarregado de dados (DPO)",
      paragraphs: [],
      list: {
        items: [
          "**E-mail:** contato@cydef.com.br",
          "**Prazo de resposta:** até 15 dias",
        ],
      },
    },
    {
      title: "13. Foro e legislação aplicável",
      paragraphs: [
        "Esta Política é regida pela legislação brasileira. Fica eleito o foro de Brasília/DF para dirimir dúvidas ou controvérsias, sem prejuízo de reclamações junto à **ANPD** (Autoridade Nacional de Proteção de Dados).",
      ],
    },
  ],
};

export const privacyDocEn: PrivacyDoc = {
  docTitle: "Privacy Policy",
  updatedLabel: "Last updated:",
  updatedAt: "September 4, 2026",
  contactIntro: "Questions about this Policy? Contact our data protection officer:",
  dpoEmail: "contato@cydef.com.br",
  sections: [
    {
      title: "1. Who we are",
      paragraphs: [
        "**CyDef** is a cybersecurity ecosystem under construction. Today we publish verifiable technical content (Blog) and run the CyDef Academy, with free entry courses and open pre-enrollment. We do not provide managed security services yet; whenever we start offering new products or services, this Policy will be reviewed and updated in advance.",
      ],
      list: {
        items: [
          "**Site:** https://www.cydef.com.br",
          "**Privacy contact (DPO):** contato@cydef.com.br",
        ],
      },
      closing: [
        "This Policy explains how we process your personal data, in compliance with the Brazilian **General Data Protection Law (LGPD — Law No. 13.709/2018)**.",
      ],
    },
    {
      title: "2. Data we collect",
      paragraphs: [
        "**2.1. Contact and messages (WhatsApp, email and forms)** — Name, email, country and message (including goals you share). Provided voluntarily by you.",
        "**2.2. CyDef Academy pre-enrollment** — Name, email and declared profile, to process your pre-enrollment in the free courses and send the confirmation email. When the student area is released, it may also include course progress and access history.",
        "**2.3. Browsing and analytics data** — IP address, browser type, pages visited and time on site, collected by analytics tools (e.g., Google Analytics 4) when applicable and with your consent.",
        "**2.4. Payment data (when available)** — Processed exclusively by payment providers. We do not store card numbers or complete payment data.",
      ],
    },
    {
      title: "3. How we use your data",
      paragraphs: [],
      list: {
        items: [
          "Reply to contact requests and messages — *Consent (Art. 7, I)*",
          "Process Academy pre-enrollment and delivery of free entry courses — *Performance of a contract or preliminary steps (Art. 7, V)*",
          "Site security (protection against fraud and attacks) — *Legitimate interest (Art. 7, IX)*",
          "Audience analytics and site improvement — *Consent (where required)*",
        ],
      },
      closing: [
        "We do not use your data for purposes incompatible with the ones described above. If a new purpose arises, we will inform you in advance.",
      ],
    },
    {
      title: "4. Data sharing",
      paragraphs: [
        "We share your data only with:",
      ],
      list: {
        items: [
          "**Infrastructure and hosting providers** (e.g., GitHub Pages, Cloudflare) — required for the site to work;",
          "**Analytics tools** (e.g., Google Analytics) — to measure audience, when you consent;",
          "**Authentication, email and payment providers** — to run the Academy and transactions, when available;",
          "**Public authorities** — when required by law or court order.",
        ],
      },
      closing: [
        "**We never sell your personal data.**",
      ],
    },
    {
      title: "5. Cookies and similar technologies",
      paragraphs: [
        "We use essential cookies (required for the site to work) and, with your consent, analytics cookies to understand how the page is used. You can manage or disable cookies in your browser settings. Disabling essential cookies may affect how the site works.",
      ],
    },
    {
      title: "6. Data retention",
      paragraphs: [],
      list: {
        items: [
          "Contact messages: up to **12 months** after the last contact;",
          "Academy pre-enrollments: while the free offer is active and for the period set out in the pre-enrollment privacy notice;",
          "Browsing/analytics data: according to the period defined by the tool used (e.g., up to 14 months in GA4).",
        ],
      },
      closing: [
        "At the end of the period, data is deleted or anonymized.",
      ],
    },
    {
      title: "7. Your rights (LGPD)",
      paragraphs: [
        "You may, at any time, request:",
      ],
      list: {
        ordered: true,
        items: [
          "Confirmation that processing exists;",
          "Access to your data;",
          "Correction of incomplete, inaccurate or outdated data;",
          "Anonymization, blocking or deletion of unnecessary or excessive data;",
          "Portability of your data to another provider (as regulated);",
          "Withdrawal of consent;",
          "Information about sharing with third parties.",
        ],
      },
      closing: [
        "To exercise your rights, email **contato@cydef.com.br** with the subject \"LGPD — Data subject request\". We will respond within **15 days**.",
      ],
    },
    {
      title: "8. Security",
      paragraphs: [
        "We adopt technical and organizational measures to protect your data, including:",
      ],
      list: {
        items: [
          "HTTPS across the whole site (encryption in transit);",
          "Restricted access controls;",
          "Security reviews and hardening best practices;",
          "Periodic vulnerability assessment.",
        ],
      },
      closing: [
        "No system is 100% secure. If an incident occurs that may put you at risk, we will notify you as required by the LGPD.",
      ],
    },
    {
      title: "9. International transfers",
      paragraphs: [
        "Part of our services may rely on providers with servers outside Brazil (e.g., GitHub, Cloudflare, Google). In those cases, we adopt contractual clauses and safeguards appropriate to the level of protection required by the LGPD.",
      ],
    },
    {
      title: "10. Minors",
      paragraphs: [
        "Our site is not directed at children under 13 and we do not intentionally collect children's data. If we identify accidental collection, the data will be deleted.",
      ],
    },
    {
      title: "11. Changes to this Policy",
      paragraphs: [
        "This Policy may be updated at any time. The current version will always be available on this page, with the update date at the top. Material changes will be communicated by email or a notice on the site.",
      ],
    },
    {
      title: "12. Data Protection Officer (DPO)",
      paragraphs: [],
      list: {
        items: [
          "**Email:** contato@cydef.com.br",
          "**Response time:** within 15 days",
        ],
      },
    },
    {
      title: "13. Governing law and jurisdiction",
      paragraphs: [
        "This Policy is governed by Brazilian law. The courts of Brasília/DF are elected to settle questions or disputes, without prejudice to complaints filed with the **ANPD** (Brazilian National Data Protection Authority).",
      ],
    },
  ],
};

export const privacyDocEs: PrivacyDoc = {
  docTitle: "Política de Privacidad",
  updatedLabel: "Última actualización:",
  updatedAt: "4 de septiembre de 2026",
  contactIntro: "¿Dudas sobre esta Política? Habla con nuestro encargado de datos:",
  dpoEmail: "contato@cydef.com.br",
  sections: [
    {
      title: "1. Quiénes somos",
      paragraphs: [
        "**CyDef** es un ecosistema de ciberseguridad en construcción. Hoy publicamos contenido técnico verificable (Blog) y mantenemos la CyDef Academy, con cursos gratuitos de entrada y preinscripción abierta. Todavía no prestamos servicios gestionados de seguridad; cuando empecemos a ofrecer nuevos productos o servicios, esta Política será revisada y actualizada con antelación.",
      ],
      list: {
        items: [
          "**Sitio:** https://www.cydef.com.br",
          "**Contacto de privacidad (DPO):** contato@cydef.com.br",
        ],
      },
      closing: [
        "Esta Política explica cómo tratamos tus datos personales, en cumplimiento de la **Ley General de Protección de Datos de Brasil (LGPD — Ley n.º 13.709/2018)**.",
      ],
    },
    {
      title: "2. Datos que recopilamos",
      paragraphs: [
        "**2.1. Contacto y mensajes (WhatsApp, correo electrónico y formularios)** — Nombre, correo electrónico, país y mensaje (incluidos los objetivos que compartes). Proporcionados voluntariamente por ti.",
        "**2.2. Preinscripción en la CyDef Academy** — Nombre, correo electrónico y perfil declarado, para procesar tu preinscripción en los cursos gratuitos y enviar el correo de confirmación. Cuando se libere el área de estudiantes, podrá incluir datos de progreso e historial de acceso.",
        "**2.3. Datos de navegación y análisis** — Dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia, recopilados por herramientas de análisis (p. ej., Google Analytics 4), cuando corresponda y con tu consentimiento.",
        "**2.4. Datos de pago (cuando estén disponibles)** — Procesados exclusivamente por proveedores de pago. No almacenamos números de tarjeta ni datos completos de pago.",
      ],
    },
    {
      title: "3. Para qué usamos tus datos",
      paragraphs: [],
      list: {
        items: [
          "Responder a solicitudes de contacto y mensajes — *Consentimiento (art. 7.º, I)*",
          "Procesar la preinscripción y la entrega de los cursos gratuitos de la Academy — *Ejecución de un contrato o de trámites preliminares (art. 7.º, V)*",
          "Seguridad del sitio (protección contra fraudes y ataques) — *Interés legítimo (art. 7.º, IX)*",
          "Análisis de audiencia y mejora del sitio — *Consentimiento (cuando se exija)*",
        ],
      },
      closing: [
        "No usamos tus datos para finalidades incompatibles con las descritas. Si surge una finalidad nueva, te informaremos con antelación.",
      ],
    },
    {
      title: "4. Compartición de datos",
      paragraphs: [
        "Compartimos tus datos únicamente con:",
      ],
      list: {
        items: [
          "**Proveedores de infraestructura y alojamiento** (p. ej., GitHub Pages, Cloudflare) — necesarios para el funcionamiento del sitio;",
          "**Herramientas de análisis** (p. ej., Google Analytics) — para medir la audiencia, cuando das tu consentimiento;",
          "**Proveedores de autenticación, correo y pago** — para operar la Academy y las transacciones, cuando estén disponibles;",
          "**Autoridades públicas** — cuando lo exija la ley o una orden judicial.",
        ],
      },
      closing: [
        "**Nunca vendemos tus datos personales.**",
      ],
    },
    {
      title: "5. Cookies y tecnologías similares",
      paragraphs: [
        "Usamos cookies esenciales (necesarias para el funcionamiento del sitio) y, con tu consentimiento, cookies analíticas para entender el uso de la página. Puedes gestionar o desactivar las cookies en la configuración de tu navegador. Desactivar las cookies esenciales puede afectar al funcionamiento del sitio.",
      ],
    },
    {
      title: "6. Conservación de los datos",
      paragraphs: [],
      list: {
        items: [
          "Mensajes de contacto: hasta **12 meses** después del último contacto;",
          "Preinscripciones de la Academy: mientras la oferta gratuita esté activa y durante el plazo previsto en el aviso de privacidad de la preinscripción;",
          "Datos de navegación/análisis: según el período definido por la herramienta utilizada (p. ej., hasta 14 meses en GA4).",
        ],
      },
      closing: [
        "Al final del período, los datos se eliminan o se anonimizan.",
      ],
    },
    {
      title: "7. Tus derechos (LGPD)",
      paragraphs: [
        "Puedes solicitar, en cualquier momento:",
      ],
      list: {
        ordered: true,
        items: [
          "Confirmación de la existencia del tratamiento;",
          "Acceso a tus datos;",
          "Corrección de datos incompletos, inexactos o desactualizados;",
          "Anonimización, bloqueo o eliminación de datos innecesarios o excesivos;",
          "Portabilidad de tus datos a otro proveedor (según la regulación);",
          "Revocación del consentimiento;",
          "Información sobre la compartición con terceros.",
        ],
      },
      closing: [
        "Para ejercer tus derechos, escribe a **contato@cydef.com.br** con el asunto \"LGPD — Solicitud de titular\". Responderemos en un plazo de **15 días**.",
      ],
    },
    {
      title: "8. Seguridad",
      paragraphs: [
        "Adoptamos medidas técnicas y organizativas para proteger tus datos, entre ellas:",
      ],
      list: {
        items: [
          "HTTPS en todo el sitio (cifrado en tránsito);",
          "Controles de acceso restringidos;",
          "Revisiones de seguridad y buenas prácticas de hardening;",
          "Evaluación periódica de vulnerabilidades.",
        ],
      },
      closing: [
        "Ningún sistema es 100 % seguro. Si se produce un incidente que pueda suponer un riesgo para ti, te notificaremos según exige la LGPD.",
      ],
    },
    {
      title: "9. Transferencia internacional",
      paragraphs: [
        "Parte de nuestros servicios puede implicar proveedores con servidores fuera de Brasil (p. ej., GitHub, Cloudflare, Google). En esos casos, adoptamos cláusulas contractuales y garantías adecuadas al nivel de protección exigido por la LGPD.",
      ],
    },
    {
      title: "10. Menores de edad",
      paragraphs: [
        "Nuestro sitio no está dirigido a menores de 13 años y no recopilamos intencionadamente datos de niños. Si identificamos una recopilación accidental, los datos se eliminarán.",
      ],
    },
    {
      title: "11. Cambios en esta Política",
      paragraphs: [
        "Esta Política puede actualizarse en cualquier momento. La versión vigente estará siempre disponible en esta página, con la fecha de actualización en la parte superior. Los cambios relevantes se comunicarán por correo electrónico o mediante un aviso en el sitio.",
      ],
    },
    {
      title: "12. Encargado de datos (DPO)",
      paragraphs: [],
      list: {
        items: [
          "**Correo electrónico:** contato@cydef.com.br",
          "**Plazo de respuesta:** dentro de 15 días",
        ],
      },
    },
    {
      title: "13. Legislación y fuero aplicables",
      paragraphs: [
        "Esta Política se rige por la legislación brasileña. Se elige el fuero de Brasilia/DF para resolver dudas o controversias, sin perjuicio de las reclamaciones ante la **ANPD** (Autoridad Nacional de Protección de Datos de Brasil).",
      ],
    },
  ],
};

export const privacyByLang: Record<Lang, PrivacyDoc> = {
  pt: privacyDocPt,
  en: privacyDocEn,
  es: privacyDocEs,
};
