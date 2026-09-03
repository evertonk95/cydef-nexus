// CyDef Academy — course syllabi per language (PT canonical; EN/ES editorial translations, 2026-09-03).
// Human review via PR (foundation gate for article/course content translation).
import type { Lang } from "@/i18n";

export interface CourseModule {
  title: string;
  topics?: string[];
}

export type LevelKey = "beginner" | "intermediate" | "advanced";

export interface Course {
  levelKey: LevelKey;
  duration: string;
  description: string;
  objectives?: string[];
  target?: string;
  prerequisites?: string;
  modules?: CourseModule[];
}

export const courseDataPt: Record<string, Course> = {
  "cybersecurity-fundamentals": {
    levelKey: "beginner",
    duration: "40 horas",
    description:
      "Construa uma base sólida em segurança da informação com este curso completo que aborda desde conceitos fundamentais até práticas essenciais de proteção.",
    objectives: [
      "Compreender os princípios fundamentais de segurança da informação",
      "Dominar conceitos de redes e protocolos essenciais",
      "Entender criptografia e sua aplicação prática",
      "Identificar e mitigar ameaças comuns",
      "Aplicar boas práticas de segurança no dia a dia",
    ],
    target:
      "Iniciantes em cibersegurança, profissionais de TI buscando especialização, estudantes de tecnologia, e qualquer pessoa interessada em construir carreira em segurança.",
    prerequisites:
      "Conhecimentos básicos de informática. Não é necessária experiência prévia em segurança.",
    modules: [
      {
        title: "Fundamentos de Segurança",
        topics: [
          "Confidencialidade, Integridade e Disponibilidade (CIA)",
          "Princípios de Defesa em Profundidade",
          "Gestão de Riscos",
          "Controles de Segurança",
        ],
      },
      {
        title: "Redes e Protocolos",
        topics: [
          "Modelo OSI e TCP/IP",
          "Protocolos de Rede Essenciais",
          "Firewalls e Segmentação",
          "VPNs e Túneis Seguros",
        ],
      },
      {
        title: "Criptografia",
        topics: [
          "Criptografia Simétrica e Assimétrica",
          "Funções Hash",
          "Certificados Digitais",
          "PKI e Infraestrutura de Chave Pública",
        ],
      },
      {
        title: "Ameaças e Vulnerabilidades",
        topics: [
          "Tipos de Malware",
          "Ataques Comuns (Phishing, Ransomware, etc)",
          "Engenharia Social",
          "Ciclo de Vida de um Ataque",
        ],
      },
      {
        title: "Práticas de Segurança",
        topics: [
          "Gestão de Identidade e Acesso",
          "Segurança de Endpoints",
          "Backup e Recuperação",
          "Políticas e Procedimentos",
        ],
      },
    ],
  },
  "soc-analyst": {
    levelKey: "intermediate",
    duration: "80 horas",
    description:
      "Formação completa para atuar como Analista SOC Nível 1 e 2, com foco em detecção, análise e resposta a incidentes de segurança em ambientes corporativos.",
    objectives: [
      "Dominar análise de logs e correlação de eventos",
      "Operar SIEM e ferramentas de detecção",
      "Investigar e responder a incidentes de segurança",
      "Aplicar o framework MITRE ATT&CK na prática",
      "Criar e executar playbooks de resposta",
    ],
    target:
      "Profissionais que desejam atuar em SOC, analistas de suporte buscando especialização, profissionais de TI migrando para segurança.",
    prerequisites:
      "Conhecimentos em redes, sistemas operacionais e fundamentos de segurança. Recomendado ter concluído Cybersecurity Fundamentals ou experiência equivalente.",
    modules: [
      {
        title: "Introdução ao SOC",
        topics: [
          "Estrutura e Processos de um SOC",
          "Papéis e Responsabilidades",
          "Métricas e KPIs",
          "Integração com outras áreas",
        ],
      },
      {
        title: "Análise de Logs",
        topics: [
          "Logs de Sistemas Operacionais",
          "Logs de Rede e Firewall",
          "Logs de Aplicações",
          "Correlação de Eventos",
        ],
      },
      {
        title: "SIEM e Ferramentas de Detecção",
        topics: [
          "Operação de SIEM",
          "Criação de Regras de Detecção",
          "Dashboards e Alertas",
          "Integração de Fontes de Dados",
        ],
      },
      {
        title: "Detecção e Análise de Ameaças",
        topics: [
          "Identificação de Indicadores de Compromisso (IOCs)",
          "Análise de Malware em Contexto SOC",
          "Threat Intelligence",
          "Técnicas de Evasão",
        ],
      },
      {
        title: "Resposta a Incidentes",
        topics: [
          "Fases da Resposta a Incidentes",
          "Triagem e Priorização",
          "Containment e Erradicação",
          "Recovery e Lições Aprendidas",
        ],
      },
      {
        title: "MITRE ATT&CK",
        topics: [
          "Framework MITRE ATT&CK",
          "Mapeamento de Táticas e Técnicas",
          "Detecção Baseada em ATT&CK",
          "Casos Práticos",
        ],
      },
    ],
  },
  "blue-team-advanced": {
    levelKey: "advanced",
    duration: "60 horas",
    description:
      "Curso avançado para profissionais experientes que buscam aprofundar conhecimentos em defesa cibernética, threat hunting, análise forense e estratégias de Blue Team.",
    objectives: [
      "Realizar threat hunting proativo",
      "Conduzir análises forenses avançadas",
      "Implementar defesa em profundidade",
      "Operar EDR em nível avançado",
      "Desenvolver estratégias de detecção customizadas",
    ],
    target:
      "Analistas SOC experientes, profissionais de Blue Team, especialistas em segurança que desejam evoluir para posições sênior.",
    prerequisites:
      "Experiência sólida em SOC ou segurança defensiva. Recomendado ter concluído SOC Analyst ou experiência equivalente de 1+ ano.",
    modules: [
      {
        title: "Threat Hunting Avançado",
        topics: [
          "Metodologias de Hunting",
          "Hipóteses e Investigações",
          "Hunting em Rede",
          "Hunting em Endpoints",
        ],
      },
      {
        title: "Análise Forense Digital",
        topics: [
          "Aquisição e Preservação de Evidências",
          "Análise de Memória",
          "Análise de Disco",
          "Timeline Analysis",
        ],
      },
      {
        title: "EDR Avançado",
        topics: [
          "Detecção Comportamental",
          "Response Automatizado",
          "Análise de Telemetria",
          "Tuning e Otimização",
        ],
      },
      {
        title: "Defesa em Profundidade",
        topics: [
          "Arquitetura de Defesa em Camadas",
          "Segmentação Avançada",
          "Microsegmentação",
          "Zero Trust",
        ],
      },
    ],
  },
};

export const courseDataEn: Record<string, Course> = {
  "cybersecurity-fundamentals": {
    levelKey: "beginner",
    duration: "40 hours",
    description:
      "Build a solid foundation in information security with this complete course, from fundamental concepts to essential protection practices.",
    objectives: [
      "Understand the core principles of information security",
      "Master essential networking concepts and protocols",
      "Understand cryptography and its practical applications",
      "Identify and mitigate common threats",
      "Apply security best practices in day-to-day work",
    ],
    target:
      "Cybersecurity beginners, IT professionals seeking specialization, technology students, and anyone interested in building a career in security.",
    prerequisites:
      "Basic computer skills. No previous security experience required.",
    modules: [
      {
        title: "Security Fundamentals",
        topics: [
          "Confidentiality, Integrity and Availability (CIA)",
          "Defense in Depth Principles",
          "Risk Management",
          "Security Controls",
        ],
      },
      {
        title: "Networks and Protocols",
        topics: [
          "OSI and TCP/IP Models",
          "Essential Network Protocols",
          "Firewalls and Segmentation",
          "VPNs and Secure Tunnels",
        ],
      },
      {
        title: "Cryptography",
        topics: [
          "Symmetric and Asymmetric Cryptography",
          "Hash Functions",
          "Digital Certificates",
          "PKI and Public Key Infrastructure",
        ],
      },
      {
        title: "Threats and Vulnerabilities",
        topics: [
          "Malware Types",
          "Common Attacks (Phishing, Ransomware, etc.)",
          "Social Engineering",
          "Attack Lifecycle",
        ],
      },
      {
        title: "Security Practices",
        topics: [
          "Identity and Access Management",
          "Endpoint Security",
          "Backup and Recovery",
          "Policies and Procedures",
        ],
      },
    ],
  },
  "soc-analyst": {
    levelKey: "intermediate",
    duration: "80 hours",
    description:
      "Complete training to work as a SOC Level 1 and Level 2 Analyst, focused on detection, analysis and response to security incidents in corporate environments.",
    objectives: [
      "Master log analysis and event correlation",
      "Operate SIEM and detection tools",
      "Investigate and respond to security incidents",
      "Apply the MITRE ATT&CK framework in practice",
      "Create and run response playbooks",
    ],
    target:
      "Professionals who want to work in a SOC, support analysts seeking specialization, and IT professionals moving into security.",
    prerequisites:
      "Knowledge of networks, operating systems and security fundamentals. Completing Cybersecurity Fundamentals or equivalent experience is recommended.",
    modules: [
      {
        title: "Introduction to the SOC",
        topics: [
          "SOC Structure and Processes",
          "Roles and Responsibilities",
          "Metrics and KPIs",
          "Integration with Other Teams",
        ],
      },
      {
        title: "Log Analysis",
        topics: [
          "Operating System Logs",
          "Network and Firewall Logs",
          "Application Logs",
          "Event Correlation",
        ],
      },
      {
        title: "SIEM and Detection Tools",
        topics: [
          "SIEM Operations",
          "Creating Detection Rules",
          "Dashboards and Alerts",
          "Data Source Integration",
        ],
      },
      {
        title: "Threat Detection and Analysis",
        topics: [
          "Identifying Indicators of Compromise (IOCs)",
          "Malware Analysis in a SOC Context",
          "Threat Intelligence",
          "Evasion Techniques",
        ],
      },
      {
        title: "Incident Response",
        topics: [
          "Incident Response Phases",
          "Triage and Prioritization",
          "Containment and Eradication",
          "Recovery and Lessons Learned",
        ],
      },
      {
        title: "MITRE ATT&CK",
        topics: [
          "The MITRE ATT&CK Framework",
          "Mapping Tactics and Techniques",
          "ATT&CK-Based Detection",
          "Hands-on Cases",
        ],
      },
    ],
  },
  "blue-team-advanced": {
    levelKey: "advanced",
    duration: "60 hours",
    description:
      "Advanced course for experienced professionals who want to deepen their knowledge of cyber defense, threat hunting, forensic analysis and Blue Team strategies.",
    objectives: [
      "Carry out proactive threat hunting",
      "Run advanced forensic analysis",
      "Implement defense in depth",
      "Operate EDR at an advanced level",
      "Develop custom detection strategies",
    ],
    target:
      "Experienced SOC analysts, Blue Team professionals and security specialists who want to move into senior positions.",
    prerequisites:
      "Solid experience in SOC or defensive security. Completing SOC Analyst or 1+ year of equivalent experience is recommended.",
    modules: [
      {
        title: "Advanced Threat Hunting",
        topics: [
          "Hunting Methodologies",
          "Hypotheses and Investigations",
          "Network Hunting",
          "Endpoint Hunting",
        ],
      },
      {
        title: "Digital Forensics",
        topics: [
          "Evidence Acquisition and Preservation",
          "Memory Analysis",
          "Disk Analysis",
          "Timeline Analysis",
        ],
      },
      {
        title: "Advanced EDR",
        topics: [
          "Behavioral Detection",
          "Automated Response",
          "Telemetry Analysis",
          "Tuning and Optimization",
        ],
      },
      {
        title: "Defense in Depth",
        topics: [
          "Layered Defense Architecture",
          "Advanced Segmentation",
          "Microsegmentation",
          "Zero Trust",
        ],
      },
    ],
  },
};

export const courseDataEs: Record<string, Course> = {
  "cybersecurity-fundamentals": {
    levelKey: "beginner",
    duration: "40 horas",
    description:
      "Construye una base sólida en seguridad de la información con este curso completo, desde los conceptos fundamentales hasta las prácticas esenciales de protección.",
    objectives: [
      "Comprender los principios fundamentales de la seguridad de la información",
      "Dominar conceptos esenciales de redes y protocolos",
      "Entender la criptografía y su aplicación práctica",
      "Identificar y mitigar amenazas comunes",
      "Aplicar buenas prácticas de seguridad en el día a día",
    ],
    target:
      "Principiantes en ciberseguridad, profesionales de TI que buscan especializarse, estudiantes de tecnología y cualquier persona interesada en construir una carrera en seguridad.",
    prerequisites:
      "Conocimientos básicos de informática. No se requiere experiencia previa en seguridad.",
    modules: [
      {
        title: "Fundamentos de Seguridad",
        topics: [
          "Confidencialidad, Integridad y Disponibilidad (CIA)",
          "Principios de Defensa en Profundidad",
          "Gestión de Riesgos",
          "Controles de Seguridad",
        ],
      },
      {
        title: "Redes y Protocolos",
        topics: [
          "Modelo OSI y TCP/IP",
          "Protocolos de Red Esenciales",
          "Firewalls y Segmentación",
          "VPN y Túneles Seguros",
        ],
      },
      {
        title: "Criptografía",
        topics: [
          "Criptografía Simétrica y Asimétrica",
          "Funciones Hash",
          "Certificados Digitales",
          "PKI e Infraestructura de Clave Pública",
        ],
      },
      {
        title: "Amenazas y Vulnerabilidades",
        topics: [
          "Tipos de Malware",
          "Ataques Comunes (Phishing, Ransomware, etc.)",
          "Ingeniería Social",
          "Ciclo de Vida de un Ataque",
        ],
      },
      {
        title: "Prácticas de Seguridad",
        topics: [
          "Gestión de Identidad y Acceso",
          "Seguridad de Endpoints",
          "Backup y Recuperación",
          "Políticas y Procedimientos",
        ],
      },
    ],
  },
  "soc-analyst": {
    levelKey: "intermediate",
    duration: "80 horas",
    description:
      "Formación completa para trabajar como Analista SOC Nivel 1 y 2, centrada en la detección, el análisis y la respuesta a incidentes de seguridad en entornos corporativos.",
    objectives: [
      "Dominar el análisis de logs y la correlación de eventos",
      "Operar SIEM y herramientas de detección",
      "Investigar y responder a incidentes de seguridad",
      "Aplicar el framework MITRE ATT&CK en la práctica",
      "Crear y ejecutar playbooks de respuesta",
    ],
    target:
      "Profesionales que desean trabajar en un SOC, analistas de soporte que buscan especializarse y profesionales de TI que migran hacia la seguridad.",
    prerequisites:
      "Conocimientos de redes, sistemas operativos y fundamentos de seguridad. Se recomienda haber completado Cybersecurity Fundamentals o tener experiencia equivalente.",
    modules: [
      {
        title: "Introducción al SOC",
        topics: [
          "Estructura y Procesos de un SOC",
          "Roles y Responsabilidades",
          "Métricas y KPIs",
          "Integración con otras áreas",
        ],
      },
      {
        title: "Análisis de Logs",
        topics: [
          "Logs de Sistemas Operativos",
          "Logs de Red y Firewall",
          "Logs de Aplicaciones",
          "Correlación de Eventos",
        ],
      },
      {
        title: "SIEM y Herramientas de Detección",
        topics: [
          "Operación de SIEM",
          "Creación de Reglas de Detección",
          "Dashboards y Alertas",
          "Integración de Fuentes de Datos",
        ],
      },
      {
        title: "Detección y Análisis de Amenazas",
        topics: [
          "Identificación de Indicadores de Compromiso (IOCs)",
          "Análisis de Malware en Contexto SOC",
          "Threat Intelligence",
          "Técnicas de Evasión",
        ],
      },
      {
        title: "Respuesta a Incidentes",
        topics: [
          "Fases de la Respuesta a Incidentes",
          "Triaje y Priorización",
          "Contención y Erradicación",
          "Recuperación y Lecciones Aprendidas",
        ],
      },
      {
        title: "MITRE ATT&CK",
        topics: [
          "Framework MITRE ATT&CK",
          "Mapeo de Tácticas y Técnicas",
          "Detección Basada en ATT&CK",
          "Casos Prácticos",
        ],
      },
    ],
  },
  "blue-team-advanced": {
    levelKey: "advanced",
    duration: "60 horas",
    description:
      "Curso avanzado para profesionales con experiencia que quieren profundizar en defensa cibernética, threat hunting, análisis forense y estrategias de Blue Team.",
    objectives: [
      "Realizar threat hunting proactivo",
      "Llevar a cabo análisis forenses avanzados",
      "Implementar defensa en profundidad",
      "Operar EDR a nivel avanzado",
      "Desarrollar estrategias de detección personalizadas",
    ],
    target:
      "Analistas SOC con experiencia, profesionales de Blue Team y especialistas en seguridad que quieren evolucionar hacia posiciones senior.",
    prerequisites:
      "Experiencia sólida en SOC o seguridad defensiva. Se recomienda haber completado SOC Analyst o tener 1+ año de experiencia equivalente.",
    modules: [
      {
        title: "Threat Hunting Avanzado",
        topics: [
          "Metodologías de Hunting",
          "Hipótesis e Investigaciones",
          "Hunting en Red",
          "Hunting en Endpoints",
        ],
      },
      {
        title: "Análisis Forense Digital",
        topics: [
          "Adquisición y Preservación de Evidencias",
          "Análisis de Memoria",
          "Análisis de Disco",
          "Timeline Analysis",
        ],
      },
      {
        title: "EDR Avanzado",
        topics: [
          "Detección de Comportamiento",
          "Respuesta Automatizada",
          "Análisis de Telemetría",
          "Tuning y Optimización",
        ],
      },
      {
        title: "Defensa en Profundidad",
        topics: [
          "Arquitectura de Defensa por Capas",
          "Segmentación Avanzada",
          "Microsegmentación",
          "Zero Trust",
        ],
      },
    ],
  },
};

export const coursesByLang: Record<Lang, Record<string, Course>> = {
  pt: courseDataPt,
  en: courseDataEn,
  es: courseDataEs,
};
