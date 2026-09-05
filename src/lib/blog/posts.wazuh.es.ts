import type { BlogPost } from "./posts";

/**
 * Wazuh en Movimiento - articulo ES (traduccion del canonico PT, v1, 04/09/2026).
 * Paridad estructural completa con posts.wazuh.ts. Codigo sin traducir.
 */
export const wazuhEmMovimentoPostEs: BlogPost = {
  "slug": "wazuh-em-movimento",
  "title": "Wazuh en Movimiento: cómo evaluar, estabilizar y madurar un SIEM que ya está en producción",
  "category": "SOC Engineering",
  "excerpt": "Un framework práctico para quienes heredan un Wazuh ya en producción: medir el recorrido del evento entre la fuente y el analista, probar drops y brechas de cobertura y evolucionar el SIEM sin convertir la producción en un laboratorio.",
  "date": "4 de septiembre de 2026",
  "dateISO": "2026-09-04",
  "readTime": "31 min de lectura",
  "image": "/assets/blog/wazuh-em-movimento-thumb.webp",
  "author": "Everton Nascimento",
  "authorRole": "Cybersecurity | SOC | Incident Response | Detection Engineering | Wazuh",
  "tags": [
    "Wazuh",
    "SIEM",
    "SOC",
    "Detection Engineering",
    "Blue Team",
    "Security Operations"
  ],
  "toc": true,
  "cta": {
    "title": "Este artículo forma parte de un framework más amplio",
    "body": "El CyDef SIEM Health and Maturity Assessment Framework reúne las 14 fases, tablas, comandos, estudio de caso anonimizado, playbook de recolección rápida y checklist final en un documento versionado y abierto.",
    "label": "Conocer el framework",
    "to": "/labs/siem-health-maturity-framework"
  },
  "sections": [
    {
      "heading": "Nota de publicación y anonimización",
      "blocks": [
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Idea central",
            "body": "Un Wazuh puede estar \"verde\" en el dashboard, con servicios activos y agentes conectados, y aun así perder eventos, concentrar la carga en un único nodo, indexar demasiado ruido, operar con un inventario obsoleto y ofrecer menos cobertura de detección de lo que parece. La evaluación sirve para probar lo que ocurre entre la fuente y el analista, antes de empezar a tocar nada."
          }
        },
        {
          "type": "p",
          "text": "Este material nació de un escenario recurrente en las operaciones de seguridad: asumir la responsabilidad de un Wazuh que ya existe, ya recibe datos y ya sostiene una operación real. Los ejemplos prácticos se derivaron de una evaluación técnica real, pero fueron deliberadamente anonimizados. Ningún nombre de empresa, dirección IP real, hostname, dominio, secreto, token o información que permita identificar el entorno se reproduce en este documento. Los números se presentan de forma agregada o redondeada cuando el objetivo es demostrar el razonamiento. El foco no es exponer un entorno específico: es mostrar una metodología que puede reaplicarse en cualquier organización que necesite entender si el SIEM solo está funcionando o si realmente está brindando seguridad."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Regla de oro",
            "body": "este artículo no es una guía de cambio a ciegas. Es una guía de investigación. En producción, primero se mide. Después se explica. Solo entonces se cambia, con rollback y criterio de validación."
          }
        }
      ]
    },
    {
      "heading": "Resumen ejecutivo",
      "blocks": [
        {
          "type": "p",
          "text": "La mayor parte del contenido sobre Wazuh enseña a instalar, integrar y crear reglas. Eso es necesario, pero existe un problema menos discutido: qué hacer cuando se hereda un entorno que ya está en producción y no se sabe exactamente cómo se construyó, qué decisiones se tomaron, qué se está perdiendo y qué controles funcionan de verdad."
        },
        {
          "type": "p",
          "text": "En ese contexto, la primera tarea no debería ser crear más reglas, agrandar colas o agregar CPU. La primera tarea debería ser **convertir el entorno en algo observable**. Eso significa reconstruir la arquitectura, medir el recorrido de los eventos, comparar la carga entre nodos, identificar drops, revisar buffers, entender las fuentes de log, evaluar el Indexer, mapear reglas y decoders, medir la cobertura de detección, revisar la seguridad del propio SIEM y convertir todo en un plan de acción priorizado."
        },
        {
          "type": "p",
          "text": "El framework propuesto divide esta actividad en fases. Cada fase tiene objetivo, preguntas, evidencias, comandos, criterios de decisión y entregables. El resultado final no es una colección de capturas: es un **AS IS técnico**, un **análisis de gaps**, una **visión de madurez**, un diseño **TO BE** y un **roadmap** que permita evolucionar el Wazuh sin convertir la producción en un laboratorio."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig1.svg",
            "alt": "El recorrido que debe probarse durante la evaluación, desde la fuente de log hasta el analista.",
            "caption": "El recorrido que debe probarse durante la evaluación, desde la fuente de log hasta el analista."
          }
        }
      ]
    },
    {
      "heading": "1. El problema que casi nadie discute: subirse al auto en movimiento",
      "blocks": [
        {
          "type": "p",
          "text": "Instalar Wazuh desde cero es un problema de proyecto. Heredar un Wazuh en producción es un problema de investigación. En el primer caso, uno elige arquitectura, grupos, retención, fuentes, casos de uso y criterios de capacidad. En el segundo, todas esas elecciones ya las hizo alguien, en algún momento, con premisas que pueden no existir más."
        },
        {
          "type": "p",
          "text": "El entorno puede haberse implantado por etapas. Puede haber recibido integraciones de emergencia. Puede haberse ajustado después de incidentes. Puede tener configuraciones legadas, reglas abandonadas, agentes que ya no existen, puertos abiertos para tecnologías discontinuadas, colas agrandadas sin análisis de causa y un cluster que existe en el diagrama, pero que no distribuye carga de verdad."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "El punto más importante",
            "body": "cuando uno asume un SIEM en movimiento, el primer objetivo no es \"mejorar el Wazuh\". Es descubrir qué Wazuh se tiene realmente."
          }
        },
        {
          "type": "p",
          "text": "Por eso la evaluación debe ocurrir antes del tuning. El tuning modifica síntomas. La evaluación explica el sistema."
        }
      ]
    },
    {
      "heading": "2. Los principios que evitan diagnósticos incorrectos",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Principio",
              "Aplicación práctica"
            ],
            "rows": [
              [
                "Observe antes de modificar",
                "La primera recolección debe ser una fotografía del estado actual. Los cambios prematuros contaminan la evidencia y dificultan probar la causa."
              ],
              [
                "Separe el incidente de la madurez",
                "Un incidente puede revelar un cuello de botella, pero no debe limitar la evaluación. La causa del incidente y las deudas estructurales deben registrarse por separado."
              ],
              [
                "Siga el evento de punta a punta",
                "Cuando un evento \"no aparece\", descubra en qué capa dejó de existir. Agent, red, remoted, analysisd, archivo de alertas, Filebeat, Indexer y Dashboard son problemas distintos."
              ],
              [
                "Un contador acumulado no es una fotografía",
                "Un queue usage igual a cero ahora no invalida un contador histórico de drops. Los picos transitorios desaparecen rápido. Combine el estado actual, los contadores y las series temporales."
              ],
              [
                "Cluster no significa distribución",
                "Dos Managers conectados pueden representar un cluster sano desde el punto de vista de la sincronización y, al mismo tiempo, el 99% de la carga puede estar en un único nodo."
              ],
              [
                "Una cola más grande no es capacity planning",
                "Agrandar el buffer puede absorber un burst, pero no resuelve la generación sostenida por encima de la capacidad de procesamiento. En algunos casos, solo retrasa la pérdida."
              ],
              [
                "Log no es sinónimo de valor",
                "Recolectar todo puede ser útil para forense, pero hacer que toda la telemetría compita en el mismo pipeline de detección puede reducir la capacidad de identificar lo que realmente importa."
              ],
              [
                "Todo cambio necesita una hipótesis y un criterio de éxito",
                "Si no existe una métrica que pruebe que el cambio funcionó, no está concluido."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "3. El framework de evaluación",
      "blocks": [
        {
          "type": "p",
          "text": "La secuencia siguiente fue diseñada para reducir el riesgo de conclusiones precipitadas. Empieza por la infraestructura, atraviesa el pipeline de datos, llega a la calidad de detección y termina en gobernanza y evolución continua."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig2.svg",
            "alt": "Visión general de las fases del framework.",
            "caption": "Visión general de las fases del framework."
          }
        }
      ]
    },
    {
      "heading": "Fase 0: Preparación, alcance y preservación de la evidencia",
      "blocks": [
        {
          "type": "p",
          "text": "Antes del primer comando, defina qué debe responder la evaluación. Una investigación sin preguntas claras tiende a producir cientos de evidencias sin conclusión."
        },
        {
          "type": "p",
          "text": "**Objetivos**"
        },
        {
          "type": "list",
          "items": [
            "Identificar el alcance: Managers, Workers, Indexers, Dashboard, collectors, agentes, integraciones y servicios dependientes.",
            "Definir la ventana de observación y el período de retención disponible.",
            "Registrar el incidente o el motivador sin convertir el incidente en el único objetivo del trabajo.",
            "Congelar los cambios no urgentes durante la recolección inicial, siempre que sea operativamente posible.",
            "Definir responsables de Wazuh, red, firewall, Linux, Windows, base de datos, cloud y aplicaciones para las validaciones posteriores."
          ]
        },
        {
          "type": "p",
          "text": "**Qué no recolectar**"
        },
        {
          "type": "p",
          "text": "Evite poner secretos dentro de la evaluación. No copie `client.keys`, private keys, contraseñas, tokens, webhooks completos ni certificados privados. Si aparece un secreto en un archivo de configuración, registre el hallazgo y enmascare el valor."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Buena práctica",
            "body": "cree un directorio o repositorio de evidencias con fecha, host, comando, responsable y hash del archivo cuando el contexto exija trazabilidad. Una evaluación sin organización se convierte en retrabajo."
          }
        }
      ]
    },
    {
      "heading": "Fase 1: Inventario técnico y arquitectura real",
      "blocks": [
        {
          "type": "p",
          "text": "El primer producto de la evaluación es el AS IS. No confíe solo en un diseño existente: pruebe la función de cada nodo, versión, capacidad, interfaz, servicio y dependencia."
        },
        {
          "type": "p",
          "text": "**Preguntas que deben responderse**"
        },
        {
          "type": "list",
          "items": [
            "¿Cuántos servidores componen la solución y qué función cumple cada uno?",
            "¿Qué versiones de Wazuh, Filebeat, Indexer, Dashboard, Java y sistema operativo están instaladas?",
            "¿CPU, RAM, disco e inodes son suficientes para el comportamiento actual?",
            "¿Los relojes están sincronizados? ¿Existe diferencia de timezone o clock skew entre las fuentes y el SIEM?",
            "¿Existe mantenimiento pendiente, reboot required, patch debt o un uptime excesivamente largo?",
            "¿Qué puertos están abiertos y en qué interfaces escuchan los servicios?"
          ]
        },
        {
          "type": "p",
          "text": "**Recolección base**"
        },
        {
          "type": "code",
          "text": "hostnamectl / ip -br a / timedatectl / uptime / nproc / free -h / df -hT / df -i / lsblk\nsystemctl --failed / /var/ossec/bin/wazuh-control info"
        },
        {
          "type": "p",
          "text": "En los Indexers, complemente con la versión del paquete, JVM, swap, límites de memoria y uso de storage. En entornos heredados, los problemas aparentemente \"de Wazuh\" pueden ser presión de memoria, swap, disco o reloj."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Ejemplo anonimizado",
            "body": "en una evaluación real, los servicios aparecían activos y el entorno parecía estable. La recolección básica reveló relojes sin sincronización efectiva, unos 40 segundos de diferencia entre una fuente crítica y el Manager, más de un año de uptime en componentes centrales, Indexers con aproximadamente el 70% del disco ocupado y un uso relevante de swap. Nada de eso aparecía como \"incidente Wazuh\" en el dashboard."
          }
        }
      ]
    },
    {
      "heading": "Fase 2: Cluster de Managers y distribución de carga",
      "blocks": [
        {
          "type": "p",
          "text": "Un cluster Wazuh debe evaluarse en dos dimensiones: **sincronización** y **utilización**. La primera muestra si los nodos comparten estado. La segunda muestra si la capacidad horizontal realmente se está usando."
        },
        {
          "type": "p",
          "text": "**Recolecciones esenciales**"
        },
        {
          "type": "code",
          "text": "sudo /var/ossec/bin/wazuh-control status\nsudo /var/ossec/bin/cluster_control -l\nsudo /var/ossec/bin/cluster_control -i more\nsudo /var/ossec/bin/cluster_control -a"
        },
        {
          "type": "p",
          "text": "La documentación de Wazuh recomienda distribuir las conexiones de los agentes entre los nodos y presenta el load balancer como enfoque preferente para entornos en cluster [1][2]."
        },
        {
          "type": "p",
          "text": "**Qué medir**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Métrica",
              "Por qué importa"
            ],
            "rows": [
              [
                "Agentes activos por nodo",
                "Muestra si la capacidad está distribuida o si un Manager se convirtió en un punto de concentración."
              ],
              [
                "Sesiones TCP por nodo",
                "Ayuda a confirmar la distribución observada en cluster_control."
              ],
              [
                "Eventos por nodo",
                "Compara la carga real, no solo la cantidad de agentes."
              ],
              [
                "Sincronización de grupos, rules y decoders",
                "Evita que un Worker procese con una configuración distinta."
              ],
              [
                "Fallos en cluster.log",
                "Revela problemas transitorios de integridad o conectividad."
              ]
            ]
          }
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Ejemplo anonimizado",
            "body": "el cluster tenía un Master y un Worker aparentemente sanos. Sin embargo, 97 agentes activos estaban en el Master y solo 1 en el Worker. El mismo desequilibrio aparecía en las sesiones TCP. La lección es simple: tener cluster no significa tener distribución."
          }
        },
        {
          "type": "p",
          "text": "**Conclusión que debe producir la evaluación:** clasifique el cluster como *sincronizado o no sincronizado* y, por separado, como *balanceado o desbalanceado*. No mezcle los dos conceptos."
        }
      ]
    },
    {
      "heading": "Fase 3: Pipeline de ingesta, colas y drops",
      "blocks": [
        {
          "type": "p",
          "text": "Esta fase responde la pregunta más importante de un SIEM: **¿lo que llega al entorno se procesa íntegramente?** La respuesta debe basarse en contadores, no en sensaciones."
        },
        {
          "type": "p",
          "text": "**Empiece por el remoted y el analysisd**"
        },
        {
          "type": "code",
          "text": "sudo cat /var/ossec/var/run/wazuh-remoted.state\nsudo cat /var/ossec/var/run/wazuh-analysisd.state"
        },
        {
          "type": "p",
          "text": "El archivo `wazuh-analysisd.state` se actualiza periódicamente y expone los eventos recibidos, procesados y descartados, además de la utilización y el tamaño de las colas internas [6]. Wazuh también ofrece estadísticas detalladas por tipo de evento vía API. Si la cola seleccionada en el analysisd está llena, el evento se descarta [7][8]."
        },
        {
          "type": "p",
          "text": "**Por qué separar el remoted del analysisd**"
        },
        {
          "type": "p",
          "text": "El remoted recibe eventos de los agentes en conexiones seguras. El analysisd, en cambio, procesa distintas categorías de eventos. Un contador de `discarded_count` igual a cero en el remoted no prueba que el pipeline esté íntegro: el drop puede ocurrir después."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Ejemplo anonimizado",
            "body": "en un entorno real, el remoted presentaba cero descartes, mientras que el analysisd acumulaba más de 211 mil eventos descartados. El desglose mostró que más de 209 mil eran Syslog, y Syslog representaba aproximadamente tres cuartos de la carga recibida por el motor de análisis. Los contadores correspondían a menos de dos días de uptime del daemon, no al largo uptime del servidor. El problema dejó de ser \"el Wazuh está perdiendo eventos\" y pasó a ser \"el analysisd está descartando Syslog\". Ese cambio de precisión transforma el plan de acción."
          }
        },
        {
          "type": "p",
          "text": "**No confunda el estado actual con el histórico**"
        },
        {
          "type": "p",
          "text": "Es común encontrar `event_queue_usage` igual a 0% al mismo tiempo que `events_dropped` es mayor que cero. Eso ocurre cuando la saturación fue transitoria. Para capturar el comportamiento, monitoree el archivo de estado en intervalos cortos durante los períodos de carga."
        },
        {
          "type": "code",
          "text": "while true; do\n  echo \"===== $(date -Is) =====\"\n  grep -E \"events_received|events_dropped|event_queue_usage|rule_matching_queue_usage\" \\\n    /var/ossec/var/run/wazuh-analysisd.state\n  sleep 5\ndone | tee /tmp/analysisd_watch.log"
        },
        {
          "type": "p",
          "text": "**Use el desglose para localizar el tipo de evento**"
        },
        {
          "type": "p",
          "text": "Ajustar todas las queues al mismo tiempo es una mala respuesta. La propia documentación recomienda observar qué categorías presentan drop y ajustar solo lo que necesita ajustarse [8]. La investigación debe responder: ¿Syslog? ¿EventChannel? ¿Logcollector? ¿Syscheck? ¿Syscollector? ¿Rule matching? La respuesta define el siguiente paso."
        },
        {
          "type": "p",
          "text": "Si las colas internas siguen en el valor predeterminado de 16.384 y existe un drop comprobado, eso se convierte en evidencia para un capacity analysis. El valor predeterminado, por sí solo, no es un problema. El problema es mantener el predeterminado ante un comportamiento que ya demostró superar la capacidad momentánea."
        }
      ]
    },
    {
      "heading": "3.1: Cuando el problema es Syslog",
      "blocks": [
        {
          "type": "p",
          "text": "El Syslog remoto merece un recorrido propio, porque la cola remota de eventos de agentes no se aplica al Syslog. En Wazuh, el `queue_size` del bloque `remote` en conexión `secure` está relacionado con los eventos de agentes, no con los eventos Syslog [9]."
        },
        {
          "type": "code",
          "text": "sudo grep -n -A15 -B3 '<remote>' /var/ossec/etc/ossec.conf\nsudo ss -lunp | grep -E ':<PORTA1>|:<PORTA2>|:<PORTA3>'"
        },
        {
          "type": "p",
          "text": "Mapee protocolo, puerto, allowed-ips, interfaz de escucha y redundancia. El Syslog por UDP debe tratarse con atención porque la pérdida puede ocurrir antes de que el evento llegue a la aplicación y, por lo tanto, no aparece en el contador de drops del analysisd."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Ejemplo anonimizado",
            "body": "en una ventana de 60 segundos, prácticamente todo el Syslog observado pertenecía a firewalls, con algo cercano a 1.000 datagramas por segundo. Dos fuentes respondían por cerca del 95% del volumen. El Worker recibía cero Syslog: todo el flujo estaba concentrado en el Master vía UDP."
          }
        }
      ]
    },
    {
      "heading": "3.2: Descubra el contenido antes de reducir el volumen",
      "blocks": [
        {
          "type": "p",
          "text": "Un volumen alto no es sinónimo de ruido. En un análisis de firewalls, el perfil de las tres fuentes principales mostró aproximadamente 72% a 81% de TRAFFIC y 17% a 26% de THREAT. Eso cambia por completo la decisión: filtrar indiscriminadamente podría eliminar telemetría importante."
        },
        {
          "type": "p",
          "text": "El objetivo es clasificar qué debe analizarse en tiempo real, qué debe retenerse para la investigación y qué representa telemetría operacional repetitiva. THREAT, SYSTEM, USERID, autenticación, cambios administrativos y eventos de seguridad normalmente exigen prioridad. El TRAFFIC permitido puede tener alto valor forense, pero debe dimensionarse y tratarse de forma consciente."
        }
      ]
    },
    {
      "heading": "3.3: Use archives para descubrir top talkers",
      "blocks": [
        {
          "type": "p",
          "text": "Cuando los archives están habilitados, permiten analizar todos los eventos recibidos, incluidos los que no generaron alertas [10]. Eso es sumamente útil para descubrir orígenes, locations, aplicaciones y patrones de volumen."
        },
        {
          "type": "code",
          "text": "sudo tail -n 500000 /var/ossec/logs/archives/archives.json | \\\n  jq -r '.location // \"sem_location\"' | sort | uniq -c | sort -nr | head -50"
        },
        {
          "type": "p",
          "text": "Atención al costo: los archives pueden consumir storage de forma significativa y deben formar parte del capacity planning y de la política de retención [10]."
        }
      ]
    },
    {
      "heading": "Fase 4: Agents, client_buffer, grupos y lifecycle",
      "blocks": [
        {
          "type": "p",
          "text": "La Fase 3 observa lo que ocurre en el Manager. La Fase 4 observa lo que puede estar perdiéndose antes de que el evento llegue al Manager. Aquí entran en juego client_buffer, antiflooding, grupos, sincronización e higiene del inventario."
        }
      ]
    },
    {
      "heading": "4.1: Inventaríe grupos y configuración centralizada",
      "blocks": [
        {
          "type": "code",
          "text": "sudo /var/ossec/bin/agent_groups -l\nsudo find /var/ossec/etc/shared -maxdepth 2 -type f -name 'agent.conf' -print\nsudo grep -Rni -A8 -B3 '<client_buffer>' /var/ossec/etc/shared/"
        },
        {
          "type": "p",
          "text": "Wazuh permite distribuir configuración mediante `agent.conf`, y un agente puede pertenecer a varios grupos. Las configuraciones se fusionan y el último grupo tiene mayor prioridad en caso de conflicto [5]. Por eso, \"el agente está en el grupo Windows\" no es suficiente: es necesario entender la **configuración resultante**."
        }
      ]
    },
    {
      "heading": "4.2: Entienda el client_buffer antes de tocarlo",
      "blocks": [
        {
          "type": "p",
          "text": "Por defecto, el client_buffer tiene un `queue_size` de 5.000 eventos y un `events_per_second` de 500. El tamaño permitido llega hasta 100.000 y el throughput hasta 1.000 EPS [3]."
        },
        {
          "type": "code",
          "text": "<client_buffer>\n  <disabled>no</disabled>\n  <queue_size>5000</queue_size>\n  <events_per_second>500</events_per_second>\n</client_buffer>"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Punto crítico",
            "body": "un buffer grande no aumenta automáticamente la capacidad de drenaje. Si el agente produce 800 EPS de forma sostenida y solo puede transmitir 500 EPS, la cola crece 300 eventos por segundo hasta llenarse."
          }
        },
        {
          "type": "p",
          "text": "Con un `queue_size` de 100.000, una diferencia sostenida de 300 EPS llenaría la cola en poco más de cinco minutos. Por eso `queue_size` y `events_per_second` deben evaluarse juntos."
        }
      ]
    },
    {
      "heading": "4.3: Busque evidencia de antiflooding",
      "blocks": [
        {
          "type": "p",
          "text": "Las reglas 202 a 205 de Wazuh ayudan a identificar el estado de la cola del agente. La regla 203 indica cola llena y alerta que los eventos pueden perderse; la 204 indica flooding; la 205 registra el retorno a la normalidad [4][8]."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "ID de regla",
              "Interpretación operacional"
            ],
            "rows": [
              [
                "202",
                "La cola alcanzó el nivel de warning; por defecto, 90%."
              ],
              [
                "203",
                "Cola llena. Los eventos pueden perderse."
              ],
              [
                "204",
                "Cola en estado flooded. Investigar la configuración y la generación de eventos."
              ],
              [
                "205",
                "La cola volvió al nivel normal."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Consulte un período representativo, por ejemplo 30 días, y agregue por `agent.name` y `rule.id`. El número bruto de la regla 203 no es igual al número de incidentes, porque la regla puede repetirse mientras la cola permanezca llena. Construya **episodios** a partir de la secuencia 202 → 203/204 → 205."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Ejemplo anonimizado",
            "body": "en 30 días, un entorno presentó 908 alertas de antiflooding, correspondientes a 83 episodios distintos de saturación. Hubo 681 registros de queue full, y en 47 episodios la cola llegó al estado flooded. Cuatro agentes concentraron todo el problema. El buffer ya estaba configurado en 100.000 eventos (el límite máximo) y el throughput seguía en 500 EPS. Uno de los top talkers era justamente el único agente conectado al Worker, mientras que el Worker no presentaba drops. Ese cruce fue decisivo: el cuello de botella de ese caso estaba en el propio agente o en la generación local, no en la capacidad del Manager. La conclusión no fue \"agrandar la cola\": la cola ya estaba al máximo. La investigación pasó a ser \"¿qué workload local produce el burst y por qué?\"."
          }
        }
      ]
    },
    {
      "heading": "4.4: Busque el patrón temporal y la causalidad local",
      "blocks": [
        {
          "type": "p",
          "text": "En uno de los agentes Linux, los episodios de flooding aparecían repetidamente alrededor de la misma hora. Eso es una señal para correlacionar cron, systemd timers, backups, pipelines, rotación de logs, scanners, FIM y jobs de aplicación. En un servidor de base de datos, el episodio más grande permaneció saturado unos diez minutos. Son problemas que exigen análisis del host, no del Manager."
        }
      ]
    },
    {
      "heading": "4.5: No confunda agentes desconectados con una falla actual",
      "blocks": [
        {
          "type": "p",
          "text": "Un inventario con muchos agentes disconnected puede indicar un problema grave, o simplemente deuda histórica. Use `lastKeepAlive`, `disconnection_time` y la reconciliación con el CMDB. En un caso real, había 235 agentes registrados y 137 desconectados, pero 136 de ellos llevaban al menos 30 días sin comunicar y decenas no reportaban desde hacía más de un año. La lectura correcta era \"inventario no saneado\", no \"el 58% del parque cayó hoy\"."
        }
      ]
    },
    {
      "heading": "4.6: Verifique la consistencia de grupos y la sincronización",
      "blocks": [
        {
          "type": "p",
          "text": "Compare el sistema operativo detectado, los grupos asignados y el `group_config_status`. En un entorno analizado, los 98 agentes activos estaban synced. Solo tres agentes activos estaban fuera del grupo especializado esperado para su sistema operativo. Ese detalle evitó una conclusión injusta de que todo el modelo de grupos estaba roto."
        }
      ]
    },
    {
      "heading": "4.7: El versionado también es madurez",
      "blocks": [
        {
          "type": "p",
          "text": "Registre las versiones de los agentes y compárelas con el Manager. La fragmentación excesiva indica ausencia de lifecycle. Wazuh, por defecto, no acepta agentes con una versión superior a la del Manager cuando la opción `allow_higher_versions` permanece deshabilitada [11]. Incluso cuando la comunicación funciona, la evaluación debe registrar la condición fuera del estándar de compatibilidad garantizada y proponer una política de actualización."
        }
      ]
    },
    {
      "heading": "Fase 5: Cobertura de fuentes de log y calidad de la telemetría",
      "blocks": [
        {
          "type": "p",
          "text": "Después de probar que el pipeline funciona, llega la pregunta más incómoda: **¿estamos recibiendo lo que deberíamos recibir?** Un SIEM puede procesar millones de eventos y seguir ciego frente a los activos que realmente importan."
        },
        {
          "type": "p",
          "text": "**Construya una matriz de Log Source Coverage**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Fuente",
              "Valor de seguridad",
              "Preguntas"
            ],
            "rows": [
              [
                "Windows Security",
                "Identidad, autenticación, privilegio",
                "¿Integrado? ¿Canales? ¿Retención?"
              ],
              [
                "PowerShell",
                "Ejecución y administración",
                "¿Operational y ScriptBlock?"
              ],
              [
                "Sysmon",
                "Telemetría de endpoint",
                "¿Existe? ¿Configuración? ¿Ruido?"
              ],
              [
                "Linux auth/auditd",
                "Autenticación y actividad privilegiada",
                "¿Qué hosts y qué reglas?"
              ],
              [
                "Firewall/WAF/F5",
                "Red, ataques, políticas",
                "Protocolo, EPS, log type, criticidad"
              ],
              [
                "AD/Entra/IdP",
                "Identidad",
                "Cobertura de sign-in, admin, MFA, cambios"
              ],
              [
                "DNS/Proxy/VPN",
                "Navegación y acceso remoto",
                "Fuentes, volumen y casos de uso"
              ],
              [
                "Cloud",
                "CloudTrail, Azure, GCP etc.",
                "Cuentas, regiones, buckets, APIs"
              ],
              [
                "EDR/XDR",
                "Detección de endpoint",
                "Integración y redundancia"
              ],
              [
                "Bases de datos y aplicaciones críticas",
                "Transacciones y rastro de auditoría",
                "Eventos útiles y volumen"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "No evalúe solo \"integrado o no\". Registre volumen, formato, decoder, timestamp, criticidad, owner, casos de uso dependientes y calidad del dato."
        },
        {
          "type": "p",
          "text": "**Qué hacer con una fuente muy voluminosa**"
        },
        {
          "type": "list",
          "items": [
            "Probar quién genera el volumen y en qué horario.",
            "Clasificar los tipos de evento y las severidades.",
            "Descubrir si pocas políticas o aplicaciones generan la mayor parte de los logs.",
            "Separar la telemetría necesaria para la detección en tiempo real de la telemetría orientada a hunting y forense.",
            "Evaluar la reducción de ruido en el origen antes de aumentar la infraestructura.",
            "Preservar los eventos de alto valor y validar cualquier filtro con los casos de uso existentes."
          ]
        }
      ]
    },
    {
      "heading": "Fase 6: Transporte de alertas, Indexer y Dashboard",
      "blocks": [
        {
          "type": "p",
          "text": "El evento puede haberse procesado y, aun así, no aparecer en el Dashboard. Por eso la investigación debe continuar después de `alerts.json`."
        }
      ]
    },
    {
      "heading": "6.1: Filebeat y forwarding",
      "blocks": [
        {
          "type": "code",
          "text": "sudo systemctl status filebeat --no-pager -l\nsudo filebeat test config\nsudo filebeat test output\nsudo journalctl -u filebeat --since \"24 hours ago\" --no-pager"
        },
        {
          "type": "p",
          "text": "Busque retries, timeout, connection reset, bulk errors, backoff, fallos de TLS y backlog. El objetivo es responder: ¿el Manager generó la alerta, pero el transporte falló?"
        }
      ]
    },
    {
      "heading": "6.2: Salud del Indexer",
      "blocks": [
        {
          "type": "code",
          "text": "curl -k -u <usuario> https://localhost:9200/_cluster/health?pretty\ncurl -k -u <usuario> https://localhost:9200/_cat/nodes?v\ncurl -k -u <usuario> https://localhost:9200/_cat/indices?v\ncurl -k -u <usuario> https://localhost:9200/_cat/shards?v\ncurl -k -u <usuario> https://localhost:9200/_cat/thread_pool/write?v"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "aviso",
            "title": "Aviso",
            "body": "nunca ponga contraseñas en la evidencia ni en capturas. Use entrada interactiva, variable protegida o un mecanismo de autenticación adecuado."
          }
        }
      ]
    },
    {
      "heading": "6.3: Memoria, heap y swap",
      "blocks": [
        {
          "type": "p",
          "text": "La documentación de Wazuh recomienda evitar que la JVM del Indexer sea swapeada y sugiere un heap de alrededor de la mitad de la RAM, con Xms y Xmx iguales [12]."
        },
        {
          "type": "code",
          "text": "grep -E '^-Xm[sx]' /etc/wazuh-indexer/jvm.options\nswapon --show\nsysctl vm.swappiness\nsystemctl show wazuh-indexer -p LimitMEMLOCK\nPID=$(pgrep -f 'org.opensearch.bootstrap.OpenSearch' | head -1)\ngrep -E 'VmRSS|VmSwap' /proc/$PID/status"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Ejemplo anonimizado",
            "body": "dos Indexers tenían el mismo volumen de storage y recursos de memoria bastante diferentes. Uno de ellos utilizaba el 100% del swap configurado y el otro presentaba un uso relevante. Ambos estaban cerca del 70% de ocupación de disco. Eso no probaba por sí solo la causa de los drops, pero exigía investigación antes de cualquier crecimiento de la ingesta."
          }
        }
      ]
    },
    {
      "heading": "6.4: Alta disponibilidad y quorum",
      "blocks": [
        {
          "type": "p",
          "text": "OpenSearch usa quorum para las decisiones de cluster. Con dos nodos votantes, la tolerancia a fallos es cero: ambos deben permanecer disponibles para mantener la mayoría. Tres nodos votantes toleran la pérdida de uno [13]. Por eso, no basta decir \"hay dos Indexers, entonces hay HA\". Es necesario verificar `node.roles`, la voting configuration, las réplicas y el comportamiento durante un fallo."
        }
      ]
    },
    {
      "heading": "Fase 7: Controles funcionales de Wazuh",
      "blocks": [
        {
          "type": "p",
          "text": "Después de estabilizar la infraestructura y el pipeline, revise qué está haciendo efectivamente la plataforma en los endpoints. Clasifique cada módulo como **inexistente, default, personalizado, validado o monitoreado**."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Módulo",
              "Qué verificar"
            ],
            "rows": [
              [
                "FIM / syscheck",
                "Directorios, frecuencia, realtime/whodata, report_changes, exclusions"
              ],
              [
                "SCA",
                "Políticas aplicadas, cobertura, periodicidad, excepciones"
              ],
              [
                "Syscollector",
                "Inventario de hardware, software, puertos y procesos"
              ],
              [
                "Vulnerability Detection",
                "Feeds, cobertura, retraso y tratamiento"
              ],
              [
                "Rootcheck",
                "Alcance y relevancia operacional"
              ],
              [
                "Logcollector",
                "Archivos, EventChannel, comandos y aplicaciones"
              ],
              [
                "Active Response",
                "Acciones habilitadas, seguridad, alcance y rollback"
              ],
              [
                "Integrations",
                "Cloud, Office 365, APIs, CTI, notificaciones"
              ],
              [
                "Agent upgrade",
                "Política de versionado y rollout"
              ],
              [
                "Labels",
                "Contexto de negocio, criticidad y ownership"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "La madurez aparece cuando la configuración es explicable. \"Está habilitado\" es solo el primer nivel."
        }
      ]
    },
    {
      "heading": "Fase 8: Rules, decoders y Detection Engineering",
      "blocks": [
        {
          "type": "p",
          "text": "Un Wazuh maduro no se mide por la cantidad de reglas instaladas. Se mide por la capacidad de detectar comportamientos relevantes con datos confiables, bajo ruido y una respuesta operacional definida."
        },
        {
          "type": "p",
          "text": "**Inventario mínimo**"
        },
        {
          "type": "code",
          "text": "/var/ossec/etc/rules/\n/var/ossec/etc/decoders/\n/var/ossec/etc/rules/local_rules.xml\n/var/ossec/etc/decoders/local_decoder.xml"
        },
        {
          "type": "list",
          "items": [
            "¿Cuántas reglas personalizadas existen?",
            "¿Qué reglas alertan más?",
            "¿Cuáles nunca alertaron?",
            "¿Cuáles dependen de una fuente de log que ya no existe?",
            "¿Qué tecnologías llegan sin un decoder adecuado?",
            "¿Qué reglas generan falsos positivos recurrentes?",
            "¿Qué reglas tienen owner y playbook asociado?"
          ]
        },
        {
          "type": "p",
          "text": "**Construya un catálogo de casos de uso**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "ID",
              "Caso de uso",
              "Fuente",
              "MITRE",
              "Detección",
              "Estado"
            ],
            "rows": [
              [
                "UC-001",
                "Fuerza bruta de identidad",
                "Windows/IdP",
                "T1110",
                "Regla / correlación",
                "Validar"
              ],
              [
                "UC-002",
                "PowerShell sospechoso",
                "Windows",
                "T1059.001",
                "EventChannel / Sysmon",
                "Validar"
              ],
              [
                "UC-003",
                "Escalada de privilegios",
                "Windows/Linux",
                "T1548",
                "Reglas y contexto",
                "Validar"
              ],
              [
                "UC-004",
                "Persistencia",
                "Endpoint",
                "Varios",
                "FIM / eventos",
                "Validar"
              ],
              [
                "UC-005",
                "Ataque web",
                "WAF/F5",
                "Varios",
                "Decoder / regla",
                "Validar"
              ],
              [
                "UC-006",
                "Movimiento lateral",
                "Endpoint/Red",
                "Varios",
                "Correlación",
                "Validar"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "La pregunta que la operación debe poder responder es: **¿qué exactamente fue diseñado para detectar este SIEM?**"
        }
      ]
    },
    {
      "heading": "Fase 9: Calidad de alertas y operación del SOC",
      "blocks": [
        {
          "type": "p",
          "text": "Un SIEM sano puede ser operativamente inútil si el analista recibe miles de alertas repetitivas sin contexto. Por eso la evaluación debe salir de la infraestructura y entrar en la rutina del SOC."
        },
        {
          "type": "list",
          "items": [
            "Top 20 de reglas por volumen.",
            "Alertas por severidad, agente, usuario, tecnología y horario.",
            "Reglas con repetición alta y poca acción operacional.",
            "False positives conocidos y tuning existente.",
            "Alertas sin playbook ni owner.",
            "MTTA, MTTR y adherencia al SLA cuando estén disponibles.",
            "Calidad del contexto: hostname, usuario, IP, técnica MITRE, activo crítico, owner y enlace de investigación."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Regla práctica",
            "body": "un millón de alertas no es evidencia de buena detección. Puede ser evidencia de que el SIEM está convirtiendo telemetría en ruido."
          }
        }
      ]
    },
    {
      "heading": "Fase 10: Seguridad del propio SIEM",
      "blocks": [
        {
          "type": "p",
          "text": "El SIEM concentra telemetría sensible, credenciales de integración, inventario y capacidad de respuesta. Debe tratarse como un activo crítico."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Control",
              "Preguntas"
            ],
            "rows": [
              [
                "TLS y certificados",
                "Validez, cadena, algoritmo, expiración, distribución de claves"
              ],
              [
                "RBAC",
                "Privilegio mínimo, cuentas administrativas, perfiles del SOC"
              ],
              [
                "MFA/SSO",
                "Integración, exigencia para cuentas privilegiadas"
              ],
              [
                "API",
                "Exposición de red, autenticación y auditoría"
              ],
              [
                "Dashboard",
                "Exposición, TLS, sesión y acceso administrativo"
              ],
              [
                "SSH",
                "Origen permitido, claves, root, logging"
              ],
              [
                "Firewall/ACL",
                "Puertos estrictamente necesarios"
              ],
              [
                "Secrets",
                "Tokens, webhooks, passwords y private keys fuera del texto plano"
              ],
              [
                "Configuración legada",
                "Listeners e integraciones de productos discontinuados"
              ]
            ]
          }
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Ejemplo anonimizado",
            "body": "durante una revisión de configuración se encontró un listener Syslog legado todavía activo para una tecnología que ya no existía en el entorno, aceptando un origen amplio, además de un webhook antiguo almacenado en texto plano dentro de una configuración comentada. Otro listener crítico también usaba una allowlist excesivamente permisiva. El entorno funcionaba, pero la superficie de exposición había crecido silenciosamente. La corrección correcta es inventariar las fuentes legítimas, validar las ACLs de red y solo entonces restringir o eliminar listeners, para no interrumpir telemetría válida."
          }
        }
      ]
    },
    {
      "heading": "Fase 11: Backup, Disaster Recovery y resiliencia",
      "blocks": [
        {
          "type": "p",
          "text": "La pregunta no es \"¿hay backup?\". La pregunta es **\"¿cuánto tarda en recuperarse el SIEM y qué cantidad de datos puede perderse?\"**"
        },
        {
          "type": "list",
          "items": [
            "Backup de `ossec.conf`, `agent.conf`, rules, decoders, CDB lists y configuraciones de integración.",
            "Protección y recuperación de certificados y secretos mediante un mecanismo seguro.",
            "Snapshots del Indexer y política de retención.",
            "Procedimiento de restauración documentado y probado.",
            "RTO y RPO definidos.",
            "Prueba de fallo de Manager, Worker, Indexer y Dashboard.",
            "Validación del comportamiento de los agentes durante la indisponibilidad.",
            "Validación de quorum y réplicas en OpenSearch."
          ]
        },
        {
          "type": "p",
          "text": "Un backup nunca restaurado es solo una hipótesis de recuperación."
        }
      ]
    },
    {
      "heading": "Fase 12: Capacity Planning y monitoreo del propio SIEM",
      "blocks": [
        {
          "type": "p",
          "text": "El capacity planning convierte el crecimiento en una decisión anticipada. Sin él, el entorno solo descubre que creció demasiado cuando el incidente ya ocurrió."
        },
        {
          "type": "p",
          "text": "**Métricas mínimas**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Categoría",
              "Métricas"
            ],
            "rows": [
              [
                "Ingesta",
                "EPS promedio, EPS pico, eventos/día, alertas/día, bytes/día"
              ],
              [
                "Managers",
                "CPU, RAM, colas, drops, threads, sesiones, agentes por nodo"
              ],
              [
                "Agentes",
                "buffer usage, reglas 202–205, EPS local, top talkers"
              ],
              [
                "Indexer",
                "CPU, heap, swap, write rejected, shards, réplicas, search latency"
              ],
              [
                "Storage",
                "GB/día, retención, crecimiento, watermark, archives"
              ],
              [
                "Operación",
                "FP rate, alertas por regla, MTTA, MTTR, SLA"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "**El SIEM necesita monitorear al SIEM**"
        },
        {
          "type": "list",
          "items": [
            "Agent disconnected por encima del baseline.",
            "Agent buffer en warning, full o flooded.",
            "`events_dropped` mayor que cero.",
            "Nodo de cluster indisponible.",
            "Cluster del Indexer en yellow/red.",
            "Disco por encima de los thresholds definidos.",
            "Heap pressure, swap o write rejection.",
            "Filebeat sin conectividad.",
            "Certificado próximo a expirar.",
            "Backup o snapshot con fallos.",
            "Ingesta detenida o EPS anormalmente alto/bajo."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Objetivo de madurez",
            "body": "el SOC debe descubrir que el SIEM está enfermo antes de descubrir que faltaron logs durante un incidente."
          }
        }
      ]
    },
    {
      "heading": "Fase 13: Convertir evidencia en madurez y plan de acción",
      "blocks": [
        {
          "type": "p",
          "text": "La recolección solo genera valor cuando termina en una decisión. Las capturas y los outputs son materia prima. El producto final es un plan que vincula evidencia con riesgo, acción y validación."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig3.svg",
            "alt": "La cadena que convierte la recolección técnica en una mejora controlada.",
            "caption": "La cadena que convierte la recolección técnica en una mejora controlada."
          }
        }
      ]
    },
    {
      "heading": "13.1: Modelo de registro de gaps",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Campo",
              "Ejemplo"
            ],
            "rows": [
              [
                "ID",
                "WAZUH-ING-001"
              ],
              [
                "Dominio",
                "Ingesta"
              ],
              [
                "Hallazgo",
                "Eventos descartados por el analysisd"
              ],
              [
                "Evidencia",
                "state/API con contador y desglose"
              ],
              [
                "Causa probable",
                "Saturación transitoria en una categoría específica"
              ],
              [
                "Impacto",
                "Pérdida de telemetría antes de la correlación"
              ],
              [
                "Riesgo",
                "Posible pérdida de un evento de seguridad"
              ],
              [
                "Prioridad",
                "P0"
              ],
              [
                "Acción",
                "Tratar la fuente, la distribución, la capacidad y el tuning"
              ],
              [
                "Rollback",
                "Restaurar la configuración anterior"
              ],
              [
                "Validación",
                "events_dropped se mantiene estable con incremento cero"
              ],
              [
                "KPI",
                "Drops/hora, EPS pico, queue usage"
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "13.2: Priorización",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Prioridad",
              "Cuándo usar"
            ],
            "rows": [
              [
                "P0",
                "Pérdida de datos, riesgo de ceguera, indisponibilidad, exposición crítica, fallo de seguridad directamente explotable."
              ],
              [
                "P1",
                "Alta disponibilidad, distribución, capacidad, arquitectura y riesgos altos que pueden generar P0."
              ],
              [
                "P2",
                "Cobertura de logs, detección, tuning, lifecycle y calidad operacional."
              ],
              [
                "P3",
                "Optimización, dashboards, automatización, documentación y gobernanza incremental."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "13.3: Score de madurez",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Score",
              "Significado"
            ],
            "rows": [
              [
                "0",
                "Inexistente"
              ],
              [
                "1",
                "Inicial o default, sin gestión"
              ],
              [
                "2",
                "Implementado"
              ],
              [
                "3",
                "Gestionado y medido"
              ],
              [
                "4",
                "Optimizado y mejorado continuamente"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Aplique la escala por dominio: arquitectura, alta disponibilidad, agentes, log sources, ingesta, performance, storage, rules/decoders, detección, FIM, SCA, vulnerabilidades, IAM/RBAC, hardening, backup/DR, monitoreo y gobernanza."
        }
      ]
    },
    {
      "heading": "14. Estudio de caso anonimizado: cómo varias pequeñas \"normalidades\" se acumulan",
      "blocks": [
        {
          "type": "p",
          "text": "El valor del framework aparece cuando los hallazgos dejan de tratarse de forma aislada. El caso siguiente resume patrones encontrados en una única evaluación real, sin ninguna identificación del entorno."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Dominio",
              "Patrón observado"
            ],
            "rows": [
              [
                "Infraestructura",
                "Servicios activos, pero relojes sin sincronización efectiva, clock skew observable, uptime muy largo y mantenimiento pendiente."
              ],
              [
                "Managers",
                "Cluster sincronizado, aunque con 97 agentes activos en un nodo y solo 1 en el otro."
              ],
              [
                "Ingesta",
                "remoted sin descartes, analysisd con más de 211 mil drops."
              ],
              [
                "Syslog",
                "Más del 99% de los drops pertenecían a Syslog; flujo concentrado en firewall y recibido vía UDP en el Master."
              ],
              [
                "Top talkers",
                "Pocas fuentes respondían por casi todo el volumen de Firewall, cerca de 1.000 datagramas/s en una ventana observada."
              ],
              [
                "Calidad",
                "Los firewalls no enviaban solo ruido. Había una mezcla consistente de TRAFFIC y THREAT, que exigía ingeniería de ingesta en lugar de un filtro ciego."
              ],
              [
                "Agents",
                "client_buffer en 100.000 eventos y 500 EPS y, aun así, 83 episodios de saturación en 30 días, con flooding en parte de ellos."
              ],
              [
                "Inventario",
                "235 agentes registrados, 137 disconnected, pero casi todos los desconectados eran históricos y necesitaban saneamiento del inventario."
              ],
              [
                "Sincronización",
                "El 100% de los agentes activos tenía group_config_status synced."
              ],
              [
                "Lifecycle",
                "Flota fragmentada en varias versiones de agente, incluidos agentes más nuevos que el Manager y registros legados duplicados."
              ],
              [
                "Indexer",
                "Storage cerca del 70%, swap relevante y asimetría de memoria entre nodos."
              ],
              [
                "Hardening",
                "Listener legado, allowlist amplia y un secreto antiguo encontrado en la configuración."
              ],
              [
                "Retención",
                "Los archives habilitados generaban archivos corrientes del orden de decenas de gigabytes, lo que reforzaba la necesidad de una política de retención y capacity planning."
              ],
              [
                "Resiliencia",
                "La topología debía validarse en cuanto a quorum, réplicas y tolerancia real a fallos."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Ninguno de estos elementos describe el entorno por sí solo. Juntos cuentan una historia: el Wazuh era funcional, pero había deuda de arquitectura, ingesta, lifecycle, seguridad y capacidad. La herramienta no necesitaba ser reemplazada. Necesitaba ser comprendida y madurada."
        }
      ]
    },
    {
      "heading": "15. Las trampas más comunes cuando se hereda un Wazuh",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Atajo peligroso",
              "Por qué falla"
            ],
            "rows": [
              [
                "\"Aumenta la queue\"",
                "Puede ocultar el problema durante más tiempo. Primero descubra quién produce el burst, qué cola se satura y si la generación es necesaria."
              ],
              [
                "\"Hay dos nodos, entonces hay HA\"",
                "La distribución, el quorum, las réplicas y el failover deben probarse."
              ],
              [
                "\"El dashboard está verde\"",
                "La salud visual no garantiza la integridad del pipeline."
              ],
              [
                "\"Hay muchos disconnected, entonces la mitad del parque está caída\"",
                "Compare lastKeepAlive y el CMDB antes de declarar un impacto."
              ],
              [
                "\"Vamos a filtrar ALLOW\"",
                "La telemetría de red puede ser importante para hunting y el mismo flujo puede transportar eventos THREAT."
              ],
              [
                "\"Todo en default es malo\"",
                "El default solo es un problema cuando no satisface el comportamiento observado. No confunda personalización con madurez."
              ],
              [
                "\"Más alertas significa más seguridad\"",
                "El volumen sin contexto ni playbook puede reducir la capacidad del SOC."
              ],
              [
                "\"Existe backup\"",
                "Sin prueba de restauración, RTO y RPO, no existe evidencia de recuperabilidad."
              ],
              [
                "\"Actualiza los agentes y después el Manager\"",
                "El lifecycle debe respetar la compatibilidad y la política de rollout."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "16. Cómo transformar la evaluación en roadmap",
      "blocks": [
        {
          "type": "p",
          "text": "Después de la recolección, agrupe las acciones por oleadas. Eso reduce el riesgo y muestra valor temprano."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Oleada",
              "Objetivo",
              "Ejemplos"
            ],
            "rows": [
              [
                "0. Contención",
                "Detener la pérdida o la exposición crítica",
                "Drops, secreto expuesto, listener innecesario, cluster red."
              ],
              [
                "1. Estabilización",
                "Hacer que el pipeline opere de forma predecible",
                "NTP, distribución, buffers, sources, Filebeat, Indexer."
              ],
              [
                "2. Arquitectura",
                "Eliminar puntos únicos y preparar el crecimiento",
                "Load balancer, Syslog relay, quorum, réplicas, storage."
              ],
              [
                "3. Detection Engineering",
                "Mejorar lo que detecta el SIEM",
                "Decoders, rules, use cases, MITRE, tuning."
              ],
              [
                "4. Operación",
                "Convertir la detección en respuesta",
                "Playbooks, ownership, SLA, dashboards, KPIs."
              ],
              [
                "5. Optimización continua",
                "Evitar la regresión",
                "Self monitoring, capacity review, lifecycle, maturity reassessment."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Cada acción debe tener owner, dependencia, esfuerzo, riesgo del cambio, GMUD cuando corresponda, rollback, criterio de aceptación y métrica posterior al cambio."
        }
      ]
    },
    {
      "heading": "17. Criterios de aceptación que valen más que \"funcionó\"",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Dominio",
              "Criterio de aceptación"
            ],
            "rows": [
              [
                "Drops",
                "Ningún incremento de events_dropped durante las ventanas normales y de pico definidas."
              ],
              [
                "Agent buffer",
                "Cero regla 203/204 recurrente después de tratar los top talkers, salvo excepción documentada."
              ],
              [
                "Distribución",
                "Carga entre Managers dentro de la franja operacional definida, no solo agentes \"repartidos\"."
              ],
              [
                "Indexer",
                "Cluster health esperado, sin write rejection, heap y swap dentro de los límites, storage con headroom."
              ],
              [
                "Log sources",
                "Fuentes críticas inventariadas, con owner, formato, volumen y casos de uso mapeados."
              ],
              [
                "Detección",
                "Casos de uso probados con evidencia de disparo y playbook."
              ],
              [
                "Inventario",
                "Agentes stale reconciliados y proceso de descomisionamiento establecido."
              ],
              [
                "Resiliencia",
                "Failover y restauración probados con RTO/RPO medidos."
              ],
              [
                "Seguridad",
                "Sin secretos en texto plano, RBAC revisado y listeners estrictamente necesarios."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "18. Playbook de recolección rápida (anexo)",
      "blocks": [
        {
          "type": "p",
          "text": "El anexo siguiente resume un orden eficiente para la primera ronda. No reemplaza al resto del artículo, pero ayuda a comenzar sin perder el hilo de la investigación."
        },
        {
          "type": "p",
          "text": "**Managers**"
        },
        {
          "type": "code",
          "text": "hostnamectl / nproc / free -h / df -hT / timedatectl\n/var/ossec/bin/wazuh-control info\n/var/ossec/bin/wazuh-control status\n/var/ossec/bin/cluster_control -l\n/var/ossec/bin/cluster_control -i more\ncat /var/ossec/var/run/wazuh-remoted.state\ncat /var/ossec/var/run/wazuh-analysisd.state"
        },
        {
          "type": "p",
          "text": "**Groups y agents**"
        },
        {
          "type": "code",
          "text": "/var/ossec/bin/agent_groups -l\n/var/ossec/bin/cluster_control -a\n/var/ossec/bin/agent_control -l\ngrep -Rni -A8 -B3 '<client_buffer>' /var/ossec/etc/shared/"
        },
        {
          "type": "p",
          "text": "**Filebeat**"
        },
        {
          "type": "code",
          "text": "systemctl status filebeat --no-pager -l\nfilebeat test config\nfilebeat test output\njournalctl -u filebeat --since \"24 hours ago\" --no-pager"
        },
        {
          "type": "p",
          "text": "**Indexers**"
        },
        {
          "type": "code",
          "text": "systemctl status wazuh-indexer --no-pager -l\ngrep -Ev '^\\s*(#|$)' /etc/wazuh-indexer/opensearch.yml\ngrep -E '^-Xm[sx]' /etc/wazuh-indexer/jvm.options\nswapon --show\ncurl -k -u <usuario> https://localhost:9200/_cluster/health?pretty\ncurl -k -u <usuario> https://localhost:9200/_cat/nodes?v\ncurl -k -u <usuario> https://localhost:9200/_cat/shards?v\ncurl -k -u <usuario> https://localhost:9200/_cat/thread_pool/write?v"
        },
        {
          "type": "p",
          "text": "**Syslog y volumen**"
        },
        {
          "type": "code",
          "text": "grep -n -A15 -B3 '<remote>' /var/ossec/etc/ossec.conf\nss -lunp\n# Amostra agregada de archives\ntail -n 500000 /var/ossec/logs/archives/archives.json | \\\n  jq -r '.location // \"sem_location\"' | sort | uniq -c | sort -nr | head -50"
        },
        {
          "type": "p",
          "text": "**Antiflooding**"
        },
        {
          "type": "p",
          "text": "En el Dashboard, consulte por rule.id 202, 203, 204 y 205 y agregue por `agent.name`. Construya episodios por secuencia temporal, no solo por conteo bruto."
        }
      ]
    },
    {
      "heading": "19. Checklist final de la evaluación",
      "blocks": [
        {
          "type": "list",
          "items": [
            "Arquitectura AS IS diseñada y validada.",
            "Función y capacidad de cada nodo documentadas.",
            "NTP y clock skew validados.",
            "Cluster de Managers evaluado en sincronización y distribución.",
            "remoted y analysisd evaluados con contadores de drop.",
            "Drops clasificados por categoría de evento.",
            "Syslog mapeado por origen, puerto, protocolo y volumen.",
            "Top talkers y event types identificados.",
            "client_buffer, EPS y antiflooding evaluados.",
            "Agentes stale y duplicados reconciliados.",
            "Grupos, precedencia y config sync validados.",
            "Versiones de agentes y lifecycle revisados.",
            "Filebeat probado.",
            "Indexer evaluado en health, heap, swap, shards, réplicas, write rejection y storage.",
            "Log Source Coverage completada.",
            "Controles de Wazuh evaluados.",
            "Rules y decoders inventariados.",
            "Catálogo de casos de uso iniciado.",
            "MITRE coverage y calidad de alertas evaluadas.",
            "Hardening y secrets revisados.",
            "Backup, DR, RTO y RPO evaluados.",
            "Capacity planning elaborado.",
            "Self monitoring definido.",
            "Maturity score calculado.",
            "Gap register, prioridades, roadmap, rollback y criterios de aceptación definidos."
          ]
        }
      ]
    },
    {
      "heading": "20. Conclusión",
      "blocks": [
        {
          "type": "p",
          "text": "La mayor ganancia de una evaluación de este tipo no es descubrir que una queue está llena. Es cambiar la forma en que la organización ve el SIEM. El Wazuh deja de ser un conjunto de servidores y pasa a tratarse como un pipeline de seguridad que necesita ser observado, medido, protegido y mejorado continuamente."
        },
        {
          "type": "p",
          "text": "Cuando uno se sube a un auto en movimiento, lo peor que puede hacer es empezar a cambiar piezas sin entender el comportamiento del vehículo. Primero se lee el tablero. Después se escucha el motor. Se revisan combustible, temperatura, presión, alineación e historial de mantenimiento. Solo entonces se decide qué debe corregirse."
        },
        {
          "type": "p",
          "text": "Con Wazuh es lo mismo. Arquitectura, ingesta, buffers, fuentes, Indexer, detección, operación y resiliencia forman parte del mismo sistema. La herramienta puede tener un enorme potencial, pero ese potencial solo aparece cuando la operación sabe qué recibe, qué pierde, qué detecta y cómo reacciona."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Mensaje final",
            "body": "el objetivo no es tener un Wazuh \"personalizado\". El objetivo es tener un Wazuh explicable, medible, resiliente y alineado con el riesgo del negocio."
          }
        }
      ]
    }
  ],
  "sources": [
    {
      "label": "Agent connections in a Wazuh server cluster",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/agent-connections.html"
    },
    {
      "label": "Load balancers for Wazuh server cluster",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/load-balancers.html"
    },
    {
      "label": "client_buffer configuration",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/client-buffer.html"
    },
    {
      "label": "Wazuh agent queue and antiflooding",
      "url": "https://documentation.wazuh.com/current/user-manual/agent/agent-management/antiflooding.html"
    },
    {
      "label": "Centralized configuration (agent.conf)",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/centralized-configuration.html"
    },
    {
      "label": "wazuh-analysisd.state statistics",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/statistics-files/wazuh-analysisd-state.html"
    },
    {
      "label": "wazuh-analysisd daemon",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/daemons/wazuh-analysisd.html"
    },
    {
      "label": "Queuing mechanisms",
      "url": "https://documentation.wazuh.com/current/user-manual/manager/wazuh-server-queue.html"
    },
    {
      "label": "remote configuration",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/remote.html"
    },
    {
      "label": "Event logging and archives",
      "url": "https://documentation.wazuh.com/current/user-manual/manager/event-logging.html"
    },
    {
      "label": "auth configuration and allow_higher_versions",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/auth.html"
    },
    {
      "label": "Wazuh indexer tuning",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-indexer/wazuh-indexer-tuning.html"
    },
    {
      "label": "Voting and quorum",
      "url": "https://docs.opensearch.org/latest/tuning-your-cluster/discovery-cluster-formation/voting-quorums/"
    },
    {
      "label": "Wazuh server cluster overview",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/index.html"
    },
    {
      "label": "Local configuration reference",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/index.html"
    }
  ]
};
