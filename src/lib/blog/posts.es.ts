// CyDef Blog — Traducción editorial al español (fuente: canónico PT, 2026-09-03). Revisión humana vía PR.
import type { BlogPost } from "./posts";
import { wazuhEmMovimentoPostEs } from "./posts.wazuh.es";

export const blogPostsEs: BlogPost[] = [
  wazuhEmMovimentoPostEs,
  {
    slug: "como-estruturar-um-soc-do-zero",
    title: "Cómo estructurar un SOC desde cero: Guía completa",
    category: "SOC",
    excerpt:
      "Guía en 5 fases para crear un SOC desde cero: alcance, personas, procesos, tecnología y métricas, con referencias oficiales del NIST, MITRE y CIS.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "8 min de lectura",
    image: "/assets/blog/soc-do-zero-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "Montar un Centro de Operaciones de Seguridad (SOC) desde cero es una decisión estructural: define cómo la organización percibe las amenazas, responde a incidentes y evoluciona su postura de seguridad. Esta guía presenta un camino en cinco fases — alcance, personas, procesos, tecnología y métricas — anclado en fuentes oficiales vigentes: NIST Cybersecurity Framework (CSF) 2.0, NIST SP 800-61r3, MITRE ATT&CK, CIS Controls y SOC-CMM. Hasta la fecha de corte de esta verificación (24/08/2026), estas son las referencias vigentes consultadas. La aplicación de cada fase depende del contexto de su organización; ninguna herramienta específica es obligatoria.",
        ],
      },
      {
        heading: "Qué es un SOC y cuándo tiene sentido crearlo",
        paragraphs: [
          "Un SOC es la función organizada que monitorea, detecta, analiza y responde a eventos e incidentes de seguridad. En la práctica, centraliza visibilidad y respuesta: en lugar de que cada área reaccione de forma aislada, existe un punto único de triaje, investigación y escalamiento.",
          "Tiene sentido estructurar un SOC cuando la organización ya enfrenta un volumen de alertas que no consigue tratar de forma consistente, cuando necesita demostrar gobernanza de seguridad (clientes, auditorías, reguladores) o cuando incidentes recurrentes muestran brechas de detección. No existe un tamaño mínimo obligatorio: lo que importa es el alcance — y el alcance viene antes que la herramienta.",
        ],
      },
      {
        heading: "Fase 1 — Alcance, misión y modelo de servicio",
        paragraphs: [
          "Antes de contratar cualquier tecnología, defina qué protege el SOC. El punto de partida recomendado es la función Govern del NIST CSF 2.0: establecer la misión, las autoridades y la tolerancia al riesgo.",
        ],
        lists: [
          {
            items: [
              "¿Qué activos, sistemas y datos están dentro del alcance de monitoreo?",
              "¿Qué está explícitamente fuera del alcance?",
              "¿Quién decide prioridades y aprueba inversiones?",
              "¿Qué modelo de entrega tiene sentido: equipo interno, servicio gestionado (MSSP) o híbrido?",
            ],
          },
        ],
        paragraphsAfter: [
          "El SOC-CMM, modelo de madurez específico para SOCs, refuerza que la madurez comienza por la definición clara de servicios y responsabilidades — la tecnología viene después. Un alcance bien definido evita el error clásico de comprar un SIEM antes de saber qué debe correlacionar.",
        ],
      },
      {
        heading: "Fase 2 — Personas: roles esenciales y el mínimo viable",
        paragraphs: [
          "El equipo es el activo más caro y más crítico del SOC. Al inicio, el diseño mínimo suele combinar:",
        ],
        lists: [
          {
            title: "Triaje (N1)",
            items: [
              "Analiza alertas, aplica criterios de priorización y escala lo que no resuelve.",
            ],
          },
          {
            title: "Análisis y respuesta (N2)",
            items: [
              "Investiga eventos, contiene y coordina la respuesta.",
            ],
          },
          {
            title: "Coordinación/gestión",
            items: [
              "Dueño del servicio, comunicación con el liderazgo y mejora continua.",
            ],
          },
        ],
        paragraphsAfter: [
          "El tamaño y los turnos dependen del alcance definido en la Fase 1. En equipos pequeños, los mismos profesionales acumulan roles — lo que debe ser explícito, para evitar sobrecarga silenciosa. La formación continua y la documentación son parte del rol de cada función: los procesos no pueden depender de una sola persona.",
        ],
      },
      {
        heading: "Fase 3 — Procesos: triaje, investigación y respuesta",
        paragraphs: [
          "Los procesos son lo que convierte a personas y herramientas en un servicio predecible. La referencia vigente es el NIST SP 800-61r3 (finalizado en abril de 2025), que alinea la respuesta a incidentes con el CSF 2.0 y sustituye el ciclo rígido de cuatro fases de la revisión anterior.",
        ],
        lists: [
          {
            title: "Triaje",
            items: [
              "Criterios escritos para priorizar alertas (qué es crítico, qué es ruido).",
            ],
          },
          {
            title: "Runbooks/playbooks",
            items: [
              "Procedimientos para los escenarios más frecuentes (phishing, malware, acceso sospechoso, exfiltración).",
            ],
          },
          {
            title: "Escalamiento",
            items: [
              "Cuándo y a quién un evento sube de nivel.",
            ],
          },
          {
            title: "Preservación de evidencia",
            items: [
              "Qué recolectar y cómo, antes de cualquier acción de contención.",
            ],
          },
          {
            title: "Comunicación",
            items: [
              "Quién informa al liderazgo, al cliente y a las autoridades (p. ej.: LGPD/CERT.br cuando corresponda).",
            ],
          },
        ],
        paragraphsAfter: [
          "Los procesos deben ser probados. Un playbook que nunca se ha ejercitado tiende a fallar en el momento en que más importa.",
        ],
      },
      {
        heading: "Fase 4 — Tecnología: qué priorizar (y qué evitar)",
        paragraphs: [
          "El orden recomendado es: inventario, fuentes de telemetría, detección y, solo entonces, correlación. Ninguna herramienta es obligatoria; la elección depende del entorno y del alcance.",
        ],
        lists: [
          {
            items: [
              "Inventario de activos primero. No es posible monitorear lo que no se conoce.",
              "Logging y telemetría: endpoints, redes, autenticación y servicios críticos. Sin datos de calidad, ninguna capa superior funciona.",
              "CIS Controls (versión vigente 8.1) funcionan como base priorizada de controles técnicos y hardening — un buen punto de partida para reducir exposición antes de invertir en detección avanzada.",
              "Detección: EDR en endpoints y análisis de red, con reglas e hipótesis documentadas.",
              "SIEM como capa de correlación, no como solución mágica. Agrega y correlaciona lo que producen las fuentes de telemetría.",
              "MITRE ATT&CK (versión vigente: v19.2, desde abril de 2026) sirve como lenguaje común para describir el comportamiento adversario — útil para triaje, detección y comunicación entre equipos.",
            ],
          },
        ],
        paragraphsAfter: [
          "Evite comprar tecnología antes de validar las fuentes de datos. Un SIEM conectado a logs incompletos genera una falsa sensación de cobertura.",
        ],
      },
      {
        heading: "Fase 5 — Métricas, madurez y evolución",
        paragraphs: [
          "Un SOC necesita saber si está cumpliendo la misión. Las métricas deben definirse localmente, con línea base propia — por ejemplo, tiempo medio para detectar (MTTD) y para responder (MTTR) — y revisarse periódicamente. El SOC-CMM puede usarse como referencia para evaluar la madurez del servicio y priorizar la próxima evolución.",
          "Atención a un límite importante: métricas comparadas sin contexto generan conclusiones inválidas. El MTTD de una organización no es directamente comparable al de otra con alcance, equipo y telemetría diferentes.",
        ],
      },
      {
        heading: "Lo que aún no sabemos / límites de la guía",
        paragraphs: [
          "Esta guía no prescribe herramientas específicas, no afirma telemetría ni experiencia interna de CyDef y no garantiza protección total — ningún control cubre el 100% de los escenarios. Las versiones de los frameworks citados se verificaron el 24/08/2026 y deben revalidarse antes de la publicación. Autor y revisor técnico de este artículo aún no han sido definidos.",
        ],
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "Evalúe el entorno actual contra las cinco fases: comience por el alcance, diseñe los roles, documente los procesos, valide las fuentes de telemetría y solo entonces decida sobre tecnología. Consulte las fuentes oficiales listadas abajo antes de invertir.",
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
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-soc-01, READY).",
    ],
  },
  {
    slug: "mitre-attack-deteccao-tecnicas-adversarios",
    title: "MITRE ATT&CK en la práctica: Detectando técnicas de adversarios",
    category: "Blue Team",
    excerpt: "Entienda cómo usar el framework MITRE ATT&CK para mapear amenazas y crear reglas de detección eficaces en su entorno.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "9 min de lectura",
    image: "/assets/blog/mitre-attack-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "La versión vigente de MITRE ATT&CK, la v19.2, reestructuró la taxonomía que muchos equipos usan para nombrar el comportamiento de adversarios: la táctica Defense Evasion se dividió en dos, y las reglas, dashboards y playbooks que referencian IDs antiguos deben revisarse. Los analistas de SOC y Blue Team que usan ATT&CK para orientar la detección deben verificar si sus mapeos aún corresponden a la versión vigente — y, más importante, aprender a mapear por comportamiento observado, no por intuición. Este artículo presenta un flujo práctico para transformar observaciones en reglas de detección comprobables, con referencias oficiales verificadas el 24/08/2026. Ninguna herramienta específica es obligatoria: lo que importa es el método y la telemetría que usted ya recolecta."
        ]
      },
      {
        heading: "Qué es MITRE ATT&CK y por qué importa para la detección",
        paragraphs: [
          "Según la propia MITRE, ATT&CK es una base de conocimiento global de tácticas y técnicas de adversarios construida a partir de observaciones reales — no una lista teórica de ataques (F01). El framework organiza el comportamiento en tres niveles: **tácticas** (el objetivo del adversario, el “por qué”), **técnicas** (el “qué”) y **sub-técnicas** (variaciones del “cómo”), distribuidas en las matrices Enterprise, Mobile e ICS.",
          "Para la detección, el valor está en dos puntos. Primero, ofrece un lenguaje común: analistas, herramientas e inteligencia de amenazas pueden hablar de la misma técnica sin ambigüedad. Segundo, permite medir cobertura: qué comportamientos su telemetría consigue ver y cuáles quedan fuera de su alcance.",
          "Una distinción esencial: **ATT&CK describe TTPs (tácticas, técnicas y procedimientos), no IOCs**. Un hash, una IP o un dominio son indicadores volátiles — cambian y expiran. La técnica (por ejemplo, usar un intérprete de comandos) es un comportamiento duradero, que persiste incluso cuando los indicadores cambian. Por eso, mapear comportamiento tiende a envejecer mejor que depender solo de listas de indicadores. Atención a un límite: ATT&CK no es un catálogo exhaustivo de todos los procedimientos posibles — registra lo que ha sido observado. La ausencia de una técnica en la lista no prueba que el comportamiento no exista."
        ],
        "lists": []
      },
      {
        heading: "Qué cambió en la v19 — y por qué revisar sus mapeos",
        paragraphs: [
          "La v19, lanzada el 28 de abril de 2026, trajo el mayor cambio estructural del framework en años (F04). La táctica **Defense Evasion** (Enterprise) se dividió en dos, separadas por la intención del adversario:",
          "La reestructuración también alcanzó a las técnicas. La conocida **Impair Defenses (T1562)** fue reorganizada: según la documentación de migración de Elastic, T1562, T1562.001 y T1562.006 se fusionaron en la nueva técnica **Disable or Modify Tools (T1685)**, y las demás sub-técnicas fueron revocadas y reemitidas bajo Defense Impairment (F11). En agosto de 2026, la v19.2 — el primer release “Agile” del proyecto — actualizó grupos y software de la matriz Enterprise, sin cambiar las tácticas (F03).",
          "El impacto práctico es directo. Las reglas que referencian TA0005 siguen casando con técnicas de Stealth (el ID fue heredado), pero el comportamiento de desactivar controles ahora vive en otro lugar de la matriz. Si sus mapeos no se revisan, usted puede tener una cobertura nominal — reglas mapeadas a tácticas retiradas — que no refleja lo que realmente monitorea. La acción recomendada: audite búsquedas, excepciones, dashboards y playbooks que citan “Defense Evasion”, “TA0005”, “T1562” y sub-técnicas, y re-mapee cada regla según la intención del comportamiento (ocultar actividad o desactivar controles). Los detalles de los IDs provienen de la documentación de migración de Elastic; las notas oficiales de MITRE confirman la división (F04)."
        ],
        "lists": [
          {
            "items": [
              "**Stealth (TA0005)** — ocultar actividad maliciosa dentro del comportamiento legítimo. La nueva táctica heredó el ID antiguo TA0005.",
              "**Defense Impairment (TA0112)** — desactivar, degradar o comprometer controles de seguridad. Recibió un ID nuevo."
            ]
          }
        ]
      },
      {
        heading: "Del comportamiento observado a la regla de detección",
        paragraphs: [
          "Ahora, el flujo que transforma observación en detección, en cinco pasos:",
          "1. **Parta de una observación, no de un nombre de técnica.** Ejemplo: “un proceso inició un intérprete de comandos de forma inesperada”. Esto se aproxima a técnicas como Command and Scripting Interpreter (T1059), cuya página oficial lista plataformas, fuentes de datos y ejemplos (F12). 2. **Confirme en la página de la técnica.** Vea las fuentes de datos sugeridas y los requisitos. Si la técnica que pensó no se sostiene por el comportamiento observado, elija otra — o no mapee. 3. **Elija la fuente de datos que realmente recolecta.** Logs de creación de procesos, de creación de scripts, de autenticación. Sin el dato, no existe regla. 4. **Escriba la regla en el formato de su stack.** Sigma es un formato abierto y estructurado para describir detecciones en logs, compartible entre herramientas (F08, F09). 5. **Pruebe, mida falsos positivos y ajuste.** Una regla que nunca generó una alerta revisable no es una detección validada.",
          "Un ejemplo **conceptual** de selección Sigma — no probado en este entorno; adáptelo a su schema y valídelo en laboratorio:",
          "Observe lo que el ejemplo no hace: no es una detección terminada. `cmd.exe` y `powershell.exe` son legítimos en casi cualquier organización. El siguiente paso es acotar con contexto — proceso padre inusual, correlación con otros eventos, comportamiento posterior — y usar la táctica para decidir el “por qué”. La orientación oficial de MITRE para detección y analytics sigue exactamente esa lógica de desarrollo, prueba y refinamiento de analytics de comportamiento (F05)."
        ],
        "lists": [],
        "code": "title: Execução de interpretador de comandos (exemplo conceitual)\nlogsource:\n  product: windows\n  category: process_creation\ndetection:\n  selection:\n    Image|endswith:\n      - '\\cmd.exe'\n      - '\\powershell.exe'\n  condition: selection\nfalsepositives:\n  - Administração legítima e automação\n  - Tarefas agendadas e scripts operacionais\nlevel: low"
      },
      {
        heading: "Referencias oficiales para detección: CAR, D3FEND y Sigma",
        paragraphs: [
          "Además de la matriz, MITRE y la comunidad mantienen referencias directas para quienes trabajan con detección:",
          "Las reglas de terceros, incluidas las de Sigma, requieren revisión: entienda la lógica, revise los falsepositives declarados y valide en su entorno antes de producir alertas."
        ],
        "lists": [
          {
            "items": [
              "**CAR (Cyber Analytics Repository)** — base de conocimiento de MITRE con analytics basados en ATT&CK. Cada analytic trae hipótesis, dominio de información, referencias a las técnicas, pseudocódigo de implementación y una prueba unitaria (F06).",
              "**D3FEND** — grafo de conocimiento de contramedidas de MITRE: el lado defensivo de la moneda, útil para pensar en controles a partir del comportamiento (F07).",
              "**Sigma** — formato abierto de detección; el repositorio principal reúne más de 3.000 reglas de tipos variados (genéricas, threat hunting, emerging threats, compliance) (F08, F09).",
              "**Get Started – Detections and Analytics** — punto de entrada oficial de MITRE para desarrollar analytics (F05).",
              "**attack-stix-data** — el catálogo ATT&CK en STIX 2.1, para integrar el framework a herramientas de forma automatizada (F13).",
              "**ATT&CK Navigator** — visualización de cobertura en capas, referenciada por el propio CAR; revalide la dirección antes de publicar (F06, F14)."
            ]
          }
        ]
      },
      {
        heading: "Errores comunes al mapear y detectar con ATT&CK",
        paragraphs: [
          "1. **Mapear por intuición o similitud superficial.** La técnica debe estar respaldada por el comportamiento observado; “se parece a” no es evidencia. 2. **Confundir IOC con TTP.** Los indicadores expiran; el comportamiento persiste. Usar ambos es saludable; tratarlos como lo mismo no lo es. 3. **Tratar una regla como cobertura de toda la técnica.** Una regla detecta una variación, no la técnica completa. Los falsos negativos existen y deben asumirse. 4. **Ignorar los falsos positivos.** Una regla sin ajustes se convierte en ruido y desensibiliza al SOC. 5. **No revisar las versiones.** Los IDs revocados (como T1562 y sus sub-técnicas) dejan mapeos huérfanos e informes desalineados (F04, F11). 6. **Prometer detección completa.** Ningún control cubre el 100% de los escenarios; cualquier promesa de ese tipo debe tratarse con escepticismo."
        ],
        "lists": []
      },
      {
        heading: "Lo que aún no sabemos",
        paragraphs: [],
        "lists": [
          {
            "items": [
              "La cobertura real de detección depende de la telemetría local de cada entorno; este artículo no afirma datos de ninguna organización específica ni telemetría interna de CyDef.",
              "MITRE sigue publicando releases (la v19.2 fue la primera Agile); nuevos IDs y reorganizaciones pueden surgir después de la fecha de verificación.",
              "El contenido de la página de la técnica T1562 no pudo extraerse directamente en el momento de la verificación; la reestructuración fue confirmada por las notas oficiales (F04) y el detalle de los IDs por la documentación de Elastic (F11).",
              "La página antigua de versionado (`/resources/versioning`) devuelve 404; la página vigente es `/resources/versions` (F02). Lo mismo vale para `/resources/get-started/`, sustituida por páginas temáticas (F05).",
              "Autor y revisor técnico de este artículo aún no han sido definidos (`PENDIENTE`)."
            ]
          }
        ]
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "1. Compruebe la versión vigente en la página oficial de versionado (F02). 2. Audite reglas, excepciones, dashboards y playbooks con referencias a “Defense Evasion”, “TA0005”, “T1562” y sub-técnicas. 3. Separe por intención: Stealth (ocultar) versus Defense Impairment (desactivar controles) — y revise la prioridad de monitoreo de integridad de sus controles. 4. Revise la cobertura con el Navigator o una hoja propia, y consulte CAR y D3FEND para cerrar brechas. 5. Pruebe cualquier regla nueva en un entorno controlado, con eventos conocidos, antes de producción.",
          "Si su equipo está comenzando a estructurar este trabajo, las prácticas de Blue Team de CyDef (https://www.cydef.com.br/servicos#blue-team) y los servicios de SOC (https://www.cydef.com.br/servicos#soc) son puntos de partida para diseñar el servicio; la formación en detección continúa en CyDef Academy (https://www.cydef.com.br/academy)."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "MITRE ATT&CK (sitio oficial)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "Version History",
        "url": "https://attack.mitre.org/resources/versions"
      },
      {
        "label": "Updates – August 2026 (v19.2)",
        "url": "https://attack.mitre.org/resources/updates"
      },
      {
        "label": "Updates – April 2026 (v19)",
        "url": "https://attack.mitre.org/resources/updates/updates-april-2026"
      },
      {
        "label": "Get Started – Detections and Analytics",
        "url": "https://attack.mitre.org/resources/get-started/detections-and-analytics"
      },
      {
        "label": "Cyber Analytics Repository (CAR)",
        "url": "https://car.mitre.org/"
      },
      {
        "label": "MITRE D3FEND",
        "url": "https://d3fend.mitre.org/"
      },
      {
        "label": "Sigma (sitio oficial)",
        "url": "https://sigmahq.io/"
      },
      {
        "label": "SigmaHQ/sigma (repositorio de reglas)",
        "url": "https://github.com/SigmaHQ/sigma"
      },
      {
        "label": "Blog oficial de MITRE ATT&CK – ATT&CK v19",
        "url": "https://medium.com/mitre-attack/attack-v19-ff329cb65d66"
      },
      {
        "label": "Elastic – Remap detection rules to MITRE ATT&CK v19",
        "url": "https://www.elastic.co/docs/solutions/security/detect-and-alert/remap-mitre-attack"
      },
      {
        "label": "Technique T1059 – Command and Scripting Interpreter",
        "url": "https://attack.mitre.org/techniques/T1059/"
      },
      {
        "label": "attack-stix-data (datos de ATT&CK en STIX 2.1)",
        "url": "https://github.com/mitre-attack/attack-stix-data"
      }
    ],
    "changelog": [
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-attack-02, READY). Fuentes oficiales verificadas el 24/08/2026; versión ATT&CK v19.2 registrada como vigente en la fecha de corte."
    ]
  },
  {
    slug: "threat-hunting-por-onde-comecar",
    title: "Threat Hunting: ¿por dónde empezar?",
    category: "Detección y Respuesta",
    excerpt: "Introducción al threat hunting con metodologías, herramientas y consejos prácticos para cazar amenazas de forma proactiva.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "8 min de lectura",
    image: "/assets/blog/threat-hunting-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "Según la SANS 2025 Threat Hunting Survey, solo el 51% de las organizaciones mide formalmente la eficacia de sus programas de threat hunting — y el 61% señala la escasez de profesionales como la principal barrera. Para los analistas de SOC y Blue Team que quieren salir del modo reactivo, la buena noticia es que cazar no exige una herramienta cara ni un equipo gigante: exige método. Esta guía presenta el ciclo de una cacería — de la hipótesis a la validación — anclado en referencias públicas y vigentes: MITRE ATT&CK, la metodología TTP-Based Hunting de MITRE, el hunting loop de Sqrrl, el framework PEAK y la Pirámide del Dolor. Hasta la fecha de corte de esta verificación (24/08/2026), estas eran las referencias consultadas. El punto de partida es siempre el mismo: una hipótesis comprobable sobre el comportamiento adversario en su entorno."
        ]
      },
      {
        heading: "Qué es el threat hunting (y qué no es)",
        paragraphs: [
          "Threat hunting es la búsqueda proactiva de comportamiento adversario que no fue señalado por alertas automáticas. A diferencia de la respuesta a incidentes — que comienza con una alerta o un incidente conocido —, la cacería comienza con una pregunta: “si hubiera un adversario aquí, ¿qué esperaría ver?”. Es lo que formalizan el hunting loop de Sqrrl y el framework PEAK de Splunk, ambos con la hipótesis como punto de partida.",
          "Tres distinciones evitan los errores más comunes:",
          "El valor está en lo que el equipo aprende incluso cuando no encuentra nada — siempre que lo documente."
        ],
        "lists": [
          {
            "items": [
              "**Hunting no es un barrido aleatorio de logs.** Sin hipótesis, alcance y ventana, la búsqueda se convierte en ruido y consume horas sin conclusión.",
              "**Hunting no sustituye la detección automática.** La complementa, encuentra lo que las reglas no capturaron y mejora las reglas existentes.",
              "**Hunting no es respuesta a incidentes.** Alimenta el proceso: cuando la cacería confirma algo, el caso se escala con evidencias."
            ]
          }
        ]
      },
      {
        heading: "El ciclo de una cacería: de la hipótesis a la acción",
        paragraphs: [
          "El hunting loop formalizado por Sqrrl en 2016 (whitepaper archivado y aún ampliamente citado) define cuatro etapas: **crear hipótesis → investigar con herramientas y técnicas → descubrir nuevos patrones y TTPs → informar y enriquecer los análisis automáticos**. El loop es cíclico: cada cacería concluida alimenta la siguiente y la detección automatizada.",
          "El framework PEAK (Prepare, Execute y Act with Knowledge), del equipo SURGe de Splunk, organiza el mismo razonamiento en tres fases y distingue tres tipos de cacería: **por hipótesis**, **por baseline** (qué es “normal” en el entorno) y **asistida por modelo**. El conocimiento — arquitectura de la red, incidentes pasados, inteligencia de amenazas — entra en todas las fases, no solo al inicio."
        ],
        "lists": []
      },
      {
        heading: "Cómo formular una hipótesis basada en comportamiento",
        paragraphs: [
          "Una buena hipótesis es específica y comprobable. En lugar de “verificar si hay malware”, use: “una cuenta que autentica en varias estaciones en un intervalo corto sugiere movimiento lateral con cuentas válidas”. Los componentes de una hipótesis son cuatro: el **comportamiento esperado**, el **activo o actor en alcance**, la **fuente de datos** que evidenciaría el comportamiento y la **ventana temporal**.",
          "Fuentes de hipótesis: inteligencia de amenazas, técnicas de ATT&CK relevantes para su sector, brechas de visibilidad conocidas, hallazgos de cacerías anteriores y anomalías que las alertas no explicaron.",
          "**MITRE ATT&CK** — base de conocimiento de tácticas y técnicas basada en observaciones reales, en la versión vigente v19.2 — funciona como vocabulario común para describir el comportamiento que usted busca. La metodología **TTP-Based Hunting** de MITRE usa esas técnicas para definir requisitos de datos y conducir la cacería de forma agnóstica del sistema operativo; el entrenamiento oficial describe el camino en seis módulos, desde fundamentos e hipótesis hasta la implementación de análisis e investigación.",
          "> Ejemplo conceptual (no probado en ningún entorno específico): hipótesis de ejecución de scripts mediante intérpretes legítimos fuera de estaciones administrativas; evidencia esperada en logs de procesos; ventana de 14 días; comparación con el baseline de comportamiento normal antes de cualquier conclusión."
        ],
        "lists": []
      },
      {
        heading: "Fuentes de datos: qué necesita antes de cazar",
        paragraphs: [
          "Antes de elegir la técnica, mapee la telemetría que ya tiene: logs de autenticación, de procesos (endpoints), de red (DNS y conexiones), de correo electrónico y de nube. MITRE es explícito sobre el orden: **determinar los requisitos de datos antes de la técnica** — si la telemetría no captura el comportamiento, la cacería no puede confirmarlo.",
          "En la práctica:",
          "Una brecha de visibilidad descubierta durante la preparación es un hallazgo legítimo: saber que un comportamiento no es observable ya orienta la próxima inversión."
        ],
        "lists": [
          {
            "items": [
              "Inventarie fuentes y registre brechas de visibilidad.",
              "Valide calidad y retención. Por ejemplo, el advanced hunting de Microsoft Defender XDR permite explorar hasta 30 días de datos crudos por consulta — y las consultas pueden convertirse en detecciones personalizadas.",
              "Comience por las fuentes más confiables y por las técnicas que ellas pueden evidenciar."
            ]
          }
        ]
      },
      {
        heading: "Cómo conducir y validar los hallazgos",
        paragraphs: [
          "Ejecute la cacería con consultas dirigidas, examine los resultados y clasifique cada elemento. No todo “match” es un incidente: separe **falso positivo**, **comportamiento normal atípico**, **hallazgo a investigar** y **confirmación**. Criterios de triaje explícitos y escritos reducen el sesgo del analista.",
          "Dos referencias ayudan en la priorización y el contexto:",
          "Hallazgo confirmado o probable → escale a respuesta a incidentes con evidencias preservadas (quién, qué, cuándo, fuente de datos y ventana). Hallazgo refutado → documente: refutar una hipótesis también es un resultado — o el comportamiento no ocurrió en la ventana, o la telemetría no lo cubre."
        ],
        "lists": [
          {
            "items": [
              "La **Pirámide del Dolor** (David Bianco, 2013) clasifica indicadores, de hashes a TTPs. Los hashes y las direcciones IP cambian con facilidad; las técnicas, tácticas y procedimientos (TTPs) son caros de cambiar — por eso son los indicadores más valiosos para cazar.",
              "El **Cyber Kill Chain** de Lockheed Martin describe siete etapas, desde el reconocimiento hasta las acciones sobre el objetivo, y ayuda a ubicar en qué fase de la intrusión encaja el comportamiento observado."
            ]
          }
        ]
      },
      {
        heading: "Transformar hallazgos en detección y medir el programa",
        paragraphs: [
          "El ciclo solo se completa cuando el conocimiento se convierte en capacidad: cree o ajuste detecciones, enriquezca datos, corrija brechas de recolección y registre nuevas hipótesis para el siguiente ciclo — es la etapa final del hunting loop.",
          "El contexto de la SANS 2025 muestra por qué esto importa: solo el 51% de las organizaciones mide formalmente la eficacia del hunting (una caída desde el 64% en 2024), y el 61% cita la falta de profesionales como barrera principal. Las métricas de hunting deben definirse localmente — por ejemplo, hipótesis por período, tasa de confirmación, brechas de recolección cerradas y detecciones creadas — y nunca compararse fuera de contexto: una organización con alcance, equipo y telemetría diferentes produce números diferentes."
        ],
        "lists": []
      },
      {
        heading: "Por dónde empezar en la práctica",
        paragraphs: [
          "Una secuencia ejecutable para la primera cacería:",
          "1. Elija 2–3 técnicas de ATT&CK relevantes para su sector y para lo que ya ha visto en incidentes. 2. Confirme qué fuentes de datos pueden evidenciarlas; si falta alguna, registre la brecha. 3. Escriba una hipótesis específica con alcance y ventana. 4. Ejecute la cacería en tiempo limitado (por ejemplo, 1–2 horas) y documente. 5. Clasifique los hallazgos, preserve evidencias y escale cuando corresponda. 6. Convierta lo que funcionó en detección y repita el ciclo.",
          "Recursos públicos gratuitos ayudan: la guía práctica de Elastic, la documentación de advanced hunting de Microsoft, el repositorio abierto de PEAK y, en Brasil, el CERT.br, que publica estadísticas y orientaciones de tratamiento de incidentes."
        ],
        "lists": []
      },
      {
        heading: "Lo que aún no sabemos",
        paragraphs: [],
        "lists": [
          {
            "items": [
              "Ninguna telemetría, prueba o experiencia interna de CyDef se afirma en este artículo.",
              "La eficacia de cada método varía con el entorno, la madurez y las fuentes de datos; no existe una receta universal.",
              "Las cifras de la SANS 2025 provienen de respuestas de profesionales — son percepción, no medición objetiva de las organizaciones.",
              "Las versiones cambian: ATT&CK v19.2 se verificó el 24/08/2026 y debe revalidarse antes de la publicación.",
              "Autor y revisor técnico de este artículo aún no han sido definidos."
            ]
          }
        ]
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "Defina una hipótesis, elija una fuente de datos y ejecute la primera cacería esta misma semana — alcance pequeño, ventana corta y documentación. Consulte las fuentes oficiales a continuación antes de invertir en una herramienta."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "F01 – MITRE ATT&CK (v19.2, vigente el 24/08/2026)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "F02 – MITRE, TTP-Based Hunting",
        "url": "https://www.mitre.org/news-insights/publication/ttp-based-hunting"
      },
      {
        "label": "F03 – MITRE ATT&CK Training – TTP-Based Threat Hunting and Detection Engineering",
        "url": "https://attack.mitre.org/resources/learn-more-about-attack/training/threat-hunting"
      },
      {
        "label": "F04 – SANS, The Pyramid of Pain (David Bianco)",
        "url": "https://www.sans.org/tools/the-pyramid-of-pain"
      },
      {
        "label": "F05 – Splunk SURGe, PEAK Threat Hunting Framework: https://www.splunk.com/en_us/blog/security/peak-threat-hunting-framework.html +",
        "url": "https://github.com/splunk/PEAK"
      },
      {
        "label": "F06 – Elastic, The Elastic guide to threat hunting",
        "url": "https://www.elastic.co/campaigns/elastic-guide-to-threat-hunting"
      },
      {
        "label": "F07 – Sqrrl, A Framework for Cyber Threat Hunting (2016, archivado)",
        "url": "https://www.threathunting.net/files/framework-for-threat-hunting-whitepaper.pdf"
      },
      {
        "label": "F08 – Microsoft, Advanced hunting overview",
        "url": "https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview"
      },
      {
        "label": "F09 – Lockheed Martin, Cyber Kill Chain",
        "url": "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html"
      },
      {
        "label": "F10 – SANS 2025 Threat Hunting Survey",
        "url": "https://www.sans.org/white-papers/sans-2025-threat-hunting-survey-advancements-threat-hunting-amid-ai-cloud-challenges"
      },
      {
        "label": "F11 – CERT.br",
        "url": "https://cert.br/"
      }
    ],
    "changelog": [
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-hunting-03, READY). Fuentes consultadas y fechadas en el ledger; ATT&CK v19.2 confirmado vía https://attack.mitre.org/resources/versions."
    ]
  },
  {
    slug: "hardening-linux-cis-benchmarks",
    title: "Hardening de servidores Linux con CIS Benchmarks",
    category: "Hardening",
    excerpt: "Paso a paso para implementar hardening en servidores Linux siguiendo las recomendaciones del CIS Benchmark.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "8 min de lectura",
    image: "/assets/blog/hardening-linux-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "Los CIS Benchmarks son guías de configuración segura desarrolladas por consenso comunitario y mantenidas por el Center for Internet Security (CIS) — son más de 100 benchmarks para más de 25 familias de productos, disponibles en PDF gratuito para uso no comercial y mapeados a los CIS Controls (F01, F10). Los administradores de Linux, los equipos de DevOps y el Blue Team que necesitan reducir la superficie de ataque de los servidores deben empezar por aquí: elegir el benchmark oficial de su distribución, aplicar las recomendaciones por fases en un entorno de prueba y auditar el resultado con herramientas como el CIS-CAT. Esta guía presenta ese ciclo en cuatro fases — identificar, proteger, detectar y validar — con comandos conceptuales, prueba y rollback. Las versiones citadas se verificaron el 24/08/2026 en las páginas oficiales; confírmelas antes de publicar o aplicar."
        ]
      },
      {
        heading: "Qué son los CIS Benchmarks",
        paragraphs: [
          "Un CIS Benchmark es un conjunto de recomendaciones de configuración segura para una tecnología específica — en el caso de este artículo, sistemas operativos Linux. Según CIS, los benchmarks son “el producto de un proceso de consenso comunitario” y consisten en directrices de configuración segura (F03). Dos puntos prácticos definen el programa:",
          "También hay recursos complementarios: CIS Build Kits (scripts de automatización), CIS Hardened Images (imágenes de VM pre-endurecidas) y el CIS-CAT, herramienta de auditoría (F03, F06). Para la mayoría de las organizaciones, el punto de partida es el PDF del benchmark — y es gratuito."
        ],
        "lists": [
          {
            "items": [
              "**Cobertura y acceso:** más de 100 benchmarks en más de 25 familias de productos, con descarga gratuita en PDF para uso no comercial previo registro (F01, F10).",
              "**Vínculo con controles:** cada recomendación mapea a los CIS Critical Security Controls, lo que ayuda a demostrar conformidad con regulaciones como PCI DSS y frameworks como NIST (F01, F02)."
            ]
          }
        ]
      },
      {
        heading: "CIS Controls v8.1: el hardening dentro de un programa",
        paragraphs: [
          "El hardening por configuración no sustituye un programa de seguridad — es uno de los controles. La versión vigente de los CIS Controls es la v8.1, que enfatiza la transición hacia entornos híbridos/cloud y la gestión de la cadena de suministro (F02). En la práctica, los benchmarks funcionan como la capa técnica de “configuración segura” dentro de ese programa.",
          "Un límite importante: **la conformidad con el benchmark no es protección total**. Un servidor que aprueba todas las reglas aún puede estar desactualizado, mal segmentado o comprometido. El valor del benchmark es reducir la superficie de ataque y dar una base auditable — no sustituir el inventario, la gestión de vulnerabilidades, la detección y la respuesta. Priorice los controles que ya existen en su organización y use el benchmark como complemento, no como atajo."
        ],
        "lists": []
      },
      {
        heading: "Eligiendo el benchmark oficial de su distribución",
        paragraphs: [
          "Descargue el benchmark **desde la página oficial de CIS**, de la versión exacta de su sistema. Las copias de terceros, blogs o repositorios no oficiales pueden estar desactualizadas o adulteradas. Las versiones vigentes listadas en las páginas oficiales el 24/08/2026 eran:",
          "El reconocimiento institucional refuerza la relevancia: el National Checklist Program del NIST (NIST NCP) lista el “CIS Ubuntu Linux 24.04 LTS STIG Benchmark 1.0.0” como checklist oficial (F08). Al elegir, prefiera la versión LTS que usted realmente opera; los benchmarks de versiones antiguas sin soporte son archivados por CIS y deben evitarse (F03)."
        ],
        "lists": [
          {
            "items": [
              "**Ubuntu Linux:** 24.04 LTS (v2.0.0), 22.04 LTS (v3.0.0), 20.04 LTS (v3.0.0) — además de versiones STIG (F03).",
              "**Debian Linux:** 13 (v1.0.0), 12 (v2.0.0), 11 (v2.0.0) (F04).",
              "**Red Hat Enterprise Linux:** 10 (v1.0.1), 9 (v2.0.0), 8 (v4.0.0) — además de versiones STIG (F05)."
            ]
          }
        ]
      },
      {
        heading: "Fase 1 — Identificar: inventario antes del cambio",
        paragraphs: [
          "Antes de alterar cualquier cosa, sepa qué tiene. Esta fase es de solo lectura:",
          "Con el inventario en mano, descargue el benchmark de la versión exacta identificada. Si la distribución no tiene benchmark oficial (por ejemplo, una distro derivada sin página propia), evalúe el benchmark de la familia más cercana con cuidado y documente la decisión — o considere la imagen endurecida de CIS para su proveedor (F03)."
        ],
        "lists": [
          {
            "items": [
              "Confirme distribución, versión y kernel. Ejemplo conceptual: `cat /etc/os-release` y `uname -r`.",
              "Enumere servicios y puertos en escucha. Ejemplo conceptual: `ss -tulpn` (exige privilegio para los nombres de proceso) y `systemctl list-unit-files --type=service`.",
              "Registre un baseline: paquetes instalados, usuarios con acceso, cron jobs y lo que está expuesto a la red."
            ]
          }
        ]
      },
      {
        heading: "Fase 2 — Proteger: cambios probados, uno a la vez",
        paragraphs: [
          "Aplique las recomendaciones **por fases, un cambio a la vez**, comenzando por las reglas de nivel 1 (baseline práctico) y evaluando el nivel 2 según la criticidad del activo — la distinción exacta entre niveles está descrita en el PDF del benchmark de su versión. Los ejemplos a continuación son **conceptuales**: los valores exactos y la lista completa de reglas están en el documento oficial.",
          "Regla de oro: **un cambio a la vez, validado, con backup y rollback conocido**. Un hardening que tumba un servicio en producción no es seguridad — es un incidente."
        ],
        "lists": [
          {
            "items": [
              "**Acceso remoto (SSH):** revise `/etc/ssh/sshd_config` (p. ej.: autenticación por clave, restricción del login root). Antes de reiniciar el servicio, valide la sintaxis: `sudo sshd -t`. Reinicie con `sudo systemctl restart ssh`. **Rollback:** haga un backup antes de editar (`sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak-$(date +%F)`) y restaure si algo falla.",
              "**Permisos de archivos sensibles:** verifique con `stat -c '%a %U %G' /etc/shadow` y ajuste solo si el benchmark de su versión lo indica.",
              "**Servicios innecesarios:** desactívelos con `sudo systemctl disable --now <servicio>`. **Rollback:** `sudo systemctl enable --now <servicio>`.",
              "**Parámetros de kernel:** cree un archivo en `/etc/sysctl.d/` (p. ej.: `kernel.randomize_va_space=2`, `net.ipv4.ip_forward=0` como ejemplos conceptuales) y aplíquelo con `sudo sysctl --system`. **Rollback:** elimine el archivo y vuelva a aplicar.",
              "**Actualizaciones:** pruebe `sudo apt update && sudo apt upgrade` (Debian/Ubuntu) o `sudo dnf update` (RHEL) en laboratorio antes de producción.",
              "**Firewall local:** configúrelo según la política de la organización (ufw, nftables o iptables) y garantice que el acceso de administración no se bloquee durante la prueba."
            ]
          }
        ]
      },
      {
        heading: "Fase 3 — Detectar: auditoría continua con CIS-CAT y USG",
        paragraphs: [
          "Configurar no basta; hay que medir. La herramienta oficial de CIS para auditar sistemas contra los benchmarks es el **CIS-CAT Pro Assessor**, que genera informes de conformidad mapeados a los CIS Controls y a los Implementation Groups (F06, F07). El acceso completo a CIS-CAT Pro exige suscripción SecureSuite, pero CIS ofrece el **CIS-CAT Lite**, gratuito, con escaneos ilimitados contra un conjunto seleccionado de benchmarks — que incluye Ubuntu Linux (F06). En Ubuntu, Canonical también documenta el **Ubuntu Security Guide (USG)** para auditar y aplicar perfiles CIS (p. ej.: `sudo usg audit <perfil>`) — en la documentación vigente, el alcance cubre 20.04 y 22.04; revalide antes de depender de esto en 24.04 (F09).",
          "Complemente la auditoría con logs: autenticación, cambios de configuración y eventos del sistema (journald, auditd) alimentan al SOC y al Blue Team. Trate el score de la auditoría como baseline: registre el valor antes y después de cada lote de cambios."
        ],
        "lists": []
      },
      {
        heading: "Fase 4 — Validar: re-auditar, documentar excepciones y automatizar",
        paragraphs: [
          "Después de cada lote de cambios, repita la auditoría y compare con el baseline. La conformidad no puede romper la operación: valide que los servicios responden, las aplicaciones funcionan y los backups se restauran. Las reglas que no aplican a su entorno deben **documentarse como excepción justificada** (tailoring), no simplemente ignorarse — eso es lo que mantiene la auditoría honesta y defendible.",
          "Solo después de que el proceso manual esté estable, considere automatizar con CIS Build Kits o herramientas de configuración declarativa (F03). La automatización amplifica un buen proceso y acelera uno malo — primero el proceso, después el script."
        ],
        "lists": []
      },
      {
        heading: "Lo que aún no sabemos",
        paragraphs: [
          "Esta guía tiene límites explícitos. El texto íntegro de los benchmarks (reglas individuales, valores exactos y niveles) no se reproduce aquí: la descarga es gratuita, pero exige registro, y cada regla debe leerse en el PDF de su versión. Las versiones citadas se verificaron el 24/08/2026 y pueden cambiar — revalide antes de publicar. Las herramientas de pago (CIS-CAT Pro) dependen de una suscripción; el USG tiene un alcance de versión documentado que debe revalidarse. Ninguna telemetría ni experiencia interna de CyDef se afirma en este artículo, y el autor y el revisor técnico aún no han sido definidos."
        ],
        "lists": []
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "Comience con un servidor de laboratorio: identifique la distribución exacta, descargue el benchmark oficial desde la página de CIS, aplique las recomendaciones de nivel 1 una a la vez con backup y rollback, y audite con CIS-CAT Lite antes y después. Solo entonces lleve el proceso, ya validado, a producción. Consulte las fuentes oficiales a continuación antes de aplicar cualquier cambio."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "CIS Benchmarks (visión general)",
        "url": "https://www.cisecurity.org/cis-benchmarks-overview"
      },
      {
        "label": "CIS Controls v8.1",
        "url": "https://www.cisecurity.org/controls"
      },
      {
        "label": "CIS Ubuntu Linux Benchmark",
        "url": "https://www.cisecurity.org/benchmark/ubuntu_linux"
      },
      {
        "label": "CIS Debian Linux Benchmark",
        "url": "https://www.cisecurity.org/benchmark/debian_linux"
      },
      {
        "label": "CIS Red Hat Enterprise Linux Benchmark",
        "url": "https://www.cisecurity.org/benchmark/red_hat_linux"
      },
      {
        "label": "CIS-CAT Pro Assessor",
        "url": "https://www.cisecurity.org/cybersecurity-tools/cis-cat-pro"
      },
      {
        "label": "CIS-CAT Pro Assessor v4 Guide",
        "url": "https://ciscat-assessor.docs.cisecurity.org"
      },
      {
        "label": "NIST National Checklist Program, checklist 1287",
        "url": "https://ncp.nist.gov/checklist/1287"
      },
      {
        "label": "Ubuntu Security Guide (conformidad CIS)",
        "url": "https://ubuntu.com/security/certifications/docs/usg/cis/compliance"
      },
      {
        "label": "Descarga de los CIS Benchmarks (PDF gratuito, registro)",
        "url": "https://learn.cisecurity.org/benchmarks"
      }
    ],
    "changelog": [
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-hardening-04, READY). Versiones de benchmarks y herramientas verificadas en las páginas oficiales en esta fecha."
    ]
  },
  {
    slug: "certificacoes-ciberseguranca-carreira",
    title: "Carrera en Ciberseguridad: certificaciones que marcan la diferencia",
    category: "Carrera y Certificaciones",
    excerpt: "Análisis de las principales certificaciones de seguridad y cómo elegir las más adecuadas para su momento profesional.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "9 min de lectura",
    image: "/assets/blog/carreira-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "El mercado de seguridad usa las certificaciones como una señal verificable de conocimiento — y los exámenes cambian: en 2026, el CySA+ ganó una nueva versión (CS0-004), el ISC2 CC tendrá un nuevo contenido a partir de septiembre y el PenTest+ ya opera en la versión PT0-003. Quien está comenzando o planea el siguiente paso debe verificar el código del examen vigente, los prerrequisitos y el costo total en la fuente oficial antes de comprar cualquier voucher. Esta guía organiza las principales certificaciones por momento de carrera, con datos verificados en las páginas oficiales el 24/08/2026. Ninguna certificación garantiza una vacante, un salario o la aprobación — el valor real está en lo que representa y en lo que usted hace con el conocimiento."
        ]
      },
      {
        heading: "Por qué las certificaciones marcan la diferencia (y qué no garantizan)",
        paragraphs: [
          "Las certificaciones funcionan como triaje: en los procesos de selección, ayudan a reclutadores y equipos a identificar quién tiene una base mínima documentada de conocimiento. Acreditaciones como ISO/IEC 17024 (usada por ISC2) y el reconocimiento en programas como el DoDM 8140 de Estados Unidos aumentan la trazabilidad del examen — pero no miden su experiencia real. Un certificado sin práctica no sustituye la competencia operacional, y ningún examen promete protección total, empleo o salario.",
          "El costo real de una certificación incluye el examen **y** el mantenimiento: CompTIA exige CEUs (unidades de educación continua) cada tres años, ISC2 cobra una cuota anual de mantenimiento (AMF) y Microsoft exige renovación anual mediante evaluación en línea gratuita. Antes de decidir, considere el ciclo completo."
        ],
        "lists": []
      },
      {
        heading: "Empezando ahora: Security+ e ISC2 CC",
        paragraphs: [
          "Para quienes no tienen experiencia formal, las dos puertas de entrada más reconocidas son el **CompTIA Security+** y el **ISC2 CC (Certified in Cybersecurity)**.",
          "Security+ es la certificación de entrada de CompTIA. El examen vigente es el **SY0-701** (versión V7, lanzada el 07/11/2023): hasta 90 preguntas, 90 minutos, nota de corte 750 en una escala de 100–900, sin prerrequisitos formales — CompTIA recomienda Network+ y unos dos años en administración de sistemas con enfoque en seguridad. Está disponible en portugués y se renueva cada tres años con 50 CEUs (cuota de US$ 150 por ciclo, según la página oficial de CEUs de CompTIA).",
          "El **CC de ISC2** es una alternativa de entrada sin requisito de experiencia, con examen de US$ 199 y cuota anual de mantenimiento de US$ 50. Atención a dos cambios: el examen tendrá un nuevo outline a partir del **01/09/2026** (la primera gran actualización desde 2022, con nuevo peso para gobernanza, IAM y cloud), y el programa “One Million Certified in Cybersecurity”, que ofreció exámenes gratuitos, **cerró nuevas inscripciones el 20/05/2026** — no cuente con la gratuidad al planificar.",
          "¿Cómo elegir entre ambos? Según el objetivo: Security+ entrega una base amplia y es muy solicitado en los requisitos de vacantes; el CC es más ágil, barato y un buen primer contacto con la metodología de ISC2. Ninguno de los dos es obligatorio."
        ],
        "lists": []
      },
      {
        heading: "Trabajando en SOC: CySA+, SC-200 y SSCP",
        paragraphs: [
          "Quien ya opera detección y respuesta encuentra certificaciones diseñadas para el trabajo de SOC y Blue Team.",
          "El **CySA+** (Cybersecurity Analyst) validó el 23/06/2026 la nueva versión **V4 (CS0-004)**: hasta 85 preguntas, 165 minutos, nota 750, con foco en operaciones de seguridad (34%), gestión de vulnerabilidades (26%), respuesta a incidentes (24%) y comunicación (16%). CompTIA recomienda unos cuatro años en SOC o análisis de vulnerabilidades; el examen cuesta US$ 425 y se renueva cada tres años con 60 CEUs. En su estreno, el idioma es inglés, con portugués previsto.",
          "El **SC-200** (Microsoft Certified: Security Operations Analyst Associate) es la certificación de Microsoft para quienes operan Sentinel, Defender XDR y Defender for Cloud, incluido el hunting con KQL. Son 100 minutos y nota 700, sin prerrequisitos formales, disponible en portugués de Brasil. Microsoft define el precio por país/región — el valor estándar divulgado es US$ 165 — y la renovación es anual, gratuita, mediante evaluación en línea.",
          "El **SSCP** (Systems Security Certified Practitioner), de ISC2, exige un año de experiencia en uno o más de los siete dominios (un título universitario en TI/CS puede descontar hasta un año; existe el camino Associate). Cuesta US$ 249 y cubre la administración operacional de infraestructura — un buen encaje para quien ya trabaja con hands-on y quiere una credencial ISC2 antes del CISSP."
        ],
        "lists": []
      },
      {
        heading: "Para avanzar: CISSP y CCSP",
        paragraphs: [
          "En los niveles de gestión y arquitectura, el **CISSP** (US$ 749) es el hito más reconocido de ISC2: exige cinco años de experiencia en dos o más de los ocho dominios, con una reducción de hasta un año para quien tiene título universitario en TI/CS o una credencial aprobada. Quien aún no tiene la experiencia puede rendir el examen y seguir como Associate de ISC2, con seis años para completar el requisito.",
          "El **CCSP** (US$ 599) se enfoca en seguridad de cloud: exige cinco años en TI, de los cuales tres en seguridad y uno en uno de los seis dominios CCSP — el certificado CCSK de la CSA sustituye un año, y quien ya es CISSP tiene el requisito dispensado. La AMF de ISC2 es única: US$ 135 por año para CISSP, SSCP, CCSP y demás (US$ 50 solo para quienes tienen únicamente el CC), independientemente de cuántas certificaciones acumule."
        ],
        "lists": []
      },
      {
        heading: "Conocimiento ofensivo con propósito defensivo: PenTest+ y CEH",
        paragraphs: [
          "Entender cómo piensa un atacante fortalece la defensa — siempre que la práctica ocurra en un entorno autorizado. Dos certificaciones cubren ese terreno con enfoques diferentes.",
          "El **PenTest+** de CompTIA (versión vigente **PT0-003**, lanzada el 17/12/2024) cubre la planificación y el alcance de las pruebas de penetración, el análisis de vulnerabilidades y los informes con remediación. Son hasta 90 preguntas en 165 minutos, nota 750; CompTIA recomienda de tres a cuatro años en pentest, con Network+ y Security+. Está disponible en portugués.",
          "El **CEH v13** de EC-Council (125 preguntas, cuatro horas) combina 20 módulos y más de 550 técnicas con laboratorios. La elegibilidad tiene dos caminos: realizar el entrenamiento oficial (on-demand desde US$ 1.699) o solicitar aprobación con dos años de experiencia documentada en seguridad de la información y una cuota de US$ 100. El valor del examen aislado no aparece como precio fijo en la página oficial consultada — confirme con EC-Council antes de planificar el presupuesto.",
          "El artículo no entra en métodos ofensivos: el valor de estas certificaciones para un defensor es la capacidad de evaluar la exposición y mejorar la detección, no de ejecutar ataques."
        ],
        "lists": []
      },
      {
        heading: "Cómo elegir la certificación correcta para su momento",
        paragraphs: [
          "Use este proceso de cinco pasos antes de comprar cualquier voucher:",
          "1. **Defina el momento profesional**: entrada, operación de SOC, gestión/arquitectura o especialización en pruebas autorizadas. 2. **Verifique el código del examen vigente** en la página oficial — las versiones se retiran (el CySA+ CS0-003 salió de línea con el lanzamiento del CS0-004 en junio de 2026). 3. **Valide los prerrequisitos**: CISSP y CCSP exigen experiencia comprobada; SSCP exige un año; Security+ y CC no tienen prerrequisitos formales. 4. **Calcule el costo total del ciclo**: examen + renovación (CEUs de CompTIA, AMF de ISC2, renovación anual de Microsoft) + material de estudio. 5. **Verifique idioma y región**: Security+, PenTest+ y SC-200 tienen versión en portugués; CySA+ V4 prevé portugués; los precios varían por país.",
          "Desconfíe de las “últimas oportunidades” sin anuncio oficial y de los materiales que prometen aprobación rápida: el examen mide lo que usted sabe, no lo que memorizó."
        ],
        "lists": []
      },
      {
        heading: "Lo que aún no sabemos",
        paragraphs: [],
        "lists": [
          {
            "items": [
              "El valor del voucher de Security+ y PenTest+ no aparece como precio fijo en las páginas oficiales consultadas el 24/08/2026; fuentes de 2025–2026 reportan un rango aproximado de US$ 404–439. Confirme en la tienda oficial.",
              "El precio del examen CEH aislado no consta en la página oficial consultada (solo paquetes de entrenamiento).",
              "Circulan rumores no oficiales sobre un sucesor del Security+ (posible SY0-801) con fechas provisionales en noviembre de 2026; hasta la fecha de corte, el SY0-701 sigue siendo la versión vigente oficial.",
              "Autor y revisor técnico de este artículo aún no han sido definidos."
            ]
          }
        ]
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "Elija su momento de carrera, abra la página oficial de la certificación candidata, verifique el código del examen, los prerrequisitos y el valor actual — y solo entonces compre el voucher. Si todo el equipo se va a certificar, use los objetivos oficiales del examen como hoja de ruta de entrenamiento. La certificación correcta es la que combina con su plan — no con la moda del momento."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "CompTIA Security+ (SY0-701)",
        "url": "https://www.comptia.org/en-us/certifications/security"
      },
      {
        "label": "CompTIA CySA+ V4 (CS0-004)",
        "url": "https://www.comptia.org/en-us/certifications/cybersecurity-analyst/v4"
      },
      {
        "label": "Blog oficial de CompTIA — CySA+ V4 (precio US$ 425)",
        "url": "https://www.comptia.org/en-us/blog/the-new-comptia-cybersecurity-analyst-cysa-your-questions-answered"
      },
      {
        "label": "CompTIA PenTest+ (PT0-003)",
        "url": "https://www.comptia.org/en-us/certifications/pentest"
      },
      {
        "label": "ISC2 CC",
        "url": "https://www.isc2.org/certifications/cc"
      },
      {
        "label": "ISC2 One Million Certified in Cybersecurity",
        "url": "https://www.isc2.org/landing/1mcc"
      },
      {
        "label": "ISC2 — precios de exámenes",
        "url": "https://www.isc2.org/register-for-exam/isc2-exam-pricing"
      },
      {
        "label": "CompTIA — CEUs y renovación",
        "url": "https://www.comptia.org/en-us/resources/ce/learn/earn-continuing-education-units-ceus"
      },
      {
        "label": "ISC2 CISSP — requisitos",
        "url": "https://www.isc2.org/certifications/cissp/cissp-experience-requirements"
      },
      {
        "label": "ISC2 CCSP — requisitos",
        "url": "https://www.isc2.org/certifications/ccsp/ccsp-experience-requirements"
      },
      {
        "label": "ISC2 — AMF",
        "url": "https://www.isc2.org/policies-procedures/amfs-overview"
      },
      {
        "label": "EC-Council CEH v13",
        "url": "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/"
      },
      {
        "label": "ISC2 SSCP — requisitos",
        "url": "https://www.isc2.org/certifications/sscp/sscp-experience-requirements"
      },
      {
        "label": "Microsoft SC-200",
        "url": "https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst"
      },
      {
        "label": "Microsoft SC-200 — guía de estudio",
        "url": "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200"
      },
      {
        "label": "ISC2 Insights — nuevo outline del CC",
        "url": "https://www.isc2.org/Insights/2026/08/inside-the-updated-isc2-cc-exam"
      }
    ],
    "changelog": [
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-career-05, READY). Códigos de examen, requisitos y precios confirmados en fuentes oficiales en la fecha de corte."
    ]
  },
  {
    slug: "seguranca-cloud-aws-melhores-praticas",
    title: "Seguridad en Cloud AWS: Mejores prácticas esenciales",
    category: "Seguridad en la Nube",
    excerpt: "Guía práctica de seguridad para entornos AWS con foco en IAM, VPC, CloudTrail y otros servicios críticos.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "8 min de lectura",
    image: "/assets/blog/cloud-aws-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "En la nube de AWS, la seguridad no es un interruptor que AWS enciende por usted: es una responsabilidad compartida, y la parte que corresponde a su organización crece según lo que usted configura y ejecuta. Ingenieros, arquitectos, equipos DevSecOps y analistas que operan entornos AWS necesitan saber dónde termina la responsabilidad del proveedor y dónde comienza la suya — porque es en esa frontera donde ocurren las fallas más comunes: permisos demasiado amplios, recursos expuestos y ausencia de logs. Esta guía presenta, en orden, las prácticas esenciales documentadas por AWS: identidades (IAM), red (VPC), registro y detección (CloudTrail, GuardDuty, Security Hub) y protección de datos (KMS). La aplicación de cada práctica depende de su entorno; aquí no se prescribe ninguna configuración universal."
        ]
      },
      {
        heading: "Qué protege AWS y qué es responsabilidad suya",
        paragraphs: [
          "El punto de partida es el modelo de responsabilidad compartida, descrito en la página oficial de cumplimiento de AWS. AWS es responsable de la “seguridad de la nube”: la infraestructura que ejecuta los servicios — datacenters, red, hardware, virtualización. El cliente es responsable de la “seguridad en la nube”: lo que configura, ejecuta y almacena, incluidos el sistema operativo invitado, las aplicaciones, la gestión de accesos, el cifrado y el monitoreo.",
          "La frontera cambia según el servicio: en una base de datos gestionada, AWS asume más capas que en una instancia EC2, donde el cliente responde por la configuración del sistema operativo. Esta distinción es el eje del Security Pillar del AWS Well-Architected Framework, publicado en noviembre de 2024 y vigente en la fecha de corte de esta verificación. Antes de elegir un servicio o corregir una configuración, responda: ¿quién es responsable de esta capa aquí? La respuesta define qué auditar primero."
        ],
        "lists": []
      },
      {
        heading: "IAM: identidades, mínimo privilegio y credenciales",
        paragraphs: [
          "La gestión de identidades es donde comienza la mayoría de las decisiones de seguridad en AWS. La documentación oficial de buenas prácticas de IAM recomienda, entre otros puntos:",
          "En la práctica, la recomendación es comenzar con políticas gestionadas de AWS y reducir progresivamente hacia el mínimo privilegio — no al revés. Los cambios de política deben probarse en un entorno controlado (por ejemplo, una cuenta de desarrollo) y pueden revertirse restaurando la versión anterior de la política. Una buena prueba de cordura: ningún cambio de permisos debe salir de una cuenta de prueba directo a producción sin validación del workload."
        ],
        "lists": [
          {
            "items": [
              "**Proteja el usuario root.** Tiene acceso irrestricto a la cuenta; debe usarse solo para tareas que exigen ese nivel, con MFA (autenticación multifactor) habilitada.",
              "**Prefiera credenciales temporales.** AWS recomienda que los humanos accedan vía federación con un proveedor de identidad (IAM Identity Center es la opción centralizada indicada) y que los workloads usen IAM roles — ambos emiten credenciales temporales, en lugar de claves de larga duración.",
              "**Aplique mínimo privilegio.** Otorgue solo los permisos necesarios para la tarea. IAM ofrece información de último acceso (“last accessed”) e IAM Access Analyzer puede generar políticas basadas en la actividad observada y validar políticas existentes.",
              "**Revise periódicamente.** Elimine usuarios, roles, claves y permisos no utilizados; use condiciones en las políticas para restringir el acceso; considere guardrails de permisos en cuentas múltiples."
            ]
          }
        ]
      },
      {
        heading: "VPC: aislamiento y control de tráfico",
        paragraphs: [
          "Amazon VPC permite ejecutar recursos en una red virtual lógicamente aislada, definida por usted. La seguridad de red se apoya en dos capas complementarias, documentadas en la guía de la VPC:",
          "La orientación estructural es mantener los workloads de backend en subnets privadas y exponer públicamente solo lo necesario. Los cambios en security groups y network ACLs tienen efecto inmediato: aplíquelos en una ventana controlada, valide el tráfico legítimo y esté preparado para revertir la regla ante una regresión. No existe una regla universal de puertos — el diseño depende del workload y de la política de red de la organización."
        ],
        "lists": [
          {
            "items": [
              "**Security groups:** actúan como firewall virtual a nivel de instancia/interfaz, de forma stateful — el tráfico de retorno se permite automáticamente. La recomendación es habilitar solo los puertos y orígenes necesarios.",
              "**Network ACLs:** capa adicional a nivel de subnet, de forma stateless, con reglas numeradas evaluadas en orden. Útiles para la defensa en profundidad."
            ]
          }
        ]
      },
      {
        heading: "Registro y detección: CloudTrail, GuardDuty y Security Hub",
        paragraphs: [
          "Sin visibilidad no hay respuesta. Tres servicios oficiales forman la base recomendada de observabilidad y detección:",
          "El camino defensivo recomendado es: habilite CloudTrail con cobertura de las regiones y cuentas relevantes, active GuardDuty y agregue los hallazgos en Security Hub. La habilitación es aditiva, pero tiene costo y volumen de datos — comience con un alcance reducido y expanda. Los findings y los controles generan ruido: defina triaje y criterios de escalamiento antes de tratar cada alerta como incidente."
        ],
        "lists": [
          {
            "items": [
              "**AWS CloudTrail** registra acciones de usuarios, roles y servicios como eventos — incluidos la consola, la CLI y las APIs. El event history permite consultar los últimos 90 días de eventos de gestión; los trails entregan logs a un bucket S3, con opción de envío a CloudWatch Logs y a Amazon EventBridge para monitoreo y automatización.",
              "**Amazon GuardDuty** monitorea continuamente fuentes de datos de la cuenta (como eventos de CloudTrail, VPC flow logs y DNS) y genera findings de actividad sospechosa — por ejemplo, accesos con geolocalización inusual o llamadas de API atípicas. Un finding es una indicación para investigar, no una confirmación automática de compromiso.",
              "**AWS Security Hub** (CSPM — Cloud Security Posture Management) agrega y correlaciona hallazgos de múltiples fuentes y evalúa el entorno contra estándares de seguridad, incluido el estándar propio de AWS (Foundational Security Best Practices — FSBP) y frameworks externos como CIS, PCI DSS y NIST. Esto ayuda a priorizar correcciones por severidad y contexto."
            ]
          }
        ]
      },
      {
        heading: "Datos: cifrado y control de claves",
        paragraphs: [
          "Proteger los datos en reposo y en tránsito es parte de las buenas prácticas del Security Pillar. AWS Key Management Service (KMS) centraliza la creación y el control de las claves usadas para cifrar y firmar datos, integrándose con varios servicios AWS. Las claves están protegidas por módulos de hardware validados y nunca salen del servicio de forma no cifrada. Vale distinguir, a nivel conceptual, las claves gestionadas por el cliente (usted las crea y controla) de las gestionadas por AWS — la elección depende del grado de control que la organización necesita, y las key policies definen quién puede gestionar y quién puede usar cada clave.",
          "Complementariamente, AWS Config registra el historial de configuración de los recursos de la cuenta, permitiendo ver cómo cambiaron las configuraciones a lo largo del tiempo y evaluar la conformidad con reglas definidas. Esto es útil para la auditoría y para entender el impacto de un cambio antes y después de aplicarlo. Ninguno de estos servicios sustituye el inventario y la gobernanza: hacen el entorno auditable."
        ],
        "lists": []
      },
      {
        heading: "Lo que aún no sabemos",
        paragraphs: [
          "Esta guía no cubre costos (retención de logs, volumen de datos y regiones varían), ni configuraciones específicas de cada workload — la aplicación correcta depende del inventario, la criticidad y los controles existentes. No afirmamos telemetría, pruebas ni experiencia interna de CyDef, y ninguna herramienta es obligatoria. Las revisiones de la documentación de AWS pueden cambiar; las fuentes se verificaron el 24/08/2026 y deben revalidarse antes de la publicación. Autor y revisor técnico de este artículo aún no han sido definidos."
        ],
        "lists": []
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "Audite el entorno capa por capa: mapee la frontera de responsabilidad, revise identidades y permisos (root, MFA, credenciales temporales, mínimo privilegio), reduzca la exposición de red, garantice registro y detección (CloudTrail, GuardDuty, Security Hub) y revise el cifrado y las claves. Priorice según el contexto local, pruebe los cambios en un entorno controlado con rollback y consulte la documentación oficial de AWS antes de alterar producción."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "AWS Well-Architected Framework, Security Pillar (pub. 06/11/2024)",
        "url": "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html"
      },
      {
        "label": "AWS Well-Architected Framework, sección Security",
        "url": "https://docs.aws.amazon.com/wellarchitected/latest/framework/security.html"
      },
      {
        "label": "AWS IAM, Security best practices",
        "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
      },
      {
        "label": "AWS IAM, Prepare for least-privilege permissions",
        "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started-reduce-permissions.html"
      },
      {
        "label": "AWS Shared Responsibility Model",
        "url": "https://aws.amazon.com/compliance/shared-responsibility-model/"
      },
      {
        "label": "AWS CloudTrail, What Is AWS CloudTrail",
        "url": "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html"
      },
      {
        "label": "Amazon VPC, What is Amazon VPC",
        "url": "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html"
      },
      {
        "label": "Amazon VPC, Security groups",
        "url": "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html"
      },
      {
        "label": "Amazon VPC, Network ACLs",
        "url": "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html"
      },
      {
        "label": "AWS Security Hub, Introduction (CSPM)",
        "url": "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html"
      },
      {
        "label": "Amazon GuardDuty, What is Amazon GuardDuty",
        "url": "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html"
      },
      {
        "label": "AWS KMS, Developer Guide (overview)",
        "url": "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html"
      },
      {
        "label": "AWS Config, What Is AWS Config",
        "url": "https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html"
      },
      {
        "label": "AWS Cloud Security (hub oficial)",
        "url": "https://aws.amazon.com/security/"
      }
    ],
    "changelog": [
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-cloud-06, READY). Fuentes oficiales de AWS accedidas y confirmadas el 24/08/2026."
    ]
  },
  {
    slug: "analise-de-logs-comportamentos-maliciosos",
    title: "Análisis de logs: identificando comportamientos maliciosos",
    category: "SOC",
    excerpt: "Aprenda a correlacionar eventos de log e identificar patrones que indican actividades sospechosas o maliciosas.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "7 min de lectura",
    image: "/assets/blog/analise-logs-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "Los analistas de SOC reciben diariamente miles de eventos de log, y la diferencia entre una cola de alertas y una investigación eficaz está en la forma de correlacionar esos eventos. Esta guía presenta un método en cuatro pasos — fuentes de datos, normalización, línea de tiempo y reconocimiento de patrones — para transformar logs sueltos en hipótesis investigables, con base en fuentes oficiales vigentes: NIST, OWASP, MITRE, CIS e IETF. Hasta la fecha de corte de esta verificación (24/08/2026), estas eran las referencias consultadas. El siguiente paso, al terminar de leer, es aplicar el método a su propia cola de alertas."
        ]
      },
      {
        heading: "Por qué el análisis de logs es la base de la detección",
        paragraphs: [
          "Un log es un registro de eventos que ocurren en los activos computacionales de la organización, y la gestión de logs es el proceso de generar, transmitir, almacenar, acceder y descartar esos datos — según la definición del [NIST SP 800-92 Rev. 1 (draft)](https://csrc.nist.gov/pubs/sp/800/92/r1/ipd), la guía de planificación de log management del NIST. El documento final vigente, [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final) (2006), ya consolidaba la práctica: sin infraestructura y procesos de log bien definidos, el análisis queda limitado a lo que eventualmente se registró.",
          "La consecuencia de un logging insuficiente está reconocida en el [OWASP Top 10:2025, categoría A09 — Security Logging and Alerting Failures](https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures): sin registros y monitoreo, los ataques y las violaciones no se detectan — y, sin alerta, es difícil responder a tiempo. En otras palabras: los logs no son burocracia, son la materia prima de la detección."
        ],
        "lists": []
      },
      {
        heading: "Paso 1 — Conozca sus fuentes de datos (y las brechas)",
        paragraphs: [
          "Antes de correlacionar, hay que saber qué se está recolectando. Las fuentes típicas incluyen autenticación, sistema operativo, aplicación, red y DNS. El [CIS Controls v8.1, Control 8 (Audit Log Management)](https://www.cisecurity.org/controls/audit-log-management) resume el objetivo: recolectar, alertar, revisar y retener logs de eventos que ayuden a detectar, entender o recuperarse de un ataque.",
          "El mínimo recomendado por la [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) para logs de aplicación incluye:",
          "La etapa termina con un inventario honesto de brechas: lo que debería registrarse y no se registra. Una brecha de recolección no es un problema de herramienta — es un límite de visibilidad que debe declararse."
        ],
        "lists": [
          {
            "items": [
              "Éxitos y fallas de autenticación — las fallas repetidas son indicadores tempranos de ataques basados en credenciales.",
              "Fallos de autorización (control de acceso).",
              "Fallos de validación de entrada.",
              "Errores de aplicación y eventos de sistema (inicio/fin de servicio, cambios de configuración).",
              "Uso de privilegios administrativos y cuentas de excepción."
            ]
          }
        ]
      },
      {
        heading: "Paso 2 — Normalice antes de correlacionar",
        paragraphs: [
          "Los eventos de fuentes diferentes rara vez conversan entre sí en formato crudo: el campo “usuario” puede llamarse `user`, `username` o `sAMAccountName`, y la hora puede venir en husos distintos. Correlacionar sin normalizar produce conclusiones falsas.",
          "El [RFC 5424](https://www.rfc-editor.org/rfc/rfc5424), estándar IETF de syslog estructurado, es una referencia útil: define campos como timestamp, hostname, nombre de la aplicación y datos estructurados, lo que facilita el consumo y la correlación por sistemas diversos. En la práctica, los campos mínimos que un análisis necesita tener de forma consistente son:",
          "Un detalle que parece operacional y es en realidad analítico: los relojes desincronizados inviabilizan la línea de tiempo. Por eso el CIS Control 8 incluye la estandarización de la sincronización de tiempo entre los activos (safeguard 8.4). Si el reloj del servidor de autenticación está cinco minutos atrás del firewall, la secuencia real de los eventos se vuelve ilegible."
        ],
        "lists": [
          {
            "items": [
              "**Timestamp normalizado (idealmente UTC)**, para comparar eventos entre husos.",
              "**Host/entidad de origen**.",
              "**Usuario o cuenta involucrada**.",
              "**Acción ejecutada** y **resultado** (éxito/falla)."
            ]
          }
        ]
      },
      {
        heading: "Paso 3 — Arme la línea de tiempo y correlacione",
        paragraphs: [
          "Con los datos normalizados, el siguiente paso es correlacionar por entidad y por tiempo. La pregunta orientadora es: “¿qué hizo este usuario (u host), en qué orden, y qué significa en el contexto?”.",
          "Ejemplos de correlación que valen la pena:",
          "El [MITRE ATT&CK](https://attack.mitre.org/) (versión vigente: v19.2, publicada en agosto de 2026) es la referencia para describir ese comportamiento en lenguaje común: en lugar de “el usuario hizo algo extraño”, el equipo conversa sobre fases del ataque, como acceso inicial, movimiento lateral o exfiltración. Un detalle importante: ATT&CK es un vocabulario para formular hipótesis — mapear un observable a una técnica no prueba que el evento sea malicioso. Por eso, esta guía evita fijar IDs de técnica: la v19 reestructuró tácticas como Defense Evasion, y los IDs cambian entre versiones."
        ],
        "lists": [
          {
            "items": [
              "La misma cuenta aparece con fallas de autenticación en varios hosts y luego con un éxito proveniente de una dirección inusual.",
              "Un acceso exitoso es seguido, en pocos minutos, de un cambio de privilegio y de acceso a datos sensibles.",
              "Un host de baja actividad pasa a ejecutar acciones administrativas con una cuenta de servicio."
            ]
          }
        ]
      },
      {
        heading: "Paso 4 — Reconozca patrones sospechosos (y valide)",
        paragraphs: [
          "Los patrones son señales para investigar, nunca confirmación. Los ejemplos a continuación son conceptuales y anonimizados — sirven para calibrar la mirada, no como regla universal:",
          "Antes de escalar cualquier patrón, valide con una segunda fuente independiente: ¿el evento aparece en el controlador de dominio y en el firewall? ¿La hora coincide en el huso correcto? Un único log no sostiene un incidente; dos fuentes que concuerdan forman una hipótesis defendible."
        ],
        "lists": [
          {
            "items": [
              "**Fuerza bruta / credential stuffing:** muchas fallas de autenticación para la misma cuenta, seguidas de un éxito, provenientes de una dirección o intervalo de tiempo inusual. OWASP recomienda registrar las fallas de autenticación precisamente por eso.",
              "**Acceso fuera de patrón:** uso de una cuenta administrativa en horario inusual, sin ticket ni justificación.",
              "**Cadena login → privilegio → datos:** autenticación, elevación y acceso a datos sensibles en secuencia rápida.",
              "**Defensa comprometida:** desactivación de logs, agentes de recolección detenidos o brechas repentinas de eventos, acompañadas de fallas de servicio."
            ]
          }
        ]
      },
      {
        heading: "Falsos positivos, evidencia y preservación",
        paragraphs: [
          "Dos errores comunes destruyen el valor del análisis: reglas demasiado amplias y logs frágiles. Las reglas excesivamente amplias producen lo que OWASP llama “alarm fog” — tanto ruido que los problemas reales pasan desapercibidos. Las reglas de detección deben probarse contra el baseline y ajustarse con base en la tasa de falsos positivos, sin perder los eventos objetivo.",
          "La integridad del log también es parte del análisis: los logs alterables no sirven como evidencia. El CIS Control 8 orienta a proteger la recolección y la retención; el [NIST SP 800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) (finalizado en abril de 2025), guía vigente de respuesta a incidentes, refuerza la preservación de evidencias como parte del ciclo de detección y respuesta. En la práctica: preserve los logs originales antes de cualquier acción de contención, no sobrescriba datos, registre quién recolectó qué y cuándo, y siga la cadena de custodia definida en el proceso interno de la organización."
        ],
        "lists": []
      },
      {
        heading: "Lo que aún no sabemos",
        paragraphs: [
          "Esta guía no prescribe herramientas específicas y no afirma telemetría ni experiencia interna de CyDef. El NIST SP 800-92r1 sigue siendo un draft (el documento final vigente es el SP 800-92 de 2006) y debe seguirse hasta su publicación definitiva. Las versiones citadas — ATT&CK v19.2, CIS Controls v8.1 — se verificaron el 24/08/2026 y deben revalidarse antes de la publicación. Autor y revisor técnico de este artículo aún no han sido definidos."
        ],
        "lists": []
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "Aplique los cuatro pasos a su cola de alertas: mapee las fuentes de datos y las brechas, normalice campos y relojes, arme la línea de tiempo por entidad, documente hipótesis con el vocabulario de ATT&CK y valide cada patrón con una segunda fuente antes de escalar. Consulte las referencias oficiales a continuación para profundizar."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "NIST SP 800-92 (final, 2006)",
        "url": "https://csrc.nist.gov/pubs/sp/800/92/final"
      },
      {
        "label": "NIST SP 800-92 Rev. 1 (draft, 2023)",
        "url": "https://csrc.nist.gov/pubs/sp/800/92/r1/ipd"
      },
      {
        "label": "OWASP Logging Cheat Sheet",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
      },
      {
        "label": "OWASP Top 10:2025, A09 Security Logging and Alerting Failures",
        "url": "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures"
      },
      {
        "label": "MITRE ATT&CK (v19.2)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "CIS Controls v8.1, Control 8 (Audit Log Management)",
        "url": "https://www.cisecurity.org/controls/audit-log-management"
      },
      {
        "label": "NIST SP 800-61r3 (final, 2025)",
        "url": "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
      },
      {
        "label": "RFC 5424, The Syslog Protocol (IETF)",
        "url": "https://www.rfc-editor.org/rfc/rfc5424"
      }
    ],
    "changelog": [
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-logs-07, READY). Fuentes accedidas y verificadas el 2026-08-24."
    ]
  },
  {
    slug: "inteligencia-de-ameacas-como-usar-iocs",
    title: "Inteligencia de Amenazas: Cómo usar IOCs de forma efectiva",
    category: "Inteligencia de Amenazas",
    excerpt: "Entienda cómo recolectar, validar y aplicar Indicadores de Compromiso en el contexto de la defensa proactiva.",
    date: "24 de agosto de 2026",
    dateISO: "2026-08-24",
    readTime: "9 min de lectura",
    image: "/assets/blog/threat-intel-thumb.webp",
    author: "Equipo CyDef",
    sections: [
      {
        paragraphs: [
          "Un feed de Indicadores de Compromiso (IOCs) no protege a nadie por sí solo: un indicador mal validado genera bloqueos indebidos, y un indicador ignorado genera detección perdida. Esta guía presenta un ciclo de vida en cuatro etapas — recolectar, validar, aplicar y expirar — para quienes operan SOC, Blue Team o detección, con base en fuentes oficiales vigentes: OASIS STIX 2.1 y TAXII 2.1, CISA, FIRST, MITRE ATT&CK, NIST, MISP y AlienVault OTX. Hasta la fecha de corte de esta verificación (24/08/2026), estas eran las referencias consultadas. Aquí no se cita ningún IOC real: los ejemplos son conceptuales y sirven para calibrar el proceso, no para copiar valores. El siguiente paso, al terminar de leer, es aplicar el ciclo a los feeds que su equipo ya consume."
        ]
      },
      {
        heading: "Qué es un IOC (y qué no es)",
        paragraphs: [
          "Un indicador de compromiso es un observable — dirección IP, dominio, hash de archivo, ruta, dirección de correo electrónico, clave de registro — asociado a actividad maliciosa conocida o sospechosa. La guía oficial de intercambio de información de amenazas del NIST, el [NIST SP 800-150](https://csrc.nist.gov/pubs/sp/800/150/final) (publicado en octubre de 2016), trata los indicadores como pieza central del intercambio de inteligencia cibernética entre organizaciones.",
          "El formato técnico más usado para representar un IOC proviene del [estándar OASIS STIX 2.1](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html) (publicado en junio de 2021): el objeto `indicator` lleva un `pattern` — una expresión estructurada que describe el observable a buscar —, una ventana de validez, etiquetas y las fases del ataque en las que aplica. En la práctica, un indicador responde a una pregunta objetiva: “¿este observable ha estado asociado a actividad maliciosa?”.",
          "El punto que más genera errores de interpretación es este: **un IOC es evidencia para el triaje, no la identidad del atacante ni la confirmación de compromiso**. Una dirección vista en una campaña puede ser compartida por una CDN; un dominio puede estar sinkholed por un investigador; un hash puede reaparecer en un binario legítimo. El match de un indicador abre una investigación — y solo eso."
        ],
        "lists": []
      },
      {
        heading: "Por qué los IOCs expiran: volátil vs. duradero",
        paragraphs: [
          "Los indicadores son volátiles por naturaleza. El adversario cambia de infraestructura, registra nuevos dominios, rota IPs y recompila muestras — lo que convierte a cada indicador en una fotografía de un momento específico. El propio estándar STIX 2.1 reconoce esa realidad: el objeto `indicator` define los campos `valid_from` y `valid_until`, es decir, el estándar formal prevé que un indicador tiene una ventana de utilidad y expira.",
          "El contraste está en las TTPs — tácticas, técnicas y procedimientos. El [MITRE ATT&CK](https://attack.mitre.org/) (versión vigente: v19.2, publicada en agosto de 2026) organiza el comportamiento adversario en tácticas y técnicas observadas en intrusiones reales; el [Cyber Kill Chain de Lockheed Martin](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html), framework parte del modelo Intelligence Driven Defense, describe las fases que el adversario debe completar para alcanzar el objetivo. Mientras el IOC responde “qué buscar”, las TTPs responden “cómo actúa el adversario” — y el comportamiento es más duradero que la infraestructura.",
          "Esta distinción es una síntesis editorial respaldada por esas tres referencias: un IOC expira, una TTP persiste, y una operación madura usa ambos — IOC para detectar lo conocido, TTP para cazar lo desconocido."
        ],
        "lists": []
      },
      {
        heading: "Cómo recolectar IOCs con calidad",
        paragraphs: [
          "La recolección comienza con una pregunta de propósito, no de volumen: ¿qué decisión apoyará este indicador — detección, bloqueo, triaje o priorización? El NIST SP 800-150 orienta que el intercambio de información de amenazas se haga dentro de relaciones y procesos definidos, no como acumulación indiscriminada de datos.",
          "Las fuentes se organizan en capas:",
          "Al recolectar, registre metadatos: quién publicó, cuándo, con qué confianza y bajo qué etiqueta de intercambio. El [Traffic Light Protocol (TLP) 2.0 del FIRST](https://www.first.org/tlp/) (autoritativo desde agosto de 2022) define cuatro etiquetas — RED, AMBER, GREEN y CLEAR — que indican hasta dónde puede difundirse la información. Un IOC AMBER no se republica sin autorización; respetar la etiqueta es parte del uso responsable de la inteligencia."
        ],
        "lists": [
          {
            "items": [
              "**Telemetría e incidentes propios** — la fuente más confiable para su contexto, siempre que se registre con fecha, origen y evidencia.",
              "**Comunidades y plataformas abiertas** — [MISP](https://www.misp-project.org/) es una plataforma open source de recolección, almacenamiento, distribución e intercambio de indicadores, usada por CERTs y organizaciones; el [AlienVault OTX](https://otx.alienvault.com/) (operado por LevelBlue) es un exchange comunitario en el que los “pulses” reúnen IOCs y etiquetas de intercambio.",
              "**Programas gubernamentales** — el [Automated Indicator Sharing (AIS) de la CISA](https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/automated-indicator-sharing-ais) es el hub designado de intercambio de indicadores entre el gobierno federal de EE. UU. y el sector privado, operativo desde marzo de 2016, usando STIX/TAXII; el [catálogo KEV de la CISA](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) reúne vulnerabilidades con explotación conocida en el mundo real.",
              "**Feeds comerciales** — útiles, pero deben pasar por el mismo proceso de validación que cualquier otra fuente."
            ]
          }
        ]
      },
      {
        heading: "Cómo validar antes de actuar",
        paragraphs: [
          "La regla defensiva más barata que existe es: **ningún bloqueo automático basado en un IOC único de baja confianza**. Antes de actuar, valide cuatro cosas:",
          "1. **Fuente y confianza** — ¿quién publicó y cuál es el historial de esa fuente? En plataformas comunitarias como OTX, la calidad varía por ser crowdsourced: un pulse no es un informe de laboratorio. 2. **Antigüedad** — ¿el indicador sigue dentro de la ventana de utilidad? Un indicador antiguo sin revalidación pierde valor y se convierte en ruido. 3. **Contexto** — ¿el observable es exclusivo de la actividad descrita o puede ser infraestructura compartida (IP dinámica, CDN, hospedaje)? 4. **Confirmación independiente** — ¿una segunda fuente o su propia telemetría respaldan la misma conclusión?",
          "El mismo principio de priorización existe en el lado de las vulnerabilidades, y conviene no confundir las métricas: el [EPSS del FIRST](https://www.first.org/epss/) estima la probabilidad de que una CVE sea explotada en los próximos 30 días — es probabilidad, no confirmación de ataque; el KEV de la CISA indica explotación conocida — no prueba compromiso local. Usar ambos como insumo de priorización es correcto; tratarlos como alarma de compromiso no lo es."
        ],
        "lists": []
      },
      {
        heading: "Cómo aplicar IOCs en la detección",
        paragraphs: [
          "Los IOCs entran en la operación en capas, con contexto. Un match de indicador en SIEM, EDR o firewall es un disparador de triaje — una señal de baja fidelidad que merece investigación, no un veredicto. Dos prácticas hacen sostenible la aplicación:",
          "Pruebe siempre en modo de detección antes de bloquear: active la alerta, mida los falsos positivos durante un período definido y solo entonces considere el bloqueo, con ventana de expiración y procedimiento de rollback."
        ],
        "lists": [
          {
            "items": [
              "**Transporte estructurado.** El [protocolo TAXII 2.1 de OASIS](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html) define una API RESTful para comunicar información de amenazas entre cliente y servidor; combinado con STIX, permite importar feeds con patrón, validez y contexto — en lugar de listas sueltas de valores. Es el mismo mecanismo que usa el AIS de la CISA.",
              "**Complemento con TTP.** Una lista de IOCs detecta lo que ya es conocido. Para lo desconocido, la operación necesita hipótesis de comportamiento: describir el patrón observado con el vocabulario de ATT&CK y con las fases del kill chain, y cazar por comportamiento, no solo por valor. Un detalle importante: ATT&CK es una taxonomía — mapear un observable a una técnica es análisis, no prueba, y los IDs de técnica cambian entre versiones."
            ]
          }
        ]
      },
      {
        heading: "Expiración e higiene del IOC",
        paragraphs: [
          "Mantener la lista limpia es tan defensivo como alimentarla. Use la ventana de validez del indicador (el `valid_until` de STIX, cuando la fuente la proporciona), defina una cadencia de revisión y elimine los IOCs vencidos o no confirmados. Las métricas simples ayudan: cuántas alertas genera cada feed y cuántas se convierten en investigación útil. Un feed que solo produce ruido está costando atención del analista — el “alarm fog” que oculta las señales reales.",
          "Registre también las decisiones: por qué un IOC se bloqueó y por qué se eliminó. Los bloqueos indebidos ocurren — IP compartida, dominio reutilizado — y necesitan reversión rápida y documentada."
        ],
        "lists": []
      },
      {
        heading: "Lo que aún no sabemos",
        paragraphs: [
          "Esta guía no prescribe herramientas específicas, no cita IOCs reales y no afirma telemetría ni experiencia interna de CyDef. Las versiones citadas — STIX 2.1 y TAXII 2.1 (junio de 2021), TLP 2.0 (agosto de 2022), ATT&CK v19.2 (agosto de 2026) — se verificaron el 24/08/2026 y deben revalidarse antes de la publicación. No se encontró ninguna métrica de eficacia de feeds ni de prevalencia de campañas en las fuentes consultadas, y ninguna será inventada. Autor y revisor técnico de este artículo aún no han sido definidos."
        ],
        "lists": []
      },
      {
        heading: "Próximos pasos",
        paragraphs: [
          "Aplique el ciclo a las fuentes que su equipo ya consume: registre origen y confianza de cada IOC, defina la ventana de validez, active la detección en alert-only, mida los falsos positivos y documente la política de expiración — antes de cualquier bloqueo automático. Consulte las referencias oficiales a continuación para profundizar y revalide las fuentes volátiles inmediatamente antes de publicar."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "NIST SP 800-150, Guide to Cyber Threat Information Sharing (final, 2016)",
        "url": "https://csrc.nist.gov/pubs/sp/800/150/final"
      },
      {
        "label": "OASIS STIX Version 2.1 (OASIS Standard, 2021)",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html"
      },
      {
        "label": "OASIS TAXII Version 2.1 (OASIS Standard, 2021)",
        "url": "https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html"
      },
      {
        "label": "CISA Known Exploited Vulnerabilities (KEV) Catalog",
        "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
      },
      {
        "label": "FIRST Exploit Prediction Scoring System (EPSS)",
        "url": "https://www.first.org/epss/"
      },
      {
        "label": "FIRST Traffic Light Protocol (TLP) 2.0",
        "url": "https://www.first.org/tlp/"
      },
      {
        "label": "MITRE ATT&CK (v19.2)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "MISP",
        "url": "https://www.misp-project.org/"
      },
      {
        "label": "AlienVault OTX (LevelBlue)",
        "url": "https://otx.alienvault.com/"
      },
      {
        "label": "Lockheed Martin Cyber Kill Chain",
        "url": "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html"
      },
      {
        "label": "CISA Automated Indicator Sharing (AIS)",
        "url": "https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/automated-indicator-sharing-ais"
      }
    ],
    "changelog": [
      "2026-08-24: primera versión, basada en el dossier verificado (evergreen-threatintel-08, READY). Fuentes accedidas y verificadas el 2026-08-24."
    ]
  }
];
