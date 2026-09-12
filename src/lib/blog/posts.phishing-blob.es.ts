import type { BlogPost } from "./posts";

/**
 * Campaña de phishing con blob URLs y Microsoft Teams - artículo ES (traducción del canónico PT).
 * Capa: public/assets/blog/phishing-blob-urls-microsoft-teams-thumb.webp
 */
export const phishingBlobPostEs: BlogPost = {
  slug: "phishing-blob-urls-microsoft-teams-navegador",
  title:
    "Una campaña de phishing crea páginas falsas de login directamente en el navegador de las víctimas",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Una campaña analizada por Barracuda abandona la página de phishing hospedada y monta el contenido malicioso dentro del navegador de la víctima, después de una cadena de redireccionamientos que pasa por Microsoft OAuth y Microsoft Teams.",
  date: "11 de septiembre de 2026",
  dateISO: "2026-09-11",
  readTime: "15 min de lectura",
  image: "/assets/blog/phishing-blob-urls-microsoft-teams-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Phishing",
    "Microsoft 365",
    "Microsoft Teams",
    "OAuth",
    "Blob URL",
    "Threat Intelligence",
    "Blue Team",
    "SOC",
    "Identity Security",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Una campaña de phishing analizada por Barracuda demuestra una evolución importante en las técnicas de ingeniería social: en lugar de hospedar la página falsa de autenticación en un sitio convencional, los operadores montan el contenido de phishing **dentro del propio navegador de la víctima**, utilizando **blob URLs**, **service workers**, **iframes en sandbox** y una cadena de redireccionamientos que pasa por servicios legítimos de Microsoft.",
        },
        {
          type: "p",
          text: "El flujo observado comienza con un correo con temática de DocuSign y utiliza una invitación de calendario para reforzar la apariencia de legitimidad. La víctima es entonces dirigida por infraestructura legítima de Microsoft OAuth y por Microsoft Teams antes de que un recurso externo sea cargado y convertido por el navegador en una blob URL.",
        },
        {
          type: "p",
          text: "El resultado es una página falsa que puede existir solamente durante aquella sesión del navegador, lo que reduce la utilidad de mecanismos de seguridad basados exclusivamente en la reputación o en la inspección previa de la URL final.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "Riesgo alto para organizaciones que dependen solo de filtros de URL, reputación de dominio y concientización basada en la verificación visual de la dirección inicial.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Fuentes consultadas y verificadas el 11 de septiembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "La campaña llama la atención porque modifica una de las premisas más comunes del phishing tradicional: la existencia de una página maliciosa permanentemente hospedada en un dominio controlado por el atacante.",
        },
        {
          type: "p",
          text: "En el escenario analizado, la cadena utiliza:",
        },
        {
          type: "list",
          items: [
            "correo con temática de DocuSign;",
            "invitación de calendario como elemento de legitimidad;",
            "endpoint legítimo de Microsoft OAuth;",
            "Microsoft Teams como parte de la cadena de navegación;",
            "recurso externo hospedado en cdn.bloom[.]io;",
            "creación de una **blob URL** por el navegador;",
            "renderizado local de la página de phishing;",
            "**service worker** e **iframe en sandbox** para controlar partes del flujo;",
            "infraestructura remota para alterar dinámicamente el comportamiento de la campaña.",
          ],
        },
        {
          type: "p",
          text: "Según Barracuda, la campaña no explota una vulnerabilidad de Microsoft Teams. Lo que ocurre es el **abuso de servicios legítimos, recursos del navegador y mecanismos de redireccionamiento** para construir una cadena más convincente y menos visible para los controles tradicionales.",
        },
      ],
    },
    {
      heading: "¿Qué hace diferente a esta campaña?",
      blocks: [
        {
          type: "p",
          text: "En una campaña convencional, el atacante normalmente registra o compromete un dominio, publica una página similar al servicio legítimo y envía el enlace a la víctima.",
        },
        {
          type: "p",
          text: "Ese modelo ofrece a los defensores diversos puntos de observación:",
        },
        {
          type: "list",
          items: [
            "reputación del dominio;",
            "antigüedad del dominio;",
            "certificado;",
            "contenido HTML;",
            "hospedaje;",
            "capturas de pantalla automatizadas;",
            "análisis en sandbox;",
            "mecanismos de crawling;",
            "inclusión de la URL en blocklists.",
          ],
        },
        {
          type: "p",
          text: "La campaña analizada por Barracuda reduce parte de esa superficie.",
        },
        {
          type: "p",
          text: "El contenido final de phishing se crea por medio de una **blob URL**, es decir, una URL temporal generada por el navegador y asociada a datos almacenados localmente en la sesión.",
        },
        {
          type: "p",
          text: "Una dirección de este tipo puede asumir un formato similar a:",
        },
        { type: "code", text: "blob:https://exemplo/identificador" },
        {
          type: "p",
          text: "El punto importante es que esa URL no representa, por sí sola, una página tradicional hospedada en un servidor web que pueda ser consultada posteriormente por una solución de seguridad.",
        },
        {
          type: "p",
          text: "Cuando la sesión termina, el contenido puede dejar de existir.",
        },
        {
          type: "p",
          text: "Esto crea un problema relevante para el análisis preventivo y la respuesta a incidentes: **lo que el usuario visualizó puede no estar disponible cuando el SOC inicie la investigación.**",
        },
      ],
    },
    {
      heading: "Cadena de ataque observada",
      blocks: [
        {
          type: "p",
          text: "La secuencia a continuación reproduce el orden descrito por los investigadores, desde el mensaje inicial hasta el control de la sesión del navegador.",
        },
      ],
    },
    {
      heading: "1. Ingeniería social con temática de DocuSign",
      blocks: [
        {
          type: "p",
          text: "La víctima recibe un correo que simula una solicitud relacionada con DocuSign.",
        },
        {
          type: "p",
          text: "Este tipo de abordaje explora un contexto común en entornos corporativos: documentos que necesitan ser revisados, firmados o aprobados.",
        },
      ],
    },
    {
      heading: "2. Invitación de calendario como elemento de confianza",
      blocks: [
        {
          type: "p",
          text: "El mensaje incluye un archivo de invitación de calendario.",
        },
        {
          type: "p",
          text: "La invitación no representa necesariamente la carga maliciosa principal. Su función es hacer la comunicación más compatible con un flujo legítimo de negocios y reducir la percepción de riesgo por parte del usuario.",
        },
      ],
    },
    {
      heading: "3. Redireccionamiento por infraestructura legítima de Microsoft OAuth",
      blocks: [
        {
          type: "p",
          text: "La navegación inicial utiliza login.microsoftonline.com, infraestructura legítima de Microsoft.",
        },
        {
          type: "p",
          text: "Este punto es especialmente importante para el análisis defensivo.",
        },
        {
          type: "p",
          text: "**El dominio login.microsoftonline.com no debe ser tratado de forma aislada como un indicador malicioso ni bloqueado.** Su relevancia existe dentro del **contexto de la cadena de redireccionamiento**.",
        },
      ],
    },
    {
      heading: "4. Encaminamiento hacia Microsoft Teams",
      blocks: [
        {
          type: "p",
          text: "Un parámetro de redireccionamiento elaborado conduce a la víctima a Microsoft Teams.",
        },
        {
          type: "p",
          text: "La presencia de servicios Microsoft durante la navegación ayuda a reducir señales que normalmente levantarían sospecha en los usuarios y en determinados mecanismos automatizados de análisis.",
        },
      ],
    },
    {
      heading: "5. Carga de recurso externo",
      blocks: [
        {
          type: "p",
          text: "Durante el flujo observado por los investigadores, Microsoft Teams carga un recurso externo hospedado en:",
        },
        { type: "code", text: "cdn.bloom[.]io" },
        {
          type: "p",
          text: "Este dominio debe ser tratado como **artefacto observado en la campaña**, y no como evidencia suficiente, de forma aislada, para concluir un compromiso. Antes de aplicar cualquier bloqueo en producción, la organización debe validar el contexto, el uso legítimo, la inteligencia de amenazas disponible y los posibles impactos operacionales.",
        },
      ],
    },
    {
      heading: "6. Creación de la blob URL",
      blocks: [
        {
          type: "p",
          text: "El navegador recibe el contenido y crea una blob URL.",
        },
        {
          type: "p",
          text: "En ese momento, el phishing deja de depender de una página final tradicionalmente hospedada y pasa a ser renderizado localmente.",
        },
      ],
    },
    {
      heading: "7. Renderizado de la página falsa",
      blocks: [
        {
          type: "p",
          text: "La página de phishing es presentada al usuario dentro de la sesión del navegador.",
        },
        {
          type: "p",
          text: "Para la víctima, la experiencia puede parecerse a un flujo común de autenticación corporativa.",
        },
        {
          type: "p",
          text: "Para determinados mecanismos de seguridad, sin embargo, la página final puede no existir como una dirección HTTP o HTTPS convencional que pueda ser consultada posteriormente.",
        },
      ],
    },
    {
      heading: "8. Control de la sesión",
      blocks: [
        {
          type: "p",
          text: "La campaña utiliza recursos como:",
        },
        {
          type: "list",
          items: [
            "service workers;",
            "iframes en sandbox;",
            "mecanismos de comunicación del navegador;",
            "infraestructura backend controlada por los operadores.",
          ],
        },
        {
          type: "p",
          text: "Estos componentes permiten que el comportamiento de la página sea controlado y modificado dinámicamente.",
        },
        {
          type: "p",
          text: "Barracuda también identificó configuraciones de comando y control que indican que el flujo forma parte de una plataforma administrable, en lugar de una página estática aislada.",
        },
      ],
    },
    {
      heading: "Diagrama simplificado de la cadena",
      blocks: [
        {
          type: "code",
          text: "E-mail com tema do DocuSign\n        |\n        v\nConvite de calendário\n        |\n        v\nMicrosoft OAuth\n(login.microsoftonline.com)\n        |\n        v\nMicrosoft Teams\n        |\n        v\nRecurso externo\n(cdn.bloom[.]io)\n        |\n        v\nConteúdo recebido pelo navegador\n        |\n        v\nCriação de blob URL\n        |\n        v\nPágina falsa renderizada localmente\n        |\n        +--> Service Worker\n        +--> Sandboxed iframe\n        +--> Backend do atacante\n        |\n        v\nPossível captura de credenciais\ne comprometimento de conta",
        },
      ],
    },
    {
      heading: "¿Por qué las blob URLs dificultan la detección?",
      blocks: [
        {
          type: "p",
          text: "Las blob URLs son recursos legítimos de los navegadores modernos. Las aplicaciones web pueden utilizarlas para representar objetos creados dinámicamente, como archivos, imágenes, documentos y contenido generado durante la ejecución de una aplicación.",
        },
        {
          type: "p",
          text: "El problema no está en la tecnología en sí, sino en el uso abusivo.",
        },
      ],
    },
    {
      heading: "Ausencia de una página final convencional",
      blocks: [
        {
          type: "p",
          text: "Una herramienta que intente acceder posteriormente a la URL de phishing puede no conseguir reproducir el contenido visualizado por la víctima.",
        },
      ],
    },
    {
      heading: "Naturaleza temporal",
      blocks: [
        {
          type: "p",
          text: "La página puede existir solamente mientras el objeto permanezca asociado a la sesión del navegador.",
        },
      ],
    },
    {
      heading: "Menor valor de la reputación de URL",
      blocks: [
        {
          type: "p",
          text: "Las soluciones que dependen fuertemente de blocklists o de la reputación de dominios pueden tener dificultad para evaluar una URL creada localmente.",
        },
      ],
    },
    {
      heading: "Dependencia del contexto de ejecución",
      blocks: [
        {
          type: "p",
          text: "Para comprender el ataque, puede ser necesario reconstruir:",
        },
        {
          type: "list",
          items: [
            "el mensaje recibido;",
            "el clic inicial;",
            "los redireccionamientos;",
            "el recurso externo cargado;",
            "el comportamiento del navegador;",
            "la autenticación realizada posteriormente.",
          ],
        },
        {
          type: "p",
          text: "El análisis deja de ser puramente basado en URL y pasa a exigir una **correlación entre correo, navegador, endpoint e identidad**.",
        },
      ],
    },
    {
      heading: "Uso de servicios legítimos como parte de la cadena",
      blocks: [
        {
          type: "p",
          text: "Otro aspecto importante es la utilización de infraestructura legítima.",
        },
        {
          type: "p",
          text: "La presencia de dominios Microsoft no hace la sesión segura automáticamente. De la misma forma, la presencia de esos dominios en logs de una investigación no significa que la infraestructura de Microsoft esté comprometida.",
        },
        {
          type: "p",
          text: "La técnica explota la confianza asociada a servicios conocidos y los utiliza como parte de una secuencia de navegación. Esto refuerza un cambio importante en el modelo de detección:",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Cambio de premisa",
            body: "La reputación de un único dominio es insuficiente para determinar la legitimidad de una cadena completa de navegación.",
          },
        },
      ],
    },
    {
      heading: "Posibles impactos",
      blocks: [
        {
          type: "p",
          text: "En caso de que la víctima informe credenciales en la página falsa o apruebe una etapa posterior controlada por los operadores, los impactos pueden incluir:",
        },
      ],
    },
    {
      heading: "Robo de credenciales",
      blocks: [
        {
          type: "p",
          text: "Los usuarios pueden proporcionar nombre de usuario, contraseña u otros datos de autenticación en una interfaz que aparenta ser legítima.",
        },
      ],
    },
    {
      heading: "Compromiso de cuentas",
      blocks: [
        {
          type: "p",
          text: "Credenciales válidas pueden permitir acceso indebido a servicios corporativos, especialmente cuando no estén presentes controles adicionales de identidad.",
        },
      ],
    },
    {
      heading: "Acceso a recursos en la nube",
      blocks: [
        {
          type: "p",
          text: "Una cuenta comprometida puede exponer, de acuerdo con sus privilegios:",
        },
        {
          type: "list",
          items: [
            "correo;",
            "documentos;",
            "archivos compartidos;",
            "información corporativa;",
            "aplicaciones SaaS;",
            "datos almacenados en servicios de nube.",
          ],
        },
      ],
    },
    {
      heading: "Movimiento hacia otros ataques",
      blocks: [
        {
          type: "p",
          text: "El compromiso inicial de identidad puede ser utilizado como punto de partida para nuevas campañas de phishing, fraude interno, recolección de información y otras actividades posteriores al compromiso.",
        },
      ],
    },
    {
      heading: "Reducción de evidencias disponibles",
      blocks: [
        {
          type: "p",
          text: "Como parte del contenido se genera durante la sesión, la investigación puede perder información relevante en caso de que los artefactos del navegador y los eventos de identidad no sean preservados rápidamente.",
        },
      ],
    },
    {
      heading: "Desafíos para SOC y Blue Team",
      blocks: [
        {
          type: "p",
          text: "La campaña demuestra por qué la defensa contra el phishing moderno no debe depender exclusivamente de controles de correo o listas de dominios maliciosos.",
        },
      ],
    },
    {
      heading: "1. El primer dominio puede ser legítimo",
      blocks: [
        {
          type: "p",
          text: "El usuario puede visualizar infraestructura conocida al inicio de la navegación.",
        },
      ],
    },
    {
      heading: "2. El destino efectivo aparece después de múltiples redireccionamientos",
      blocks: [
        {
          type: "p",
          text: "Analizar solamente el primer enlace puede producir una conclusión incorrecta.",
        },
      ],
    },
    {
      heading: "3. La página final puede no ser recuperable",
      blocks: [
        {
          type: "p",
          text: "Cuando el analista intente reproducir el incidente, la blob URL podrá no existir más.",
        },
      ],
    },
    {
      heading: "4. La detección necesita atravesar múltiples capas",
      blocks: [
        {
          type: "p",
          text: "El SOC debe correlacionar datos provenientes de:",
        },
        {
          type: "list",
          items: [
            "Secure Email Gateway;",
            "EDR/XDR;",
            "navegador;",
            "proxy/SWG/SSE;",
            "DNS;",
            "identidad;",
            "Microsoft Entra ID;",
            "Microsoft 365;",
            "SIEM;",
            "herramientas de protección contra phishing.",
          ],
        },
      ],
    },
    {
      heading: "Indicadores y artefactos de investigación",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor / Artefacto", "Clasificación", "Orientación"],
            rows: [
              [
                "Dominio",
                "cdn.bloom[.]io",
                "Artefacto observado en la campaña",
                "Investigar accesos en el contexto de la cadena; validar antes de bloquear",
              ],
              [
                "Dominio",
                "login.microsoftonline.com",
                "Infraestructura legítima Microsoft",
                "No tratar como IoC aislado y no bloquear",
              ],
              [
                "Servicio",
                "Microsoft Teams",
                "Servicio legítimo utilizado en la cadena",
                "Evaluar redireccionamientos y cargas externas asociadas",
              ],
              [
                "Esquema",
                "blob:",
                "Recurso legítimo de navegador",
                "Investigar cuando esté asociado a páginas de login o flujos sospechosos",
              ],
              [
                "Navegador",
                "Service Worker",
                "Recurso legítimo",
                "Evaluar registros o comportamiento anómalo en contexto de phishing",
              ],
              [
                "Navegador",
                "Sandboxed iframe",
                "Recurso legítimo",
                "Correlacionar con contenido externo y flujos de autenticación sospechosos",
              ],
              [
                "Correo",
                "Tema DocuSign",
                "Indicador comportamental",
                "Evaluar remitente, autenticación del correo, enlaces y contexto de la solicitud",
              ],
              [
                "Anexo",
                "Invitación de calendario",
                "Indicador contextual",
                "No considerar malicioso de forma aislada; analizar URLs y cadena asociada",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Observación sobre IoCs",
      blocks: [
        {
          type: "p",
          text: "No todos los elementos de una cadena de ataque deben ser tratados como IoCs bloqueables. Servicios como Microsoft OAuth y Teams tienen uso legítimo a gran escala.",
        },
        {
          type: "p",
          text: "Bloqueos indiscriminados pueden generar alto impacto operacional y elevado volumen de falsos positivos. El enfoque recomendado es combinar **indicadores técnicos, secuencia de eventos y comportamiento**.",
        },
      ],
    },
    {
      heading: "Mapeo MITRE ATT&CK",
      blocks: [
        {
          type: "p",
          text: "El mapeo a continuación representa una evaluación defensiva de CyDef con base en el comportamiento descrito públicamente y debe ser validado conforme las evidencias disponibles en cada incidente.",
        },
        {
          type: "table",
          table: {
            headers: ["Táctica", "Técnica", "ID", "Relación con la actividad"],
            rows: [
              [
                "Initial Access",
                "Phishing",
                "T1566",
                "Correo utilizado para conducir a la víctima al flujo malicioso",
              ],
              [
                "Initial Access",
                "Spearphishing Link",
                "T1566.002",
                "Navegación inducida por enlace/redireccionamiento",
              ],
              [
                "Execution",
                "User Execution: Malicious Link",
                "T1204.001",
                "La cadena depende de la interacción de la víctima",
              ],
              [
                "Credential Access",
                "Input Capture",
                "T1056",
                "La página falsa busca capturar información proporcionada por el usuario",
              ],
              [
                "Credential Access",
                "Web Portal Capture",
                "T1056.003",
                "Compatible con la utilización de una página de autenticación falsa para la recolección de credenciales",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Las técnicas posteriores al compromiso, como el uso de cuentas válidas, solo deben ser atribuidas en caso de que existan evidencias de que las credenciales capturadas fueron efectivamente utilizadas.",
        },
      ],
    },
    {
      heading: "Hipótesis de detección",
      blocks: [
        {
          type: "p",
          text: "En lugar de crear una regla basada solamente en un dominio, los equipos de Detection Engineering pueden trabajar con hipótesis de correlación.",
        },
      ],
    },
    {
      heading: "Hipótesis 1: correo de firma seguido por una cadena inusual",
      blocks: [
        {
          type: "p",
          text: "Buscar eventos en los que:",
        },
        {
          type: "code",
          text: "mensagem com tema de assinatura/documento\nAND\nlink ou convite de calendário\nAND\nnavegação para serviço Microsoft legítimo\nAND\nredirecionamento ou acesso subsequente a domínio externo incomum",
        },
      ],
    },
    {
      heading: "Hipótesis 2: dominio externo justo después de Teams/OAuth",
      blocks: [
        {
          type: "p",
          text: "Correlacionar, en una ventana temporal corta:",
        },
        {
          type: "code",
          text: "acesso a login.microsoftonline.com\nOR acesso a Microsoft Teams\nTHEN\nconexão com cdn.bloom.io ou outro domínio externo recém-observado\nTHEN\nevento de autenticação suspeito",
        },
        {
          type: "p",
          text: "El objetivo no es considerar la secuencia automáticamente maliciosa, sino elevar su prioridad para investigación cuando haya un contexto de correo sospechoso.",
        },
      ],
    },
    {
      heading: "Hipótesis 3: autenticación anómala después de un clic reportado",
      blocks: [
        {
          type: "p",
          text: "Después de que un usuario reporte haber interactuado con un mensaje sospechoso, buscar:",
        },
        {
          type: "list",
          items: [
            "nuevas direcciones IP;",
            "ASN inusual;",
            "ubicación incompatible con el patrón del usuario;",
            "dispositivo no reconocido;",
            "user agent atípico;",
            "nuevas sesiones;",
            "alteraciones en métodos de autenticación;",
            "creación de reglas de buzón;",
            "consentimientos o aplicaciones inusuales;",
            "accesos a archivos y servicios justo después del evento.",
          ],
        },
      ],
    },
    {
      heading: "Hipótesis 4: blob URL utilizada en contexto de autenticación",
      blocks: [
        {
          type: "p",
          text: "Cuando la organización posea telemetría de navegador capaz de registrar ese comportamiento, priorizar los casos en los que una blob URL esté asociada a:",
        },
        {
          type: "list",
          items: [
            "formulario de login;",
            "solicitud de credenciales;",
            "navegación originada de correo;",
            "carga de scripts o contenido externo inusual;",
            "registro reciente de service worker.",
          ],
        },
        {
          type: "p",
          text: "La disponibilidad de estos datos varía según el navegador, el EDR, la extensión corporativa y la arquitectura de seguridad utilizada.",
        },
      ],
    },
    {
      heading: "Recomendaciones de protección",
      blocks: [
        {
          type: "p",
          text: "Las acciones a continuación siguen las recomendaciones de la fuente primaria y la experiencia de operación de SOC, con foco en controles que siguen siendo válidos cuando la página de phishing deja de existir como URL.",
        },
      ],
    },
    {
      heading: "Monitorear la cadena completa de redireccionamiento",
      blocks: [
        {
          type: "p",
          text: "Las herramientas de protección de correo y navegación deben, siempre que sea posible, analizar más que la primera dirección presente en el mensaje.",
        },
        {
          type: "p",
          text: "El objetivo es identificar el destino y el comportamiento a lo largo de toda la cadena.",
        },
      ],
    },
    {
      heading: "Fortalecer la autenticación resistente a phishing",
      blocks: [
        {
          type: "p",
          text: "Barracuda recomienda mecanismos como:",
        },
        {
          type: "list",
          items: ["FIDO2;", "security keys;", "passkeys."],
        },
        {
          type: "p",
          text: "Los métodos resistentes a phishing reducen el riesgo asociado al simple robo de contraseña y representan una capa importante de protección contra las campañas modernas de recolección de credenciales.",
        },
      ],
    },
    {
      heading: "Correlacionar correo, identidad y endpoint",
      blocks: [
        {
          type: "p",
          text: "El clic en el correo no debe ser analizado de forma aislada. Una investigación madura debe conseguir relacionar:",
        },
        {
          type: "code",
          text: "E-mail\n  -> Clique\n  -> Navegação\n  -> Endpoint\n  -> Identidade\n  -> Sessão\n  -> Recursos acessados",
        },
      ],
    },
    {
      heading: "Monitorear flujos OAuth y redireccionamientos",
      blocks: [
        {
          type: "p",
          text: "Redireccionamientos inesperados, parámetros inusuales y secuencias que involucran servicios de autenticación deben ser evaluados en contexto.",
        },
      ],
    },
    {
      heading: "Aumentar la visibilidad del navegador",
      blocks: [
        {
          type: "p",
          text: "Las organizaciones con mayor exposición al phishing pueden evaluar mecanismos de browser security, SSE/SWG, extensiones corporativas y telemetría capaz de proporcionar mayor visibilidad sobre el comportamiento ocurrido después del clic.",
        },
      ],
    },
    {
      heading: "Actualizar los entrenamientos de concientización",
      blocks: [
        {
          type: "p",
          text: "Orientaciones como “verifique si el dominio parece legítimo” siguen siendo útiles, pero ya no son suficientes de forma aislada. Los usuarios también deben ser orientados a:",
        },
        {
          type: "list",
          items: [
            "desconfiar de solicitudes inesperadas de firma;",
            "confirmar pedidos sensibles por un canal conocido;",
            "interrumpir el flujo cuando una solicitud de autenticación surja de forma inesperada;",
            "reportar rápidamente mensajes sospechosos, incluso después de haber hecho clic.",
          ],
        },
      ],
    },
    {
      heading: "Acciones recomendadas en caso de interacción",
      blocks: [
        {
          type: "p",
          text: "Si un usuario hubiera interactuado con una campaña similar, la respuesta debe considerar el grado de exposición.",
        },
      ],
    },
    {
      heading: "Cuando hubo solamente el clic",
      blocks: [
        {
          type: "list",
          items: [
            "1) preservar el mensaje original;",
            "2) registrar la hora aproximada de la interacción;",
            "3) recolectar la cadena de URLs y redireccionamientos disponible;",
            "4) revisar la telemetría del endpoint y del navegador;",
            "5) consultar eventos de proxy, DNS y EDR;",
            "6) revisar autenticaciones ocurridas justo después del clic;",
            "7) identificar a otros destinatarios de la misma campaña.",
          ],
        },
      ],
    },
    {
      heading: "Cuando credenciales pueden haber sido informadas",
      blocks: [
        {
          type: "p",
          text: "Además de las acciones anteriores:",
        },
        {
          type: "list",
          items: [
            "1) restablecer la credencial expuesta;",
            "2) revocar sesiones y tokens aplicables;",
            "3) revisar eventos de autenticación;",
            "4) verificar nuevos dispositivos y ubicaciones;",
            "5) revisar alteraciones de MFA o métodos de autenticación;",
            "6) buscar reglas de reenvío o de buzón sospechosas;",
            "7) analizar accesos a archivos y aplicaciones;",
            "8) verificar señales de persistencia o uso posterior de la cuenta.",
          ],
        },
      ],
    },
    {
      heading: "Cuando haya evidencia de compromiso de la cuenta",
      blocks: [
        {
          type: "p",
          text: "La organización debe ampliar el alcance de la investigación para determinar:",
        },
        {
          type: "list",
          items: [
            "qué servicios fueron accedidos;",
            "qué datos fueron consultados o descargados;",
            "si hubo envío de mensajes por la cuenta comprometida;",
            "si otras identidades fueron objetivo;",
            "si se agregaron aplicaciones o consentimientos;",
            "si se obtuvieron credenciales o tokens adicionales;",
            "si el incidente exige comunicación interna, jurídica, regulatoria o a clientes.",
          ],
        },
      ],
    },
    {
      heading: "Qué enseña esta campaña",
      blocks: [
        {
          type: "p",
          text: "El principal aprendizaje no está solamente en el uso de blob URLs.",
        },
        {
          type: "p",
          text: "La campaña demuestra una tendencia mayor: **los atacantes están desplazando etapas de la cadena de phishing hacia entornos y servicios considerados confiables**, reduciendo el valor de los controles basados en indicadores estáticos.",
        },
        {
          type: "p",
          text: "La pregunta defensiva deja de ser solamente:",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "De la URL a la secuencia",
            body: "“¿Cuál es la URL maliciosa?” deja de ser la pregunta central y pasa a incluir: “¿Cuál fue la secuencia completa de acciones que llevó al usuario hasta la solicitud de credenciales?”.",
          },
        },
        {
          type: "p",
          text: "Este modelo exige mayor integración entre seguridad de correo, protección de identidad, navegador, endpoint y SIEM.",
        },
      ],
    },
    {
      heading: "Conclusión",
      blocks: [
        {
          type: "p",
          text: "La campaña analizada por Barracuda muestra cómo las técnicas de phishing están evolucionando para eludir mecanismos tradicionales de análisis.",
        },
        {
          type: "p",
          text: "Al utilizar Microsoft OAuth y Microsoft Teams como partes de una cadena de navegación y generar la página falsa por medio de una blob URL dentro del navegador, los operadores reducen señales tradicionales de compromiso y hacen la investigación más dependiente del contexto y de la correlación.",
        },
        {
          type: "p",
          text: "Esto no representa una vulnerabilidad de Microsoft Teams. Representa, sin embargo, un ejemplo relevante de **abuso de funcionalidades legítimas para construir una experiencia de phishing más convincente y evasiva**.",
        },
        {
          type: "p",
          text: "Para equipos de SOC, Blue Team y Detection Engineering, el principal cambio de mentalidad es claro: **no basta con analizar dónde comenzó el clic. Es necesario entender qué hizo el navegador después de él.**",
        },
      ],
    },
    {
      blocks: [
        {
          type: "note",
          text: "Este contenido tiene carácter informativo y de concientización en seguridad cibernética. Los indicadores técnicos deben ser validados en el contexto de cada entorno antes de la aplicación de bloqueos u otras acciones de contención.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Barracuda Networks: Phishing pages that exist only inside the victim’s browser (Ashitosh Deshnur, 09/09/2026)",
      url: "https://blog.barracuda.com/2026/09/09/browser-based-phishing-blob-urls-microsoft-redirects",
    },
    {
      label:
        "Cyber Security News: Hackers Use Blob URLs and Microsoft Teams to Create Phishing Pages Inside Victims’ Browsers (Tushar Subhra Dutta, 10/09/2026)",
      url: "https://cybersecuritynews.com/hackers-use-blob-urls/",
    },
  ],
  changelog: [
    "2026-09-11: primera versión, basada en el análisis público de Barracuda Networks y en la cobertura de Cyber Security News.",
  ],
};
