import type { BlogPost } from "./posts";

/**
 * RatHat: troyano bancario para Android con control orientado por IA (ES).
 * Contenido elaborado a partir del informe de Malwarebytes divulgado en septiembre
 * de 2026 (análisis de Zimperium zLabs) y de la publicación analizada por
 * Cyber Security News. Portada: public/assets/blog/rathat-android-banking-trojan-thumb.webp
 */
export const rathatAndroidTrojanPostEs: BlogPost = {
  slug: "rathat-trojan-bancario-android-controle-ia",
  title:
    "RatHat: troyano bancario en Android usa IA para robar credenciales, códigos y reconstruir PINs",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Un troyano bancario para Android identificado como RatHat combina ingeniería social, abuso del servicio de accesibilidad y uso indebido del Android Debug Bridge para superponer pantallas de aplicaciones financieras, interceptar códigos de autenticación y reconstruir PINs y patrones de desbloqueo a partir de las coordenadas de toque.",
  date: "21 de septiembre de 2026",
  dateISO: "2026-09-21",
  readTime: "10 min de lectura",
  image: "/assets/blog/rathat-android-banking-trojan-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Android",
    "RatHat",
    "Troyano bancario",
    "Malware móvil",
    "Servicio de Accesibilidad",
    "Wireless Debugging",
    "ADB",
    "Ingeniería social",
    "Inteligencia de Amenazas",
    "Blue Team",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Un troyano bancario para Android identificado como **RatHat** fue analizado en septiembre de 2026 por **Zimperium zLabs**, con divulgación de **Malwarebytes**. El malware no depende de una falla de software para entrar en el dispositivo: la campaña comienza con ingeniería social y termina con control remoto a nivel de sistema, alcanzado mediante el uso indebido de recursos legítimos de Android.",
        },
        {
          type: "p",
          text: "La cadena abusa de tres pilares del propio sistema operativo: el **servicio de accesibilidad**, el **depurador inalámbrico** (Wireless Debugging) y el **Android Debug Bridge** (ADB). Con esa combinación, RatHat obtiene una sesión a nivel de shell, instala componentes nativos ocultos y pasa a operar fuera de los límites de una aplicación común.",
        },
        {
          type: "p",
          text: "El diferencial señalado en el análisis es el uso de un **asistente de IA en tiempo real** para inspeccionar la interfaz y decidir dónde tocar o desplazar. En lugar de seguir solo instrucciones fijas, el malware adapta la navegación a lo que encuentra en la pantalla, lo que tiende a reducir la eficacia de la detección basada únicamente en firma.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "El caso no es interesante por una técnica exótica aislada, sino por la composición: permiso de accesibilidad concedido por error, depurador inalámbrico habilitado y ADB como puente para la ejecución de comandos. Cada uno de esos elementos es legítimo y útil cuando se usa bien. El riesgo aparece cuando los tres coexisten, y es ahí donde los controles de política en dispositivos corporativos y la educación sobre instalación de aplicaciones pasan a valer más que la firma del antivirus.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Fuentes consultadas y verificadas el 21 de septiembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe hasta el 21 de septiembre de 2026, con base en el informe de Malwarebytes, en el análisis de Zimperium zLabs y en la publicación consultada:",
        },
        {
          type: "list",
          items: [
            "**Familia:** RatHat, troyano bancario para Android con control orientado por IA.",
            "**Detección informada:** Android/Trojan.Exploit.RatHat, según Malwarebytes.",
            "**Vector inicial:** SMS de phishing (smishing) o anuncios maliciosos que llevan a páginas falsas de descarga, imitando aplicaciones conocidas.",
            "**Requisito previo:** instalación manual del APK fuera de la tienda oficial (sideload) y concesión del permiso de servicio de accesibilidad.",
            "**Escalada:** habilitación de Wireless Debugging, lectura del código de emparejamiento de seis dígitos y emparejamiento por ADB hasta una sesión a nivel de shell.",
            "**Componentes:** agente nativo escrito en Go para ejecutar comandos de sistema y componente de túnel inverso hacia un servidor controlado por el atacante.",
            "**Fraude:** superposición de pantallas falsas en aplicaciones financieras, interceptación de SMS y captura de coordenadas de toque para reconstruir PINs y patrones.",
            "**Persistencia:** la aplicación maliciosa puede ser restaurada después de la eliminación convencional, mediante un componente oculto.",
            "**Objetivo:** usuarios de dispositivos Android y de aplicaciones financieras, con foco en campañas distribuidas por smishing.",
            "**Alcance del incidente:** la actividad es una campaña de delito financiero a gran escala, no un ataque dirigido a una organización específica.",
          ],
        },
      ],
    },
    {
      heading: "Perfil de la actividad",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Atributo", "Detalle"],
            rows: [
              ["Nombre", "RatHat"],
              ["Tipo", "Troyano bancario para Android"],
              [
                "Motivación",
                "Robo de credenciales bancarias, códigos de autenticación y PINs de desbloqueo",
              ],
              ["Distribución", "Smishing y anuncios maliciosos con páginas falsas de descarga"],
              ["Divulgación", "Actividad analizada y divulgada en septiembre de 2026"],
              ["Análisis", "Zimperium zLabs, con divulgación por Malwarebytes"],
              ["Objetivo", "Usuarios de dispositivos Android y aplicaciones financieras"],
              [
                "Técnica central",
                "Abuso de accesibilidad, Wireless Debugging, ADB y decisiones orientadas por IA",
              ],
              [
                "Componentes",
                "APK malicioso, servicio de accesibilidad, ADB, agente en Go y túnel inverso",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Cómo funciona la cadena de ataque",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Etapa", "Técnica", "Detalle"],
            rows: [
              [
                "1",
                "Ingeniería social",
                "SMS de phishing o anuncio malicioso con enlace a una página falsa de descarga",
              ],
              [
                "2",
                "Sideload",
                "Inducción a la víctima para instalar un APK fuera de la tienda oficial, muchas veces imitando una aplicación conocida",
              ],
              [
                "3",
                "Abuso de accesibilidad",
                "Solicitud del permiso de servicio de accesibilidad con justificación falsa, como eliminar una supuesta restricción de red",
              ],
              [
                "4",
                "Wireless Debugging",
                "Activación de las opciones de desarrollador y lectura del código de emparejamiento de seis dígitos",
              ],
              [
                "5",
                "ADB",
                "Emparejamiento automático y obtención de una sesión a nivel de shell en el dispositivo",
              ],
              [
                "6",
                "Componentes ocultos",
                "Despliegue de un agente en Go para ejecutar comandos y de un componente de túnel inverso",
              ],
              [
                "7",
                "Fraude bancario",
                "Superposición de pantallas falsas, interceptación de SMS y reconstrucción de PIN o patrón",
              ],
            ],
          },
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "La primera solicitud de permiso es el punto de decisión",
            body: "La protección más fuerte sigue siendo no conceder el primer permiso. Una aplicación de entretenimiento, finanzas o navegador no tiene motivo legítimo para pedir control de accesibilidad, que permite leer la pantalla y actuar en nombre del usuario.",
          },
        },
      ],
    },
    {
      heading: "Qué cambia la IA en la operación y en la detección",
      blocks: [
        {
          type: "p",
          text: "Según el análisis divulgado, RatHat puede usar un asistente de IA en vivo para inspeccionar la interfaz y decidir dónde tocar o desplazar. Eso sustituye guiones rígidos de automatización, que suelen fallar cuando cambia la versión de la aplicación o cuando aparece un aviso en el camino.",
        },
        {
          type: "p",
          text: "Para la detección, la consecuencia práctica es que el comportamiento deja de ser previsible en una secuencia fija de eventos. Las reglas que dependen de un orden exacto de toques o de un flujo único de pantallas pierden precisión. Ganan peso las señales de contexto: qué permisos fueron concedidos, si el depurador inalámbrico fue habilitado, si hay un componente nativo ejecutándose y si existen conexiones persistentes hacia fuera del dispositivo.",
        },
      ],
    },
    {
      heading: "Wireless Debugging y ADB: por qué el abuso es tan eficaz",
      blocks: [
        {
          type: "p",
          text: "Wireless Debugging es un recurso legítimo para desarrollo, que permite emparejar un dispositivo con una estación de trabajo sin cable. El emparejamiento exige un código de seis dígitos mostrado en el dispositivo, justamente para que alguien con acceso físico confirme la operación.",
        },
        {
          type: "p",
          text: "Con el permiso de accesibilidad ya concedido, el malware consigue navegar por la configuración, activar el recurso y leer el código mostrado en la pantalla. A partir del emparejamiento, ADB ofrece una sesión a nivel de shell, mucho más allá de lo que una aplicación común podría hacer. Es ese puente el que permite instalar los componentes ocultos y sostener la operación.",
        },
      ],
    },
    {
      heading: "Captura de toque y reconstrucción de PIN",
      blocks: [
        {
          type: "p",
          text: "El recurso más inusual descrito en el análisis es la captura de coordenadas directamente del controlador de entrada del dispositivo, registrando dónde toca el dedo la pantalla. RatHat compara esos puntos con los diseños de teclados numéricos y de patrones de desbloqueo para reconstruir el PIN o el patrón.",
        },
        {
          type: "p",
          text: "Como el método trabaja con la posición del toque, y no con la lectura del contenido de la pantalla, elude protecciones pensadas para impedir la captura de pantalla en aplicaciones sensibles. En conjunto con la superposición de pantallas falsas y la interceptación de SMS, el resultado es un conjunto de técnicas que ataca justamente las capas en las que las aplicaciones financieras suelen confiar.",
        },
      ],
    },
    {
      heading: "Persistencia: eliminar la aplicación puede no ser suficiente",
      blocks: [
        {
          type: "p",
          text: "Según la divulgación, RatHat consigue restaurar la aplicación maliciosa después de la eliminación convencional, apoyándose en un componente oculto en segundo plano. En la práctica, borrar una aplicación sospechosa puede no terminar con el compromiso, lo que cambia la recomendación de respuesta.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Consecuencia para el playbook de respuesta",
            body: "En un dispositivo con sospecha de compromiso por esta familia, el camino indicado es la restauración de fábrica antes de restaurar datos, y no solo la desinstalación de la aplicación. El cambio de contraseñas y la revisión de accesos deben hacerse desde otro dispositivo confiable.",
          },
        },
      ],
    },
    {
      heading: "Indicadores de compromiso y señales de interés",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor", "Descripción"],
            rows: [
              ["Familia", "RatHat", "Troyano bancario para Android con control orientado por IA"],
              [
                "Detección",
                "Android/Trojan.Exploit.RatHat",
                "Identificación informada por Malwarebytes",
              ],
              [
                "Aplicación",
                "APK instalado por sideload",
                "Paquete malicioso distribuido fuera de las tiendas oficiales",
              ],
              [
                "Servicio",
                "Accessibility Service",
                "Permiso usado para observar la pantalla e interactuar con aplicaciones",
              ],
              [
                "Recurso",
                "Wireless Debugging",
                "Funcionalidad abusada para habilitar el emparejamiento ADB",
              ],
              [
                "Herramienta",
                "Android Debug Bridge",
                "Utilizada para obtener una sesión a nivel de shell",
              ],
              ["Componente", "Agente nativo en Go", "Utilizado para ejecutar comandos de sistema"],
              [
                "Componente",
                "Túnel inverso",
                "Conexión persistente con un servidor controlado por el atacante",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Señales que merecen investigación en un dispositivo corporativo o personal: permiso de accesibilidad concedido a una aplicación instalada fuera de la tienda oficial, depurador inalámbrico habilitado sin uso de desarrollo, aplicación que reaparece después de ser desinstalada y tráfico persistente hacia un destino desconocido.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Credenciales:** robo de usuario y contraseña de aplicaciones bancarias mediante superposición de pantallas falsas.",
            "**Autenticación:** interceptación de SMS, códigos de un solo uso y códigos de autenticación multifactor enviados por mensaje.",
            "**Bloqueo del dispositivo:** reconstrucción de PINs y patrones de desbloqueo a partir de las coordenadas de toque.",
            "**Control remoto:** ejecución de comandos de sistema y comunicación por túnel persistente con el atacante.",
            "**Persistencia:** restauración de la aplicación maliciosa después de la eliminación convencional.",
            "**Fraude financiero:** acceso indebido a aplicaciones financieras y movimiento en cuentas bancarias.",
          ],
        },
      ],
    },
    {
      heading: "Mitigación",
      blocks: [
        {
          type: "list",
          items: [
            "Instalar aplicaciones solo desde Google Play o desde otra tienda oficial confiable, nunca por enlace, anuncio o página de descarga.",
            "Eliminar las aplicaciones Android instaladas por enlaces, anuncios o fuentes no oficiales.",
            "Rechazar solicitudes de permiso de servicio de accesibilidad sin una finalidad legítima y clara de accesibilidad.",
            "Mantener las opciones de desarrollador y el depurador inalámbrico deshabilitados cuando no haya una necesidad real de desarrollo.",
            "Activar el modo de protección avanzada (Advanced Protection Mode) en dispositivos compatibles.",
            "Mantener Android y las aplicaciones de seguridad móvil actualizados.",
            "Cambiar las contraseñas bancarias desde otro dispositivo confiable, nunca desde el dispositivo sospechoso.",
            "Contactar a las instituciones financieras para revisar accesos y transacciones.",
          ],
        },
      ],
    },
    {
      heading: "En caso de compromiso",
      blocks: [
        {
          type: "list",
          items: [
            "Ejecutar la restauración de fábrica del dispositivo antes de restaurar datos, recuperando solo lo que sea esencial y confiable.",
            "No reutilizar una copia de seguridad del dispositivo hecha después de la infección, pues puede contener el componente malicioso.",
            "Cambiar las contraseñas de las cuentas expuestas desde otro dispositivo confiable.",
            "Revisar las cuentas bancarias y las transacciones recientes, con soporte de la institución financiera.",
            "Buscar soporte profesional cuando el dispositivo se use para acceso a sistemas corporativos.",
          ],
        },
      ],
    },
    {
      heading: "Lo que todavía no sabemos / límites de este artículo",
      blocks: [
        {
          type: "p",
          text: "Este artículo fue elaborado a partir del informe divulgado por Malwarebytes, del análisis de Zimperium zLabs y de la publicación consultada, con verificación el 21 de septiembre de 2026. No hay telemetría propia de CyDef sobre esta campaña, ninguna explotación observada internamente y ninguna atribución de autoría hecha aquí.",
        },
        {
          type: "p",
          text: "No hay, hasta la fecha de verificación, una estimación pública consolidada del número de víctimas, ni una lista pública completa de aplicaciones financieras superpuestas por la campaña. Los indicadores divulgados son mayoritariamente conductuales (permisos, recursos abusados y componentes), y no valores fijos como hashes o dominios, lo que limita la detección por listas ya preparadas. Este texto se actualizará cuando haya información nueva verificable.",
        },
      ],
    },
    {
      heading: "Próximos pasos",
      blocks: [
        {
          type: "list",
          items: [
            "Revisar la política de dispositivos móviles en cuanto a permisos de accesibilidad y uso de opciones de desarrollador.",
            "Verificar en MDM o en la herramienta de gestión qué aplicaciones instaladas fuera de la tienda oficial siguen activas.",
            "Auditar dispositivos con depurador inalámbrico habilitado y eliminar la configuración donde no haya uso de desarrollo.",
            "Agregar una revisión periódica de permisos sensibles en los dispositivos de los colaboradores que acceden a sistemas financieros.",
            "Reforzar la orientación sobre instalación de aplicaciones y sobre enlaces recibidos por SMS y anuncios.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Malwarebytes: New Android malware uses AI to steal bank logins and reconstruct your PIN",
      url: "https://www.malwarebytes.com/blog/news/2026/09/new-android-malware-uses-ai-to-steal-bank-logins-and-pins",
    },
    {
      label:
        "Cyber Security News: New Android Malware Uses AI to Steal Bank Logins and Reconstruct Your PIN",
      url: "https://cybersecuritynews.com/android-malware-uses-ai/",
    },
  ],
  changelog: [
    "2026-09-21: primera versión, basada en el informe de Malwarebytes y en el análisis de Zimperium zLabs divulgados en septiembre de 2026.",
  ],
};
