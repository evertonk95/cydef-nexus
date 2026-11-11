import type { BlogPost } from "./posts";

/**
 * Fortinet: fallas críticas en FortiManager y FortiAnalyzer permiten ejecución
 * de código sin autenticación (noviembre de 2026, ES). Contenido elaborado a
 * partir de los avisos de FortiGuard Labs (FG-IR-26-219, FG-IR-26-275,
 * FG-IR-26-276 y FG-IR-26-274) y de la publicación del Cyber Security News,
 * verificados el 11 de noviembre de 2026.
 * Portada: public/assets/blog/fortinet-fortimanager-fortianalyzer-rce-thumb.webp
 */
export const fortinetRcePostEs: BlogPost = {
  slug: "fortinet-fortimanager-fortianalyzer-rce-cve-2026-126170",
  title:
    "Fortinet corrige fallas críticas en FortiManager y FortiAnalyzer con ejecución de código sin autenticación",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Fortinet divulgó el 10 de noviembre de 2026 fallas críticas en FortiManager, FortiAnalyzer y productos relacionados, incluida la CVE-2026-126170 (CVSS 9,8), que permite ejecución de código o comandos sin autenticación cuando la API JSON está habilitada.",
  date: "11 de noviembre de 2026",
  dateISO: "2026-11-11",
  readTime: "9 min de lectura",
  image: "/assets/blog/fortinet-fortimanager-fortianalyzer-rce-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Fortinet",
    "FortiManager",
    "FortiAnalyzer",
    "CVE-2026-126170",
    "Ejecución remota de código",
    "Inyección de JSON",
    "Inyección SQL",
    "SSRF",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "El 10 de noviembre de 2026, Fortinet divulgó un conjunto de fallas críticas en productos de gestión y análisis de seguridad, con destaque para el **FortiManager** y el **FortiAnalyzer**. La más grave, **CVE-2026-126170**, recibió una puntuación base de **CVSS 9,8** y permite que un atacante no autenticado ejecute código o comandos a través de la API JSON-RPC, cuando la API JSON está habilitada.",
        },
        {
          type: "p",
          text: "El lote no se resume a una sola falla: combina cuatro vulnerabilidades críticas con causas distintas, inyección de JSON en la API JSON-RPC, falla de autorización en el servicio FGFM, inyección de SQL y falsificación de solicitud del lado del servidor (SSRF) en el servicio OFTP. Cada una tiene su propio vector y requisitos previos, por lo que la exposición depende de qué funcionalidades y puertos están habilitados en cada entorno.",
        },
        {
          type: "p",
          text: "Un punto central para la evaluación del riesgo: la API JSON de la CVE-2026-126170 viene **deshabilitada por defecto**. El riesgo real se concentra en entornos que la habilitaron para automatización. Las fallas de FGFM y OFTP, a su vez, exponen los servicios de comunicación de los propios dispositivos, que no están protegidos por las restricciones de inicio de sesión del panel.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "Lo que hace relevante este lote es el objetivo: FortiManager y FortiAnalyzer son el centro de gestión de muchos entornos Fortinet. Comprometer el gestor suele abrir camino hacia los dispositivos que administra. La respuesta correcta combina dos capas: actualizar a las versiones corregidas y, donde la actualización aún no cabe, deshabilitar la API JSON y restringir el acceso de red a los puertos FGFM (TCP 541) y OFTP (TCP 514), que no están protegidos por la restricción de inicio de sesión de la interfaz web.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Avisos de FortiGuard Labs (FG-IR-26-219, FG-IR-26-275, FG-IR-26-276, FG-IR-26-274) y publicación del Cyber Security News verificados el 11 de noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe hasta el 11 de noviembre de 2026, con base en los avisos de FortiGuard Labs y en la publicación analizada:",
        },
        {
          type: "list",
          items: [
            "**Divulgación:** 10 de noviembre de 2026, con actualizaciones liberadas antes de la publicación de los avisos detallados.",
            "**Falla más grave:** CVE-2026-126170, inyección de JSON en la API JSON-RPC, CVSS 9,8 (FG-IR-26-219).",
            "**Otras fallas críticas:** CVE-2026-126261 (autorización en FGFM, CVSS 9,0), CVE-2026-126262 (inyección SQL vía OFTP, CVSS 9,3) y CVE-2026-126260 (SSRF vía OFTP, CVSS 9,0).",
            "**Vectores:** API JSON-RPC, servicio FGFM y protocolo OFTP.",
            "**Requisito previo de la más grave:** API JSON habilitada (deshabilitada por defecto).",
            "**Explotación conocida:** Fortinet marcó la CVE-2026-126261 como no explotada en la fecha de publicación.",
            "**Objetivo:** ningún tipo específico de organización identificado como objetivo principal.",
          ],
        },
      ],
    },
    {
      heading: "Las cuatro fallas críticas",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["CVE", "CVSS", "Tipo", "Productos / servicio"],
            rows: [
              ["CVE-2026-126170", "9,8", "Inyección de JSON (CWE-116)", "FortiManager, FortiAnalyzer y variantes, API JSON-RPC (FG-IR-26-219)"],
              ["CVE-2026-126262", "9,3", "Inyección SQL (CWE-89)", "FortiAnalyzer y FortiManager con recursos de FortiAnalyzer, vía OFTP (FG-IR-26-276)"],
              ["CVE-2026-126261", "9,0", "Falla de autorización", "FortiManager, servicio FGFM (FG-IR-26-275)"],
              ["CVE-2026-126260", "9,0", "SSRF (CWE-918)", "FortiAnalyzer y FortiManager con recursos de FortiAnalyzer, vía OFTP (FG-IR-26-274)"],
            ],
          },
        },
        {
          type: "p",
          text: "Las dos fallas de OFTP, CVE-2026-126262 y CVE-2026-126260, no deben confundirse. La primera es inyección de SQL con potencial de ejecución de código; la segunda es falsificación de solicitud del lado del servidor, un vector distinto. La CVE-2026-126261 ocurre antes de la verificación de la contraseña de registro, lo que coloca al propio servicio FGFM en la trayectoria del ataque.",
        },
      ],
    },
    {
      heading: "CVE-2026-126170: inyección de JSON en la API JSON-RPC",
      blocks: [
        {
          type: "p",
          text: "La falla más grave está en la API JSON-RPC usada por FortiManager y FortiAnalyzer. Cuando la API JSON está habilitada, una solicitud HTTP especialmente creada puede permitir que un atacante no autenticado ejecute código o comandos. El aviso clasifica la causa como codificación o escape inadecuado de salida (CWE-116).",
        },
        {
          type: "list",
          title: "Productos afectados por la CVE-2026-126170",
          items: [
            "**FortiManager 8.0:** 8.0.0 a 8.0.2 · **FortiManager 7.6:** 7.6.0 a 7.6.7.",
            "**FortiAnalyzer 8.0:** 8.0.0 a 8.0.2 · **FortiAnalyzer 7.6:** 7.6.0 a 7.6.7.",
            "**FortiManager Cloud 8.0:** 8.0.1 a 8.0.2 · **FortiManager Cloud 7.6:** 7.6.0 a 7.6.7.",
            "**FortiAnalyzer Cloud 8.0:** 8.0.1 a 8.0.2 · **FortiAnalyzer Cloud 7.6:** 7.6.0 a 7.6.7.",
            "**FortiAnalyzer-BigData 7.6:** 7.6.0 a 7.6.2.",
            "**FortiSASE-Sovereign:** varias versiones, con corrección dependiente del release.",
          ],
        },
        {
          type: "p",
          text: "Las ramificaciones 7.4 y 7.2 del FortiManager y del FortiAnalyzer no son afectadas por esta CVE específica. Esto no dispensa la verificación de las otras fallas del lote, que tienen tablas propias de versiones.",
        },
      ],
    },
    {
      heading: "Versiones corregidas por falla",
      blocks: [
        {
          type: "p",
          text: "Las correcciones varían por falla y por rama del software. La tabla de abajo resume las versiones de corrección indicadas en los avisos.",
        },
        {
          type: "table",
          table: {
            headers: ["Producto", "CVE-2026-126170", "CVE-2026-126261", "CVE-2026-126262 / CVE-2026-126260"],
            rows: [
              ["FortiManager 8.0", "8.0.3 (futura)", "8.0.1", "8.0.1 (SQLi) / 8.0.1 (SSRF)"],
              ["FortiManager 7.6", "7.6.8", "7.6.8", "7.6.8"],
              ["FortiManager 7.4", "no afectado", "7.4.6", "7.4.12"],
              ["FortiManager 7.2", "no afectado", "7.2.9", "7.2.13 (SQLi) / no afectado (SSRF)"],
              ["FortiAnalyzer 8.0", "8.0.3 (futura)", "no afectado", "8.0.2 (SQLi) / 8.0.1 (SSRF)"],
              ["FortiAnalyzer 7.6", "7.6.8", "no afectado", "7.6.8"],
              ["FortiAnalyzer 7.4", "no afectado", "no afectado", "7.4.12"],
              ["FortiAnalyzer 7.2", "no afectado", "no afectado", "7.2.13 (SQLi) / no afectado (SSRF)"],
            ],
          },
        },
        {
          type: "p",
          text: "Un punto de atención en la rama 8.0: para la CVE-2026-126170, la versión 8.0.3 fue listada como futura en el aviso, lo que significa que aún no estaba disponible en la fecha de publicación. En ese caso, el camino inmediato es la mitigación, deshabilitar la API JSON, hasta que la versión 8.0.3 sea liberada.",
        },
      ],
    },
    {
      heading: "Por qué importan los puertos FGFM y OFTP",
      blocks: [
        {
          type: "p",
          text: "Las fallas de FGFM y OFTP exponen servicios que quedan fuera de la protección del inicio de sesión del panel. El FGFM usa el puerto TCP 541 y es el servicio por el cual los dispositivos se registran y se comunican con el FortiManager. El OFTP usa el puerto TCP 514 y trata de la transferencia de logs.",
        },
        {
          type: "p",
          text: "Restringir el inicio de sesión administrativo por la interfaz web no protege esos puertos. Un atacante que alcance el puerto FGFM puede enviar paquetes creados para explotar la CVE-2026-126261 incluso antes de la verificación de la contraseña de registro. Del mismo modo, quien alcance el puerto OFTP puede explotar las fallas de inyección de SQL y de SSRF. Por eso la contención de red entra en la respuesta con el mismo peso que la actualización.",
        },
      ],
    },
    {
      heading: "Recomendaciones de mitigación",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventariar** los productos Fortinet del entorno, con versión, rama y funcionalidades habilitadas.",
            "**Aplicar** la versión corregida correspondiente a cada producto y falla, según la tabla de versiones.",
            "**Deshabilitar** la API JSON cuando no sea necesaria, configurando rpc-permit como none en los perfiles de administrador.",
            "**Restringir** el acceso de red a los puertos FGFM (TCP 541) y OFTP (TCP 514), permitiendo solo las conexiones necesarias.",
            "**Respaldar** las configuraciones de los dispositivos antes de aplicar las actualizaciones.",
            "**Monitorear** cambios no autorizados en los dispositivos gestionados y en los propios gestores.",
            "**Revisar** los avisos oficiales de Fortinet para confirmar la corrección aplicable a cada falla.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Actualización o contención de red",
            body: "Cuando la actualización no se pueda aplicar de inmediato, la mitigación es deshabilitar la API JSON en los perfiles de administrador (set rpc-permit none) y restringir el acceso de red a los servicios vulnerables, permitiendo solo las conexiones necesarias.",
          },
        },
      ],
    },
    {
      heading: "Lo que aún no sabemos / límites de este artículo",
      blocks: [
        {
          type: "p",
          text: "Este artículo fue elaborado a partir de los avisos de FortiGuard Labs y de la publicación del Cyber Security News, con verificación el 11 de noviembre de 2026. No hay telemetría propia de CyDef sobre estas vulnerabilidades ni explotación observada internamente.",
        },
        {
          type: "p",
          text: "Fortinet marcó la CVE-2026-126261 como no explotada en la fecha de publicación, y no identificó un tipo específico de organización como objetivo principal. El lote de noviembre también incluye fallas de enrutamiento y de control de acceso en FortiOS que este artículo no detalla, por ser de otra clase. Este texto se actualizará cuando haya información nueva verificable.",
        },
      ],
    },
    {
      heading: "Próximos pasos",
      blocks: [
        {
          type: "list",
          items: [
            "Relevar los productos Fortinet del entorno, priorizando FortiManager, FortiAnalyzer y sus variantes en la nube.",
            "Verificar si la API JSON está habilitada y deshabilitarla donde no sea necesaria.",
            "Planificar la aplicación de las versiones corregidas, con atención a la rama 8.0, en la que la 8.0.3 aún estaba listada como futura.",
            "Restringir el acceso de red a los puertos FGFM y OFTP mientras las actualizaciones no estén aplicadas.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "FortiGuard Labs: JSON Injection in JRPC API (FG-IR-26-219, CVE-2026-126170)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-219",
    },
    {
      label:
        "FortiGuard Labs: Improper authorization in FortiManager FGFM (FG-IR-26-275, CVE-2026-126261)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-275",
    },
    {
      label:
        "FortiGuard Labs: SQL injection via OFTP (FG-IR-26-276, CVE-2026-126262)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-276",
    },
    {
      label:
        "FortiGuard Labs: SSRF via OFTP (FG-IR-26-274, CVE-2026-126260)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-274",
    },
    {
      label:
        "Cyber Security News: Critical Fortinet Flaws Expose FortiManager and FortiAnalyzer to Remote Code Execution Without Login",
      url: "https://cybersecuritynews.com/critical-fortinet-flaws-patched/",
    },
  ],
  changelog: [
    "2026-11-11: primera versión, basada en los avisos de FortiGuard Labs y en la publicación del Cyber Security News, verificados en esta fecha.",
  ],
};
