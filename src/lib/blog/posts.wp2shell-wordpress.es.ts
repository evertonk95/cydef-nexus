import type { BlogPost } from "./posts";

/**
 * WP2Shell: cadena que combina CVE-2026-63030 y CVE-2026-60137 en WordPress Core (ES).
 * Contenido elaborado a partir del análisis de Seqrite y de la publicación de Cyber Security News.
 * Portada: public/assets/blog/wp2shell-wordpress-thumb.webp
 */
export const wp2shellWordpressPostEs: BlogPost = {
  slug: "wp2shell-wordpress-admin-web-shell",
  title:
    "WP2Shell encadena dos fallos de WordPress para crear administradores e instalar web shell sin login",
  category: "Inteligencia de Amenazas",
  excerpt:
    "La cadena WP2Shell combina la confusión de rutas de la API REST por lotes (CVE-2026-63030) con una inyección SQL en el parámetro author_exclude (CVE-2026-60137) para llegar a la ejecución de código en instalaciones WordPress sin autenticación.",
  date: "21 de octubre de 2026",
  dateISO: "2026-10-21",
  readTime: "7 min de lectura",
  image: "/assets/blog/wp2shell-wordpress-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "WordPress",
    "WP2Shell",
    "Vulnerabilidades",
    "API REST",
    "Inyección SQL",
    "Web Shell",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Seqrite documentó el 16 de octubre de 2026 una cadena de explotación contra WordPress Core llamada WP2Shell. Combina dos fallos, CVE-2026-63030 y CVE-2026-60137, para pasar de una solicitud no autenticada a la API REST hasta la ejecución de código en el servidor, pasando por la creación de una cuenta administrativa y la instalación de un plugin que funciona como web shell.",
        },
        {
          type: "p",
          text: "El encadenamiento es el punto central: ninguno de los dos fallos, por separado, entrega una web shell. El primero abre el camino a funcionalidades que deberían exigir autenticación, y el segundo aporta la debilidad de base de datos explotada en ese camino. El análisis no establece explotación activa a gran escala, lo que cambia la prioridad de la respuesta pero no la elimina.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "WordPress sostiene una parte importante de los sitios publicados en internet, y lo que hace relevante a WP2Shell no es la severidad de cada CVE aislada, sino la ausencia de credencial al inicio de la cadena. La pregunta práctica para quien administra sitios no es solo si la versión está actualizada, sino también si hay evidencia de que la cadena ya se ejecutó: cuenta administrativa desconocida, archivo ZIP en uploads, directorio wp2shell_ en plugins. Actualizar sin esa verificación resuelve la exposición futura y deja abierta la posibilidad de un acceso creado antes del parche.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Análisis de Seqrite y publicación de Cyber Security News consultados el 21 de octubre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe sobre WP2Shell, con base en el análisis técnico de Seqrite y en la publicación de Cyber Security News:",
        },
        {
          type: "list",
          items: [
            "**Nombre:** WP2Shell, cadena de explotación contra WordPress Core documentada por Seqrite el 16 de octubre de 2026.",
            "**Fallos encadenados:** CVE-2026-63030, confusión de rutas en el controlador de solicitudes por lotes de la API REST, y CVE-2026-60137, inyección SQL en el endpoint de posts.",
            "**Punto de entrada:** solicitud al endpoint /wp-json/batch/v1, sin autenticación.",
            "**Resultado demostrado:** creación de cuenta administrativa, ejecución remota de código e instalación de un plugin usado como web shell.",
            "**Versiones vulnerables a la cadena completa:** WordPress 6.9.0 a 6.9.4 y 7.0.0 a 7.0.1.",
            "**Versiones corregidas:** 6.8.6, 6.9.5 y 7.0.2, o una versión soportada posterior.",
            "**Divulgación de los fallos:** julio de 2026, según la publicación analizada.",
            "**Explotación activa:** el análisis no establece explotación generalizada en entornos reales.",
          ],
        },
      ],
    },
    {
      heading: "Cómo funciona la cadena",
      blocks: [
        {
          type: "p",
          text: "La secuencia descrita en el análisis sigue cinco etapas, desde la solicitud pública hasta la persistencia en el servidor:",
        },
        {
          type: "table",
          table: {
            headers: ["Etapa", "Técnica", "Detalle"],
            rows: [
              [
                "Acceso inicial",
                "Solicitud a la API REST",
                "Se envía una solicitud al endpoint /wp-json/batch/v1, que procesa varias llamadas en un solo envío.",
              ],
              [
                "Confusión de rutas",
                "CVE-2026-63030",
                "Las solicitudes anidadas confunden el tratamiento de rutas y alcanzan funcionalidades que deberían exigir autenticación. Por sí solo, no ejecuta código.",
              ],
              [
                "Inyección SQL",
                "CVE-2026-60137",
                "El parámetro público author_exclude se mapea a author__not_in en WP_Query, y el tratamiento inadecuado de la entrada afecta la consulta a la base de datos.",
              ],
              [
                "Creación de cuenta",
                "Acceso administrativo",
                "La prueba de concepto de Seqrite establece una cuenta con nivel administrativo y llega a la ejecución remota de código.",
              ],
              [
                "Preparación de archivos",
                "Escritura y extracción de ZIP",
                "El archivo se coloca en wp-content/uploads/2026/10/ y se extrae en wp-content/upgrade/.",
              ],
              [
                "Instalación de web shell",
                "Directorio de plugin",
                "Un directorio con el patrón wp2shell_<hex> se mueve a wp-content/plugins/.",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Una vez que el código se ejecuta en el servidor, el atacante obtiene un camino para modificar el sitio fuera del panel de WordPress. El análisis también señala que el proceso httpd.exe puede realizar escrituras de archivos, algo que también ocurre en operaciones normales de plugins: el nombre del proceso, por sí solo, no prueba un compromiso.",
        },
      ],
    },
    {
      heading: "Versiones afectadas y corregidas",
      blocks: [
        {
          type: "p",
          text: "La exposición depende de la versión y de cuál de los dos fallos incluye. La tabla siguiente reproduce lo que lista el análisis.",
        },
        {
          type: "table",
          table: {
            headers: ["Versión de WordPress", "Situación", "Fallos"],
            rows: [
              ["7.0.0 a 7.0.1", "Vulnerable a la cadena completa", "CVE-2026-63030 y CVE-2026-60137"],
              ["6.9.0 a 6.9.4", "Vulnerable a la cadena completa", "CVE-2026-63030 y CVE-2026-60137"],
              ["6.8.0 a 6.8.5", "Afectada por la inyección SQL", "CVE-2026-60137"],
              ["6.8.6", "Corregida", "Versión mínima corregida de la línea 6.8"],
              ["6.9.5", "Corregida", "Versión mínima corregida de la línea 6.9"],
              ["7.0.2", "Corregida", "Versión mínima corregida de la línea 7.0"],
            ],
          },
        },
        {
          type: "p",
          text: "La recomendación del análisis es actualizar a la versión corregida correspondiente, o a una versión soportada posterior, y confirmar que la actualización se completó. Confirmar significa verificar la versión en ejecución, no solo el mensaje de éxito del panel.",
        },
      ],
    },
    {
      heading: "Indicadores de compromiso",
      blocks: [
        {
          type: "p",
          text: "Los indicadores siguientes describen artefactos y comportamientos observados en el análisis. Uno solo no cierra un diagnóstico, y la combinación con el contexto del sitio es lo que sostiene la conclusión.",
        },
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor", "Descripción"],
            rows: [
              ["Endpoint", "/wp-json/batch/v1", "Endpoint de la API REST por lotes"],
              ["Patrón de archivo", "temp-write-test-*", "Archivos temporales en wp-content/"],
              ["Archivo ZIP", "wp2shell_4e9b3641.zip", "Ejemplo de archivo en wp-content/uploads/2026/10/"],
              ["Patrón de directorio", "wp2shell_<hex>", "Directorios observados en upgrade y plugins"],
              ["Patrón de archivo PHP", "wp2shell_<hex>.php", "Ejemplo de archivo extraído"],
              ["Archivos PHP", "Nuevos o alterados en plugins o cache", "Comparar con la actividad esperada del sitio"],
              ["Cuenta", "Administrador inesperado", "Verificar la fecha de creación"],
              ["Detección de red", "HTTP/CVE-2026-63030!DP.50405", "Detección de red Quick Heal"],
              ["Detección de red", "HTTP/CVE-2026-63030!SP.50370", "Detección de red Quick Heal"],
              [
                "Detección de comportamiento",
                "SL_A WP2Shell Suspicious PHP File Modification in WordPress Plugins",
                "Modificación sospechosa de PHP en directorios de plugins",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Detección y respuesta",
      blocks: [
        {
          type: "list",
          title: "Qué verificar en el entorno",
          items: [
            "**Cuentas administrativas:** listar administradores y revisar la fecha de creación de cada cuenta no reconocida.",
            "**Directorios de plugins:** buscar directorios y archivos con el patrón wp2shell_<hex> en wp-content/plugins.",
            "**Uploads y upgrade:** revisar wp-content/uploads, con atención a la carpeta del mes actual, y wp-content/upgrade.",
            "**Archivos temporales:** buscar archivos con el patrón temp-write-test-* en wp-content.",
            "**Cambios de PHP:** comparar archivos nuevos o modificados en plugins y cache con la actividad esperada del sitio.",
            "**Registros de acceso:** revisar solicitudes al endpoint /wp-json/batch/v1 y evaluar volumen, origen y contenido de las llamadas.",
          ],
        },
        {
          type: "p",
          text: "Las detecciones de red de Quick Heal y la detección de comportamiento de modificación de PHP en plugins complementan la inspección manual. Ayudan a encontrar actividad en curso, pero no sustituyen la verificación de los artefactos ya escritos en el servidor.",
        },
      ],
    },
    {
      heading: "Mitigación y acciones recomendadas",
      blocks: [
        {
          type: "list",
          items: [
            "**Actualizar** las instalaciones afectadas a WordPress 6.8.6, 6.9.5, 7.0.2 o una versión soportada posterior.",
            "**Confirmar** que la actualización se completó y que la instalación ejecuta la versión corregida.",
            "**Restringir**, cuando sea operativamente viable, el acceso no autenticado a funcionalidades sensibles de la API REST.",
            "**Investigar** cuentas administrativas desconocidas y verificar sus fechas de creación.",
            "**Inspeccionar** directorios de plugins, cache, uploads y upgrade en busca de archivos PHP o directorios sospechosos.",
            "**Revisar** registros en busca de solicitudes sospechosas al endpoint /wp-json/batch/v1.",
            "**Comparar** cambios en archivos del sitio con la actividad esperada y usar las detecciones disponibles.",
          ],
        },
        {
          type: "p",
          text: "Restringir el acceso a funcionalidades de la API REST reduce la exposición donde es viable, pero no sustituye la actualización. Y la actualización, por sí sola, no elimina un acceso creado antes de ella: una versión corregida no es prueba de que un compromiso anterior fue eliminado.",
        },
        {
          type: "list",
          title: "En caso de compromiso",
          items: [
            "**Preservar** evidencias antes de cualquier limpieza, incluidos archivos, directorios y registros relevantes.",
            "**Desactivar** plugins sospechosos.",
            "**Restablecer** credenciales afectadas.",
            "**Investigar** posibles mecanismos de persistencia que hayan permanecido en el servidor.",
          ],
        },
      ],
    },
    {
      heading: "Lo que aún no se sabe y límites del artículo",
      blocks: [
        {
          type: "p",
          text: "El análisis consultado describe una prueba de concepto y los artefactos esperados de la cadena, pero no establece explotación activa a gran escala, no atribuye la actividad a un grupo específico y no presenta cifras de víctimas. El material recibido para esta publicación tampoco detalla la explotación paso a paso de cada CVE. Lo que se puede afirmar con seguridad es la existencia de los dos fallos, el encadenamiento descrito, las versiones afectadas y las versiones corregidas.",
        },
        {
          type: "p",
          text: "El detalle operativo que suele subestimarse es la verificación posterior a la actualización. Actualizar cierra la puerta; inspeccionar cuentas, plugins y directorios muestra si alguien ya entró por ella. Ambas acciones pertenecen a la misma respuesta y no son alternativas entre sí.",
        },
        {
          type: "p",
          text: "CyDef actualizará sus informes de inteligencia si se divulgan nuevos datos sobre explotación activa de WP2Shell.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cyber Security News: WP2Shell Attack Lets Hackers Create WordPress Admin Accounts and Install Web Shells Without Login",
      url: "https://cybersecuritynews.com/wp2shell-attack/",
    },
    {
      label:
        "Seqrite: WP2Shell exploit chain, anatomy of a sophisticated WordPress attack",
      url: "https://www.seqrite.com/blog/wp2shell-exploit-chain-anatomy-of-a-sophisticated-wordpress-attack/",
    },
  ],
  changelog: [
    "2026-10-21: Primera versión publicada, basada en el análisis de Seqrite y en la publicación de Cyber Security News.",
  ],
};
