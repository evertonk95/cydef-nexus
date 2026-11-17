import type { BlogPost } from "./posts";

/**
 * Mozilla corrige 99 fallas en Firefox 160 (ES).
 * Fuente: MFSA 2026-125 (Mozilla) y análisis de Cyber Security News.
 * Portada: public/assets/blog/firefox-160-correcoes-seguranca-thumb.webp
 */
export const firefox160CorrecoesSegurancaPostEs: BlogPost = {
  slug: "firefox-160-correcoes-seguranca",
  title:
    "Mozilla corrige 99 fallas en Firefox 160, incluidos escapes de sandbox y elevación de privilegios",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Mozilla publicó Firefox 160 con correcciones para 99 vulnerabilidades, 57 de ellas de impacto alto, entre escapes de sandbox, elevación de privilegios, bypass de la política de mismo origen y errores de memoria en componentes gráficos, de red y de almacenamiento.",
  date: "17 de Noviembre, 2026",
  dateISO: "2026-11-17",
  readTime: "7 min",
  image: "/assets/blog/firefox-160-correcoes-seguranca-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Mozilla Firefox",
    "Vulnerabilidades",
    "Escape de Sandbox",
    "Elevación de Privilegios",
    "Actualización de Seguridad",
    "Navegador",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "El 10 de noviembre de 2026, Mozilla publicó Firefox 160 y el aviso de seguridad MFSA 2026-125, que reúne correcciones para 99 vulnerabilidades clasificadas con impacto general alto. El paquete cubre escapes de sandbox, elevación de privilegios, bypass de la política de mismo origen, divulgación de información y errores de memoria en componentes centrales del navegador, como gráficos, red, almacenamiento, audio y video, IPC y el motor de JavaScript.",
        },
        {
          type: "p",
          text: "Según el relevamiento publicado por Cyber Security News a partir del aviso de Mozilla, la distribución por severidad es de 57 fallas de impacto alto, 24 de impacto moderado y 18 de impacto bajo. Mozilla no informó que estas vulnerabilidades estén siendo explotadas en ataques activos.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación de CyDef",
            body: "Escape de sandbox y elevación de privilegios aparecen en el mismo aviso y en el mismo navegador. Cada uno de estos grupos solo se vuelve grave cuando se encadena con una falla de ejecución en el proceso de contenido, pero es justamente esa cadena la que interesa a un atacante: primero comprometer el renderizador, después romper el aislamiento. El navegador sigue siendo una de las mayores superficies de ataque del endpoint, y una ventana de actualización de una semana entre la publicación del aviso y la aplicación en toda la flota ya es tiempo suficiente para una explotación oportunista.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Aviso MFSA 2026-125 y reportaje de Cyber Security News consultados el 17 de Noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe sobre la actualización, con base en el aviso oficial de Mozilla y en el análisis de Cyber Security News:",
        },
        {
          type: "list",
          items: [
            "**Producto y versión corregida:** Mozilla Firefox 160 para escritorio y Firefox para Android, ambos en la versión 160 o superior.",
            "**Volumen de correcciones:** 99 vulnerabilidades, de las cuales 57 de impacto alto, 24 de impacto moderado y 18 de impacto bajo.",
            "**Fecha de publicación:** 10 de noviembre de 2026, en el aviso MFSA 2026-125.",
            "**Tipos de falla:** escape de sandbox, elevación de privilegios, bypass de la política de mismo origen, divulgación de información, uso después de liberación (use-after-free), punteros inválidos, condiciones de límite incorrectas y problemas de aislamiento entre sitios.",
            "**Componentes más citados:** Graphics (CanvasWebGL, Text, WebRender, WebGPU), DOM (Navigation, Core & HTML, Service Workers, Editor, Selection), Networking (HTTP, Cache, Cookies), Storage (Cache API, localStorage), Audio/Video, IPC, Layout y JavaScript.",
            "**Explotación activa:** Mozilla no reporta explotación en ataques reales en el aviso.",
            "**Productos derivados:** el aviso no presenta correcciones equivalentes para Firefox ESR o Thunderbird, que deben verificarse por separado.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Impacto", "Cantidad"],
            rows: [
              ["Alto", "57"],
              ["Moderado", "24"],
              ["Bajo", "18"],
              ["Total", "99"],
            ],
          },
        },
      ],
    },
    {
      heading: "Principales vulnerabilidades del aviso",
      blocks: [
        {
          type: "p",
          text: "El aviso describe cada falla de forma individual y no presenta una cadena de explotación única. Las entradas siguientes son las destacadas por ambas fuentes consultadas o las que rompen directamente los límites de aislamiento del navegador:",
        },
        {
          type: "list",
          items: [
            "**CVE-2026-124907 (Alta):** use-after-free en Graphics: CanvasWebGL, con elevación de privilegios y escape de sandbox entre los impactos posibles. Es la falla destacada como más relevante en el análisis de Cyber Security News.",
            "**CVE-2026-124853 (Alta):** condiciones de límite incorrectas en Graphics: Text, con escape de sandbox.",
            "**CVE-2026-124855 y CVE-2026-124905 (Alta):** escape de sandbox en DOM: Navigation. La primera tiene crédito al investigador Tran Quac.",
            "**CVE-2026-124859 (Alta):** escape de sandbox por condiciones de límite incorrectas en Storage: Cache API.",
            "**CVE-2026-124861 (Alta):** escape de sandbox por use-after-free en Audio/Video: cubeb.",
            "**CVE-2026-124864 y CVE-2026-124900 (Alta):** escape de sandbox por use-after-free en DOM: Service Workers.",
            "**CVE-2026-124903 (Alta):** escape de sandbox por use-after-free en IPC, el componente que gestiona la comunicación entre los procesos del navegador.",
            "**CVE-2026-124874 (Alta):** bypass de la política de mismo origen en Networking: HTTP, con crédito a Minseong Kim.",
            "**CVE-2026-124909:** divulgación de información en la navegación privada.",
            "**CVE-2026-124911:** clickjacking en el autocompletado de Firefox para Android.",
            "**CVE-2026-124858 (Alta):** use-after-free en DOM: HTML Parser, con crédito a Amy Burnett, de OpenAI. OpenAI Codex Security, identificada como kylebot, firma varios otros hallazgos en layout, almacenamiento, recolección de basura de JavaScript y gráficos.",
          ],
        },
        {
          type: "p",
          text: "Los créditos indican quién reportó cada falla, pero no informan si el hallazgo provino de revisión manual o de herramientas automatizadas. Tampoco hay detalle público sobre la explotación práctica de cada CVE, que es el comportamiento habitual de Mozilla en este tipo de aviso.",
        },
      ],
    },
    {
      heading: "Productos y versiones afectadas",
      blocks: [
        {
          type: "p",
          text: "El aviso señala Firefox 160 como la versión que contiene las correcciones. Las versiones anteriores del navegador son, por consecuencia, las potencialmente afectadas. El comunicado no detalla el rango completo de versiones impactadas ni indica qué fallas afectan solo a Android.",
        },
        {
          type: "table",
          table: {
            headers: ["Plataforma", "Versión corregida"],
            rows: [
              ["Firefox para Windows", "160 o superior"],
              ["Firefox para macOS", "160 o superior"],
              ["Firefox para Linux", "160 o superior"],
              ["Firefox para Android", "160 o superior, desde la tienda de aplicaciones"],
            ],
          },
        },
        {
          type: "p",
          text: "Los administradores que operan Firefox ESR o Thunderbird deben consultar los avisos de esos productos por separado. MFSA 2026-125 no confirma que las mismas fallas hayan sido corregidas en esas versiones.",
        },
      ],
    },
    {
      heading: "Recomendaciones de mitigación",
      blocks: [
        {
          type: "p",
          text: "La corrección oficial existe y está disponible. La prioridad es aplicar la actualización y comprobar la versión instalada, no solo desplegar el paquete:",
        },
        {
          type: "list",
          items: [
            "**Actualizar a Firefox 160 o superior** en todas las estaciones de trabajo y en servidores con interfaz gráfica.",
            "**Confirmar la versión instalada** en el menú Ayuda, opción Acerca de Firefox, y reiniciar el navegador para completar la aplicación.",
            "**Actualizar Firefox para Android** desde la tienda de aplicaciones y verificar la versión después de la instalación.",
            "**Revisar el inventario de navegadores** e identificar equipos con versiones anteriores a 160, incluidos accesos remotos y entornos de prueba.",
            "**Consultar por separado los avisos de Firefox ESR y Thunderbird**, sin suponer que recibieron las mismas correcciones.",
            "**Automatizar la actualización** mediante política de grupo, MDM o gestor de paquetes, con reinicio programado, para reducir la ventana entre la publicación del aviso y la corrección en la flota.",
            "**Donde la actualización no pueda aplicarse de inmediato**, restringir la navegación externa a los sitios necesarios, mantener el monitoreo de telemetría del endpoint y seguir los avisos de Mozilla.",
          ],
        },
      ],
    },
    {
      heading: "Lo que aún no se sabe y límites del artículo",
      blocks: [
        {
          type: "p",
          text: "Mozilla no afirma que las 99 vulnerabilidades estén en explotación activa ni publica una cadena de ataque detallada. En las fuentes consultadas no hay indicación de un exploit público para el conjunto, lo que no significa ausencia de riesgo: las fallas de use-after-free en componentes gráficos y de medios suelen ser objetivo de investigación ofensiva después de la publicación del aviso.",
        },
        {
          type: "p",
          text: "Este artículo no cubre el contenido interno de los reportes de bug, que permanecen restringidos, y no sustituye la lectura de MFSA 2026-125 por parte de quien necesita evaluar una exposición específica. CyDef actualizará el análisis si Mozilla publica nuevos datos sobre explotación o correcciones para ESR y Thunderbird.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "Mozilla: Security Vulnerabilities fixed in Firefox 160 (MFSA 2026-125)",
      url: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-125/",
    },
    {
      label: "Cyber Security News: Mozilla Patches 160 Firefox Vulnerabilities, Including Sandbox Escape",
      url: "https://cybersecuritynews.com/mozilla-patches-160-firefox-vulnerabilities/",
    },
  ],
  changelog: [
    "2026-11-17: primera versión publicada, basada en el aviso MFSA 2026-125 y en el análisis de Cyber Security News.",
  ],
};
