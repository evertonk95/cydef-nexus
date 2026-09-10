import type { BlogPost } from "./posts";

/**
 * Claude Skills para Seguridad de la Información - artigo ES (traducción del canónico PT).
 */
export const claudeSkillsPostEs: BlogPost = {
  "slug": "claude-skills-seguranca-da-informacao",
  "title": "Claude Skills para la Seguridad de la Información: qué son, cómo funcionan y 50 skills que valen la pena",
  "category": "IA Aplicada",
  "excerpt": "Una skill es una carpeta con un SKILL.md que le enseña al agente a ejecutar una tarea a su manera, cargada solo cuando la tarea aparece. Esta guía explica el mecanismo (descubrimiento, carga en tres niveles, riesgos de instalar instrucción de terceros) y organiza 50 skills útiles para quien trabaja con seguridad de la información.",
  "date": "10 de septiembre de 2026",
  "dateISO": "2026-09-10",
  "readTime": "16 min de lectura",
  "image": "/assets/blog/claude-skills-seguranca-da-informacao-thumb.webp",
  "author": "Equipo CyDef",
  "tags": [
    "Claude Skills",
    "Agentes de IA",
    "SKILL.md",
    "AppSec",
    "Blue Team",
    "DevSecOps",
    "Análisis Estático"
  ],
  "toc": true,
  "sections": [
    {
      "blocks": [
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Idea central",
            "body": "Skill no es plugin, no es comando de barra y no es prompt guardado. Es una carpeta con un archivo SKILL.md que le enseña al agente a ejecutar una tarea a su manera, cargada solo cuando la tarea aparece. La ganancia no viene de coleccionar skills: viene de transformar su proceso en instrucción reutilizable."
          }
        },
        {
          "type": "note",
          "text": "Autor: Equipo CyDef. Fecha de verificación de las fuentes: 10 de septiembre de 2026."
        }
      ]
    },
    {
      "heading": "Cómo se armó esta lista",
      "blocks": [
        {
          "type": "p",
          "text": "Esta curaduría está hecha desde la perspectiva de quien trabaja con seguridad de la información: análisis de código, AppSec, SOC y detección, respuesta a incidentes, análisis de malware, cadena de suministro y gestión de vulnerabilidades. El criterio no fue la popularidad, sino la utilidad práctica: cada ítem entra porque resuelve una etapa concreta del trabajo. Las descripciones se escribieron a partir de la documentación de los propios proyectos, leyendo el SKILL.md y el README de cada repositorio, y no a partir de reseñas de terceros. Los 50 enlaces se verificaron el 10 de septiembre de 2026 y todos respondieron HTTP 200 en esa fecha."
        }
      ]
    },
    {
      "heading": "Resumen ejecutivo",
      "blocks": [
        {
          "type": "p",
          "text": "Instalar una skill toma un minuto. Elegir la skill correcta, y entender qué le está entregando al agente cuando la instala, toma más tiempo. El artículo tiene dos partes. La primera explica el mecanismo: qué es una skill, cómo la descubre y la carga el agente, qué cambia respecto de prompt, plugin, comando y MCP, y qué riesgos existen al instalar instrucción de terceros. La segunda es la lista de 50 skills organizadas en ocho categorías por etapa del trabajo de seguridad, con enlace, origen y descripción breve."
        }
      ]
    },
    {
      "heading": "1. El cuello de botella no es el modelo. Es la instrucción",
      "blocks": [
        {
          "type": "p",
          "text": "Quien usa un agente de código o un asistente de IA con frecuencia reconoce el patrón: el resultado mejora mucho cuando la instrucción es buena y empeora mucho cuando la instrucción es vaga. El problema es que la instrucción buena suele existir solo en la cabeza de quien la pidió. Se reescribe en cada sesión, con variación, y el agente vuelve a aprender el mismo contexto desde cero cada vez."
        },
        {
          "type": "p",
          "text": "Existen tres formas comunes de resolver esto, y solo una de ellas escala bien:"
        },
        {
          "type": "list",
          "items": [
            "**Repetir en el prompt.** Funciona, pero usted paga el costo de escribir y revisar cada vez, y cada sesión tiene una versión ligeramente distinta de su proceso.",
            "**Guardar en un documento.** Mejora la consistencia, pero el agente solo lo usa si usted se acuerda de adjuntarlo. El documento no se activa por contexto, se adjunta por decisión humana.",
            "**Empaquetar como skill.** El procedimiento queda en un archivo, con metadatos que indican cuándo debe usarse, y el agente lo carga solo en el momento correcto."
          ]
        },
        {
          "type": "p",
          "text": "Skill es la tercera opción. Resuelve un problema antiguo de ingeniería de prompt: la instrucción deja de ser texto desechable y pasa a ser un artefacto versionable, revisable y reutilizable."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Punto de partida",
            "body": "Si una skill no cambia el comportamiento del agente, es solo decoración. El criterio de éxito no es tener muchas instaladas, es que el agente acierte más la segunda vez de lo que acertó la primera."
          }
        }
      ]
    },
    {
      "heading": "2. Qué es una skill, en la práctica",
      "blocks": [
        {
          "type": "p",
          "text": "Una skill es un directorio con un archivo obligatorio llamado SKILL.md. El nombre del directorio es la identidad de la skill. Dentro del SKILL.md hay dos partes:"
        },
        {
          "type": "list",
          "items": [
            "**Frontmatter YAML**, con metadatos. Los dos campos esenciales son name (el nombre de la skill) y description (qué hace y cuándo debe usarse).",
            "**Cuerpo en Markdown**, con el procedimiento: pasos en orden, criterios de finalización, ejemplos y trampas conocidas."
          ]
        },
        {
          "type": "p",
          "text": "Opcionalmente, la skill puede traer archivos de apoyo, como scripts, referencias largas, plantillas y ejemplos. Esos archivos no necesitan leerse de inmediato: entran en escena solo cuando el propio procedimiento apunta a ellos. Eso es lo que permite que una skill tenga bastante contenido sin inflar el contexto del agente todo el tiempo."
        },
        {
          "type": "p",
          "text": "El esqueleto mínimo es este:"
        },
        {
          "type": "code",
          "text": "---\nname: revisar-alerta-soc\ndescription: Revisa una alerta de SIEM y produce hipótesis, evidencias y próximo paso.\n  Use cuando el usuario pegue una alerta cruda o pida triaje de alerta.\n---\n\n# Revisión de alerta de SOC\n\n1. Extraiga de la alerta: regla, host, usuario, proceso, horario y origen.\n2. Separe lo que es hecho de lo que es inferencia.\n3. Plantee como máximo tres hipótesis, de la más probable a la menos probable.\n4. Para cada hipótesis, liste la evidencia que la sostendría o la derribaría.\n5. Cierre con recomendación, nivel de confianza y próximo paso.\n6. No concluya \"falso positivo\" sin citar la evidencia que sostiene la conclusión."
        },
        {
          "type": "p",
          "text": "Note qué hace funcionar ese ejemplo: la descripción dice qué hace la skill y cuándo usarla, los pasos son imperativos, existe un criterio de finalización y existe una prohibición explícita. Skill no es texto bonito sobre un tema. Es instrucción operativa."
        }
      ]
    },
    {
      "heading": "3. Cómo entra en escena la skill: la carga en tres niveles",
      "blocks": [
        {
          "type": "p",
          "text": "La skill no se carga entera en la conversación. La carga es progresiva, en tres niveles, y eso explica por qué un agente puede tener decenas de skills instaladas sin un costo absurdo de contexto."
        },
        {
          "type": "table",
          "table": {
            "headers": ["Nivel", "Qué carga", "Cuándo"],
            "rows": [
              ["1. Metadatos", "name y description de todas las skills disponibles", "Siempre, al inicio de la sesión"],
              ["2. Cuerpo", "El contenido del SKILL.md", "Cuando la tarea coincide con la descripción"],
              ["3. Apoyo", "Scripts, referencias, plantillas y ejemplos", "Cuando el procedimiento pide ese archivo"]
            ]
          }
        },
        {
          "type": "p",
          "text": "La consecuencia práctica es directa: **la descripción es la parte más importante de la skill**. Es lo que el agente lee antes de decidir, y es lo que define si la skill se va a activar en el momento correcto o nunca. Una descripción genérica como \"ayuda con seguridad\" nunca se activa. Una descripción con disparador, del tipo \"use cuando el usuario pegue una alerta cruda\", se activa sin que usted tenga que pedirla por su nombre."
        },
        {
          "type": "p",
          "text": "Ese diseño también explica la diferencia de costo respecto de otras formas de extensión. Una integración que vuelca 16 mil tokens de herramientas en el contexto es carísima en cada sesión. La misma capacidad empaquetada como skill ocupa unos pocos tokens hasta el momento en que realmente se necesita."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "aviso",
            "title": "Consecuencia práctica",
            "body": "Instalar 40 skills no rompe al agente. Instalar 40 skills con descripciones vagas, sí: el agente empieza a elegir mal y a veces activa un procedimiento que no correspondía."
          }
        }
      ]
    },
    {
      "heading": "4. Skill, comando, plugin, MCP: qué es qué",
      "blocks": [
        {
          "type": "p",
          "text": "El ecosistema usa nombres parecidos para cosas distintas, y eso genera confusión a la hora de elegir. La tabla de abajo separa los conceptos."
        },
        {
          "type": "table",
          "table": {
            "headers": ["Recurso", "Qué es", "Quién lo activa", "Sirve para"],
            "rows": [
              ["Skill", "Carpeta con SKILL.md y archivos de apoyo", "El agente, por contexto", "Procedimiento, conocimiento y patrón de ejecución"],
              ["Prompt guardado", "Texto reutilizable", "La persona", "Frase de partida, no proceso"],
              ["Comando de barra", "Atajo explícito escrito en la interfaz", "La persona", "Iniciar un flujo con nombre"],
              ["Plugin", "Paquete que agrupa skills, comandos, agentes e integraciones", "La persona instala, el agente usa", "Distribución de varias capacidades juntas"],
              ["MCP", "Conexión con herramientas y datos externos", "El agente, vía herramienta", "Acceder a sistema, base de datos y API"],
              ["Subagente", "Sesión separada con contexto propio", "El agente", "Delegar trabajo largo sin contaminar el contexto principal"]
            ]
          }
        },
        {
          "type": "p",
          "text": "La distinción que más importa: **MCP da acceso, skill da método**. Conectar un MCP sin procedimiento es entregar una llave y ningún manual. Una skill sin acceso, por otro lado, sigue siendo útil: un procedimiento de revisión de código, una checklist de hardening o un patrón de escritura funcionan sin tocar ningún sistema."
        }
      ]
    },
    {
      "heading": "5. Lo que separa una skill buena de una carpeta bonita",
      "blocks": [
        {
          "type": "p",
          "text": "Al escribir o revisar una skill, estos criterios son los que más cambian el resultado:"
        },
        {
          "type": "list",
          "items": [
            "**Descripción con disparador y exclusión.** Diga cuándo usarla y cuándo no. La exclusión evita una activación errónea en una tarea parecida.",
            "**Pasos imperativos y corta duración.** \"Ejecute X, luego verifique Y\" envejece bien. \"Considere la posibilidad de tal vez evaluar\" no cambia el comportamiento.",
            "**Criterio de finalización por paso.** Cada paso necesita una condición verificable. Sin eso, el agente considera terminado cuando parece terminado.",
            "**Alcance estrecho.** Una skill que hace todo no se activa para nada. Prefiera varias skills pequeñas a una enciclopedia.",
            "**Sin redundancia.** Una frase que repite el comportamiento predeterminado del modelo es ruido. Si la línea no cambia el comportamiento, borre la línea.",
            "**Referencia larga en un archivo aparte.** El cuerpo del SKILL.md es el procedimiento. Tabla gigante, catálogo de ejemplos y documentación extensa van a archivos de apoyo, cargados solo cuando son necesarios.",
            "**Las acciones peligrosas exigen confirmación.** Comando destructivo, escritura externa y operación en producción necesitan un freno explícito."
          ]
        }
      ]
    },
    {
      "heading": "6. Dónde viven las skills y por qué eso es portátil",
      "blocks": [
        {
          "type": "p",
          "text": "El formato está basado en archivos, lo que significa que instalar es copiar y organizar directorios. En Claude Code, las ubicaciones habituales son la carpeta personal (~/.claude/skills/) y la carpeta del proyecto (.claude/skills/). La diferencia entre ellas es de alcance: la skill personal vale para todos sus proyectos, la skill de proyecto acompaña al repositorio, vale para el equipo y entra en la revisión de código como cualquier otro archivo."
        },
        {
          "type": "p",
          "text": "El punto que suele pasar desapercibido: el formato de skills se publicó como estándar abierto, Agent Skills. Una skill que usa solo name, description e instrucciones en Markdown es portátil entre herramientas que implementen el estándar. Eso reduce el riesgo de apostar por un proveedor específico: el conocimiento que usted escribió sigue siendo utilizable cuando la herramienta cambie."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Consecuencia para los equipos de seguridad",
            "body": "La skill de proyecto es documentación ejecutable del procedimiento operativo. A diferencia de un wiki, el agente la lee y la aplica en el momento de la ejecución, y la revisión ocurre en el mismo pull request que cambia el proceso."
          }
        }
      ]
    },
    {
      "heading": "7. Seguridad: trate la skill de terceros como código de terceros",
      "blocks": [
        {
          "type": "p",
          "text": "Aquí está el punto que merece más atención de la que suele recibir. Una skill no es contenido inerte. Es **instrucción que el agente obedece** y, con frecuencia, **script que el agente ejecuta** con los permisos que tiene. Eso cambia el modelo de riesgo."
        },
        {
          "type": "p",
          "text": "Riesgos concretos al instalar una skill de origen desconocido:"
        },
        {
          "type": "list",
          "items": [
            "**Inyección de instrucción.** El cuerpo del SKILL.md puede contener instrucción que desvía al agente del objetivo del usuario, con o sin mala intención del autor original.",
            "**Ejecución con sus privilegios.** El script de apoyo corre en su entorno, con acceso a archivos, variables de entorno y credenciales que estén disponibles en la sesión.",
            "**Comando destructivo.** git push indebido, reset --hard, limpieza de directorios y alteración de configuración: acciones que no se deshacen con un Ctrl+Z.",
            "**Exfiltración de datos.** Recolección de archivos, historial o fragmentos de código y envío a un endpoint externo.",
            "**Cadena de suministro.** Repositorio abandonado, cambio de dueño, dependencia agregada después de su revisión. La skill que usted revisó hoy no es necesariamente la que va a ejecutarse el mes que viene."
          ]
        },
        {
          "type": "p",
          "text": "Checklist antes de instalar una skill de terceros:"
        },
        {
          "type": "list",
          "items": [
            "¿Existe un SKILL.md claro y legible de principio a fin?",
            "¿La descripción dice cuándo la skill debe activarse y cuándo no?",
            "¿Existen ejemplos concretos de uso?",
            "¿Las acciones peligrosas están condicionadas a una confirmación explícita?",
            "¿El repositorio se actualizó recientemente y tiene un dueño identificable?",
            "¿La skill resuelve un dolor real de su flujo, o es curiosidad?",
            "¿Los scripts de apoyo se leyeron línea por línea?",
            "¿Algún paso pide credencial, token o acceso de red? Si lo pide, ¿a dónde va el dato?",
            "¿El comportamiento se probó en un repositorio aislado antes del repositorio de producción?",
            "¿Existe una revisión obligatoria en cada actualización de la skill?"
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Regla práctica",
            "body": "La skill de terceros entra en la misma política que cualquier dependencia: dueño, versión, alcance, revisión y posibilidad de eliminación. Instalar sin leer es el equivalente a ejecutar un script descargado de internet con su usuario."
          }
        }
      ]
    },
    {
      "heading": "8. Las 50 skills, por etapa del trabajo",
      "blocks": [
        {
          "type": "p",
          "text": "La lista está organizada por etapa del flujo de seguridad, no por popularidad. Cada ítem trae el origen, que ayuda a calibrar el nivel de revisión antes de instalar:"
        },
        {
          "type": "list",
          "items": [
            "**Oficial:** mantenida por Anthropic, en el repositorio oficial de skills.",
            "**Trail of Bits:** paquete de seguridad de Trail of Bits, con skills orientadas a auditoría, análisis de código y prueba de aplicaciones. Muchas de ellas forman parte del material del Application Security Testing Handbook.",
            "**Comunidad:** proyectos independientes, con buena adopción, pero que exigen leer el SKILL.md antes de usarlos en un entorno de producción."
          ]
        },
        {
          "type": "p",
          "text": "No toda skill está orientada a pruebas ofensivas. Buena parte del trabajo de seguridad es leer código, escribir informes, organizar evidencia y comunicar riesgo: por eso la lista incluye documento, hoja de cálculo y presentación."
        }
      ]
    },
    {
      "heading": "8.1 Entender el objetivo antes de buscar el bug (4)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**audit-context-building** (Trail of Bits): lee el código función por función y graba en un archivo lo que cada una asume y de qué depende, antes de empezar a cazar el bug, sin llenar el contexto de la conversación. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/audit-context-building/skills/audit-context-building)",
            "**trailmark** (Trail of Bits): construye un grafo de código y de binario para mapear superficie de ataque, radio de impacto, propagación de taint, puntos de entrada y diferencias estructurales; genera diagramas Mermaid y paquetes de contexto para delegar el análisis a modelos más pequeños. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/trailmark/skills/trailmark)",
            "**entry-point-analyzer** (Trail of Bits): identifica funciones llamables externamente que alteran estado y las clasifica por nivel de acceso, generando un informe estructurado de auditoría. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/entry-point-analyzer/skills/entry-point-analyzer)",
            "**building-secure-contracts** (Trail of Bits): kit de seguridad para contratos inteligentes, con escáneres de vulnerabilidades para seis blockchains y asistentes de guía de desarrollo. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts/skills/secure-workflow-guide)"
          ]
        }
      ]
    },
    {
      "heading": "8.2 Análisis estático y detección en el código (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**codeql** (Trail of Bits): análisis de flujo de datos y de taint entre funciones, con soporte para Python, JavaScript y TypeScript, Go, Java y Kotlin, C y C++, C#, Ruby y Swift. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/codeql)",
            "**semgrep** (Trail of Bits): escaneo por patrones con rulesets seleccionados y aprobación explícita antes de ejecutar, salida consolidada en SARIF y uso de Semgrep Pro para taint entre archivos cuando está disponible. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/semgrep)",
            "**sarif-parsing** (Trail of Bits): lee, agrega, deduplica y filtra SARIF de CodeQL, Semgrep y otros escáneres, con integración a un pipeline de CI/CD. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/sarif-parsing)",
            "**semgrep-rule-creator** (Trail of Bits): crea reglas Semgrep propias para patrones de bug y vulnerabilidad, con prueba y validación de la regla antes de usarla. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/semgrep-rule-creator/skills/semgrep-rule-creator)",
            "**semgrep-rule-variant-creator** (Trail of Bits): genera variantes de una regla existente para otros lenguajes, con análisis de aplicabilidad y validación guiada por pruebas. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/semgrep-rule-variant-creator/skills/semgrep-rule-variant-creator)",
            "**variant-analysis** (Trail of Bits): a partir de un hallazgo conocido, busca vulnerabilidades y bugs del mismo patrón en otras partes del código. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/variant-analysis/skills/variant-analysis)"
          ]
        }
      ]
    },
    {
      "heading": "8.3 Revisión de código y triaje de hallazgos (8)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**differential-review** (Trail of Bits): revisión de seguridad enfocada en lo que cambió, con análisis de historial vía git blame, radio de impacto por conteo de llamadores, verificación de cobertura de pruebas en el código modificado e informe en markdown. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/differential-review/skills/differential-review)",
            "**fp-check** (Trail of Bits): verifica si un hallazgo es real o un falso positivo, con evidencia documentada y veredicto explícito para cada ítem. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/fp-check/skills/fp-check)",
            "**vulnerability-triage-brocards** (Trail of Bits): triaje de un reporte de vulnerabilidad, CVE o envío de bug bounty con siete reglas de bolsillo, decidiendo aceptar, descartar o pedir más información antes de escalar a un análisis profundo. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/vulnerability-triage-brocards/skills/vulnerability-triage-brocards)",
            "**sharp-edges** (Trail of Bits): identifica API propensa a errores, configuración peligrosa y diseño que induce a una falla de seguridad, evaluando si el camino fácil lleva al uso inseguro. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/sharp-edges/skills/sharp-edges)",
            "**spec-to-code-compliance** (Trail of Bits): verifica si el código cumple la documentación que lo especifica, con un agente por requisito, divergencia refutada antes de ser reportada y evidencia citada línea por línea. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/spec-to-code-compliance/skills/spec-to-code-compliance)",
            "**c-review** (Trail of Bits): revisión de seguridad de código C y C++, con cobertura verificada contra un parse del código fuente. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/c-review/skills/c-review)",
            "**rust-review** (Trail of Bits): revisión de seguridad de Rust con agentes especializados en la frontera safe/unsafe, memoria en bloque unsafe, concurrencia, denegación de servicio por panic, desbordamiento de pila por recursión, FFI y riesgos de runtime asíncrono. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/rust-review/skills/rust-review)",
            "**second-opinion** (Trail of Bits): ejecuta una revisión por CLI de un LLM externo sobre cambios no confirmados, diffs de rama o commits específicos, útil como segunda opinión en un hallazgo controvertido. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/second-opinion/skills/second-opinion)"
          ]
        }
      ]
    },
    {
      "heading": "8.4 Pruebas, fuzzing y análisis de bajo nivel (9)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**testing-handbook-skills** (Trail of Bits): conjunto de skills derivado del Application Security Testing Handbook, con libFuzzer, AFL++, Atheris, cargo-fuzz, libafl, OSS-Fuzz, Wycheproof, AddressSanitizer, análisis de cobertura y escritura de harness de fuzzing. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/testing-handbook-skills)",
            "**property-based-testing** (Trail of Bits): escribe, revisa y depura pruebas basadas en propiedades con Hypothesis, fast-check, proptest, jqwik, Echidna y Medusa, cubriendo el dominio de entrada en lugar de ejemplos elegidos a mano. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/property-based-testing/skills/property-based-testing)",
            "**mutation-testing** (Trail of Bits): configura campañas de pruebas de mutación con mewt para lenguajes generales y muton para contratos TON, definiendo alcance, timeout y optimización de ejecución prolongada. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/mutation-testing/skills/mutation-testing)",
            "**webapp-testing** (oficial): interactúa con una aplicación web local usando Playwright, verifica funcionalidad, depura comportamiento de interfaz, captura pantalla y lee el log del navegador. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)",
            "**playwright-skill** (comunidad): exploración y prueba de aplicaciones con Playwright en un formato más liviano que las integraciones MCP grandes. [github.com/lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)",
            "**firebase-apk-scanner** (Trail of Bits): escanea un APK Android en busca de configuración insegura de Firebase, incluida base de datos abierta, bucket de almacenamiento, falla de autenticación y función en la nube expuesta. Para investigación autorizada. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/firebase-apk-scanner/skills/firebase-apk-scanner)",
            "**burpsuite-project-parser** (Trail of Bits): busca y extrae datos de un archivo de proyecto de Burp Suite para análisis de seguridad. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/burpsuite-project-parser/skills/burpsuite-project-parser)",
            "**constant-time-analysis** (Trail of Bits): detecta canal lateral de tiempo inducido por el compilador en código criptográfico. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/constant-time-analysis/skills/constant-time-analysis)",
            "**zeroize-audit** (Trail of Bits): detecta la ausencia de borrado de datos sensibles o un borrado eliminado por la optimización del compilador, con análisis de assembly y de flujo de control. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/zeroize-audit/skills/zeroize-audit)"
          ]
        }
      ]
    },
    {
      "heading": "8.5 Detección, amenaza y respuesta (4)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**yara-rule-authoring** (Trail of Bits): autoría de reglas YARA-X con lint y análisis de calidad, cubriendo convención de nombres, selección de cadenas, optimización de rendimiento, migración de YARA heredado y reducción de falsos positivos. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/yara-authoring/skills/yara-rule-authoring)",
            "**last30days** (comunidad): investiga discusiones recientes en X, Reddit, Hacker News, YouTube y la web, útil para seguir explotación activa, debate de técnicas y rumores aún no documentados. [github.com/mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days)",
            "**firecrawl-agent** (comunidad): raspado, investigación y automatización de navegador para la recolección estructurada de fuentes abiertas. [github.com/firecrawl/cli](https://github.com/firecrawl/cli/tree/main/skills/firecrawl-agent)",
            "**printing-press** (comunidad): transforma un sitio o una API en una interfaz y CLI más fáciles de operar para el agente, un camino corto para armar una herramienta interna de consulta. [github.com/mvanhorn/cli-printing-press](https://github.com/mvanhorn/cli-printing-press/tree/main/skills/printing-press)"
          ]
        }
      ]
    },
    {
      "heading": "8.6 Cadena de suministro y postura del repositorio (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**supply-chain-risk-auditor** (Trail of Bits): audita dependencias npm, PyPI y Go con avisos emparejados por versión en el árbol completo del lockfile, upstream abandonado, concentración de publisher y ejecución de scripts en la instalación. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor)",
            "**agentic-actions-auditor** (Trail of Bits): audita workflows de GitHub Actions en busca de vulnerabilidades en la integración con agentes de IA, incluidos Claude Code Action, Gemini CLI, OpenAI Codex y GitHub AI Inference. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/agentic-actions-auditor/skills/agentic-actions-auditor)",
            "**open-sourcing** (Trail of Bits): prepara un repositorio para su publicación, con higiene de secretos en el historial, elección de licencia, verificación de documentación y CI, y orientación de empaquetado y release. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/open-sourcing/skills/open-sourcing)",
            "**gh-cli** (Trail of Bits): intercepta búsquedas por URL de GitHub y comandos curl y wget, redirigiendo al gh CLI autenticado. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/gh-cli/skills/gh-cli)",
            "**github-triage** (Trail of Bits): hace triaje de issues y pull requests abiertos vía gh CLI, con merge opcional de un PR listo, cierre de un issue ya resuelto con explicación y vínculo con el PR de corrección pendiente. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/github-triage/skills/github-triage)",
            "**git-guardrails** (comunidad): evita acciones peligrosas en Git, como push indebido, reset --hard, clean y eliminación de ramas. [github.com/mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/misc/git-guardrails-claude-code)"
          ]
        }
      ]
    },
    {
      "heading": "8.7 Documento, informe y comunicación (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**pdf** (oficial): lee y extrae texto y tablas, une, divide, gira páginas, agrega marca de agua, rellena formularios, cifra y hace OCR en PDF escaneado. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pdf)",
            "**docx** (oficial): crea, edita y analiza documentos Word, útil para informes de assessment y planes de acción. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/docx)",
            "**xlsx** (oficial): abre, lee, edita y corrige hojas de cálculo, con fórmulas, formato y gráficos, incluida la limpieza de datos tabulares malformados. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/xlsx)",
            "**pptx** (oficial): crea y edita presentaciones, útil para comité de seguridad y briefing de liderazgo. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pptx)",
            "**doc-coauthoring** (oficial): coautoría, revisión y edición colaborativa de documentos, con foco en la consistencia entre versiones. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)",
            "**internal-comms** (oficial): escribe avisos internos, actualizaciones de estado y comunicados de equipo, aplicable a comunicados de incidentes y avisos de mantenimiento. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/internal-comms)"
          ]
        }
      ]
    },
    {
      "heading": "8.8 Base de trabajo del profesional de seguridad (7)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**skill-creator** (oficial): crea skills propias con estructura e instrucción reutilizable. Es el camino para transformar el procedimiento de su equipo en ejecución automática. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator)",
            "**find-skills** (comunidad): encuentra una skill relevante para una tarea específica antes de salir instalando por cuenta propia. [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)",
            "**superpowers** (comunidad): transforma al agente en un flujo de ingeniería completo, con brainstorm, especificación, plan, TDD, subagentes, revisión y depuración. [github.com/obra/superpowers](https://github.com/obra/superpowers)",
            "**planning-with-files** (comunidad): crea planes persistentes en archivo para tareas largas, evitando la pérdida de contexto entre sesiones. [github.com/OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)",
            "**karpathy-guidelines** (comunidad): fuerza simplicidad, cambio quirúrgico, verificación y razonamiento antes de salir a programar. [github.com/multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills/tree/main/skills/karpathy-guidelines)",
            "**mcp-builder** (oficial): crea un servidor MCP para conectar al agente con herramientas internas, como SIEM, cola de tickets, inventario o base de conocimiento. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)",
            "**claude-api** (oficial): apoyo para integrar la API en un producto y en la automatización interna, incluido el tratamiento de errores y costo. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/claude-api)"
          ]
        }
      ]
    },
    {
      "heading": "9. Cómo elegir sin volverse un acumulador digital",
      "blocks": [
        {
          "type": "p",
          "text": "El error más común no es instalar la skill equivocada. Es instalar treinta de una vez, no notar cuál de ellas cambió el resultado y seguir cargando peso muerto."
        },
        {
          "type": "list",
          "items": [
            "**Elija por el dolor, no por la curiosidad.** Liste lo que usted repite cada semana: triaje de hallazgos, revisión de diff, escritura de informes, verificación de dependencias. Empiece por las skills que atacan eso.",
            "**Instale de tres a cinco, no cincuenta.** Cada skill nueva cambia el comportamiento del agente. Un cambio en bloque es un cambio que usted no puede atribuir.",
            "**Mida la diferencia.** Antes y después, en la misma tarea. Si el resultado no cambió, la skill no está funcionando, y el problema suele estar en la descripción.",
            "**Elimine sin drama.** Una skill que no se activó en un mes es candidata a salir. Un contexto limpio es parte del desempeño.",
            "**Escriba las suyas.** Las 50 de esta lista resuelven dolores comunes del área. La skill que más cambia su resultado es la que describe su proceso: su checklist de triaje, su formato de informe, su criterio de severidad, su regla de detección.",
            "**Versione lo que es del equipo.** La skill de proyecto vive en el repositorio y pasa por revisión. Es la forma más barata de transformar un estándar interno en ejecución automática."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "El punto que cierra el artículo",
            "body": "El mejor uso de las skills no es coleccionar. Es transformar su manera de trabajar en instrucción reutilizable, revisable y portátil."
          }
        }
      ]
    },
    {
      "heading": "10. Conclusión",
      "blocks": [
        {
          "type": "p",
          "text": "Skill es una tecnología simple: una carpeta, un archivo, metadatos y un procedimiento. Lo que cambia no es la capacidad del modelo, es la repetibilidad del resultado. En lugar de volver a explicar el contexto en cada sesión, el proceso queda escrito, versionado, activado por contexto y auditable."
        },
        {
          "type": "p",
          "text": "Para quien trabaja con seguridad, la lectura tiene dos capas. La primera es de productividad: triaje de hallazgos, revisión de diff, búsqueda de variantes, verificación de dependencias, informe de assessment y patrón de escritura dejan de ser conocimiento tácito. La segunda es de riesgo: la skill de terceros es código de terceros, con el privilegio del agente y ejecución en su entorno. Quien instala sin leer está ampliando la superficie de ataque con un clic."
        },
        {
          "type": "p",
          "text": "Empiece pequeño, elija por el dolor, mida el efecto y escriba la skill que describe su proceso. Esa es la ganancia que se acumula."
        }
      ]
    }
  ],
  "sources": [
    { "label": "Anthropic: documentación oficial de Agent Skills", "url": "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" },
    { "label": "Anthropic: repositorio oficial de skills", "url": "https://github.com/anthropics/skills" },
    { "label": "Trail of Bits: paquete de skills de seguridad", "url": "https://github.com/trailofbits/skills" },
    { "label": "Trail of Bits: Application Security Testing Handbook", "url": "https://appsec.guide" },
    { "label": "Vercel Labs: repositorio de skills", "url": "https://github.com/vercel-labs/skills" }
  ]
};
