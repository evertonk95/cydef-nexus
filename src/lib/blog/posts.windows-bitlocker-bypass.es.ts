import type { BlogPost } from "./posts";

/**
 * Windows BitLocker: fallas permiten eludir el cifrado de disco
 * (CVE-2026-97015 y CVE-2026-119832, ES). Contenido elaborado a partir de los
 * registros CVE de Microsoft y de la publicación del Cyber Security News,
 * verificados el 12 de noviembre de 2026.
 * Portada: public/assets/blog/windows-bitlocker-bypass-thumb.webp
 */
export const windowsBitlockerBypassPostEs: BlogPost = {
  slug: "windows-bitlocker-bypass-cve-2026-97015",
  title:
    "BitLocker: dos fallas permiten eludir el cifrado de disco en dispositivos Windows",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Microsoft divulgó el 10 de noviembre de 2026 dos vulnerabilidades en Windows BitLocker, CVE-2026-97015 y CVE-2026-119832, que permiten eludir funciones de seguridad mediante un ataque físico. La CVE-2026-119832 exige acceso físico y privilegios básicos para eludir el cifrado de la unidad del sistema.",
  date: "12 de noviembre de 2026",
  dateISO: "2026-11-12",
  readTime: "8 min de lectura",
  image: "/assets/blog/windows-bitlocker-bypass-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Windows",
    "BitLocker",
    "CVE-2026-97015",
    "CVE-2026-119832",
    "Cifrado",
    "Desbordamiento de búfer",
    "Seguridad de Endpoints",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "El 10 de noviembre de 2026, Microsoft divulgó dos vulnerabilidades en **Windows BitLocker**, identificadas como **CVE-2026-97015** y **CVE-2026-119832**. Ambas permiten eludir funciones de seguridad de BitLocker mediante un ataque físico al equipo, pero tienen causas y requisitos de acceso distintos.",
        },
        {
          type: "p",
          text: "La **CVE-2026-97015** es causada por un **desbordamiento de búfer basado en heap**, clasificado como CWE-122. La **CVE-2026-119832** deriva de un **control de acceso inadecuado**. En el caso de la CVE-2026-119832, Microsoft confirma que un atacante con acceso físico y privilegios básicos puede eludir el cifrado de la unidad de almacenamiento del sistema y acceder a datos cifrados.",
        },
        {
          type: "p",
          text: "La puntuación refleja la naturaleza física del vector: la CVE-2026-97015 recibió CVSS 6,8 y la CVE-2026-119832, CVSS 5,9, ambas clasificadas como Important. Ninguna de las dos exige que la víctima haga clic en un enlace, abra un archivo o apruebe una solicitud.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "BitLocker es la capa que protege los datos en reposo cuando el equipo se pierde, se roba o se accede físicamente sin el usuario. Las fallas que eluden esa capa mediante un ataque físico golpean justamente el escenario que el cifrado de disco existe para cubrir. El riesgo práctico depende de un dato que la telemetría de red no ve: quién tiene acceso físico al equipo. La respuesta correcta combina actualización con control de acceso físico, y la prioridad debe recaer sobre los dispositivos que guardan datos sensibles y que pueden ser físicamente accedidos por terceros.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Registros CVE de Microsoft y publicación del Cyber Security News verificados el 12 de noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe hasta el 12 de noviembre de 2026, con base en los registros CVE de Microsoft y en la publicación analizada:",
        },
        {
          type: "list",
          items: [
            "**Divulgación:** 10 de noviembre de 2026, en el ciclo mensual de actualizaciones.",
            "**Fallas:** CVE-2026-97015 (desbordamiento de búfer basado en heap, CWE-122) y CVE-2026-119832 (control de acceso inadecuado).",
            "**Clasificación:** ambas Important; CVSS 6,8 y 5,9, respectivamente.",
            "**Vector:** ataque físico al dispositivo; sin interacción del usuario.",
            "**Privilegios:** CVE-2026-97015 no exige privilegios; CVE-2026-119832 exige privilegios básicos.",
            "**Resultado en la CVE-2026-119832:** elusión del cifrado de la unidad del sistema y acceso a datos cifrados.",
            "**Explotación conocida:** Microsoft informó que la CVE-2026-97015 no era conocida públicamente ni explotada en la fecha de publicación.",
            "**Objetivo:** ningún sector o tipo de organización especificado como más afectado.",
          ],
        },
      ],
    },
    {
      heading: "Productos y versiones afectadas",
      blocks: [
        {
          type: "p",
          text: "La lista de productos afectados no es idéntica entre las dos CVE. La CVE-2026-97015 tiene un alcance mayor, incluyendo ramas antiguas de Windows Server; la CVE-2026-119832 cubre un conjunto más restringido. La tabla de abajo separa las dos.",
        },
        {
          type: "table",
          table: {
            headers: ["Producto / versión", "CVE-2026-97015", "CVE-2026-119832"],
            rows: [
              ["Windows 10 1607", "Afectado", "No afectado"],
              ["Windows 10 1809", "Afectado", "Afectado"],
              ["Windows 10 21H2", "Afectado", "Afectado"],
              ["Windows 10 22H2", "Afectado", "Afectado"],
              ["Windows 11 23H2", "Afectado", "Afectado"],
              ["Windows 11 24H2", "Afectado", "Afectado"],
              ["Windows 11 25H2", "Afectado", "Afectado"],
              ["Windows 11 26H1", "Afectado", "Afectado"],
              ["Windows 11 26H2", "Afectado", "Afectado"],
              ["Windows Server 2012", "Afectado", "No afectado"],
              ["Windows Server 2012 R2", "Afectado", "No afectado"],
              ["Windows Server 2016", "Afectado", "No afectado"],
              ["Windows Server 2019", "Afectado", "Afectado"],
              ["Windows Server 2022", "Afectado", "Afectado"],
              ["Windows Server 2025", "Afectado", "Afectado"],
            ],
          },
        },
        {
          type: "p",
          text: "La diferencia de alcance es un punto práctico: un inventario que trate las dos fallas como una lista única puede concluir que un Windows Server 2012 o un Windows 10 1607 está protegido contra la CVE-2026-119832 cuando, en realidad, sigue expuesto a la CVE-2026-97015. Cada CVE debe verificarse en su propio registro oficial.",
        },
      ],
    },
    {
      heading: "Builds corregidas por CVE",
      blocks: [
        {
          type: "p",
          text: "Microsoft publicó actualizaciones de seguridad con builds corregidas específicas por producto y por falla. La tabla de abajo resume las builds mínimas corregidas indicadas en los registros.",
        },
        {
          type: "table",
          table: {
            headers: ["Producto / versión", "CVE-2026-97015", "CVE-2026-119832"],
            rows: [
              ["Windows 10 1607", "10.0.14393.9612", "No afectado"],
              ["Windows 10 1809", "10.0.17763.9376", "10.0.17763.9487"],
              ["Windows 10 21H2", "10.0.19044.7807", "10.0.19044.7846"],
              ["Windows 10 22H2", "10.0.19045.7807", "10.0.19045.7846"],
              ["Windows 11 23H2", "10.0.22631.7652", "10.0.22631.7711"],
              ["Windows 11 24H2", "10.0.26100.9711", "10.0.26100.9974"],
              ["Windows 11 25H2", "10.0.26200.9711", "10.0.26200.9974"],
              ["Windows 11 26H1", "10.0.28000.3231", "10.0.28000.3501"],
              ["Windows 11 26H2", "10.0.26300.9711", "10.0.26300.9974"],
              ["Windows Server 2012", "6.2.9200.26434", "No afectado"],
              ["Windows Server 2012 R2", "6.3.9600.23470", "No afectado"],
              ["Windows Server 2016", "10.0.14393.9612", "No afectado"],
              ["Windows Server 2019", "10.0.17763.9376", "10.0.17763.9487"],
              ["Windows Server 2022", "10.0.20348.5761", "10.0.20348.5870"],
              ["Windows Server 2025", "10.0.26100.33650", "10.0.26100.33822"],
            ],
          },
        },
        {
          type: "p",
          text: "Aplicar una actualización de noviembre de 2026 no significa, por sí solo, estar protegido contra las dos fallas: las builds corregidas difieren entre la CVE-2026-97015 y la CVE-2026-119832. La verificación debe confirmar la build en ejecución, no solo el mensaje de éxito del panel.",
        },
      ],
    },
    {
      heading: "Cómo funciona el ataque",
      blocks: [
        {
          type: "p",
          text: "Las dos fallas comparten el mismo vector de entrada: acceso físico al equipo. Es lo que distingue este caso de una explotación remota. No hay enlace para hacer clic, archivo para abrir ni solicitud para aprobar.",
        },
        {
          type: "list",
          items: [
            "**CVE-2026-97015:** desbordamiento de búfer basado en heap (CWE-122) permite eludir una función de seguridad por ataque físico. No exige privilegios previos.",
            "**CVE-2026-119832:** control de acceso inadecuado permite eludir el cifrado de la unidad del sistema y acceder a datos cifrados. Exige privilegios básicos.",
          ],
        },
        {
          type: "p",
          text: "La consecuencia es lo que hace relevante el caso: en un dispositivo con BitLocker, el cifrado de disco es justamente el mecanismo que protege los datos si el equipo cae en manos equivocadas. Eludir esa capa devuelve al atacante el acceso al contenido que el cifrado debía hacer inaccesible.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Confidencialidad:** posible acceso a datos cifrados en la unidad del sistema, en el caso de la CVE-2026-119832.",
            "**Integridad:** el vector de la CVE-2026-97015 indica impacto potencial sobre integridad y confidencialidad de los datos protegidos.",
            "**Exposición local:** el riesgo se concentra en dispositivos que puedan ser físicamente accedidos por terceros.",
            "**Sin vector remoto:** la publicación no describe explotación remota; el acceso físico es requisito previo.",
          ],
        },
      ],
    },
    {
      heading: "Recomendaciones de mitigación",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventariar** los dispositivos Windows con BitLocker y determinar la versión y la build de cada uno.",
            "**Verificar** la aplicabilidad de cada CVE por separado en los registros oficiales de Microsoft.",
            "**Aplicar** las actualizaciones de seguridad correspondientes, confirmando que cada equipo alcanzó la build corregida.",
            "**Priorizar** los dispositivos que almacenan datos sensibles.",
            "**Restringir** el acceso físico a los equipos afectados y revisar los controles de acceso físico.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Cuando la actualización no se pueda aplicar de inmediato",
            body: "Restringir el acceso físico a los dispositivos afectados y mantenerlos en lugares controlados hasta aplicar las actualizaciones. Para un vector que depende del acceso físico, la contención física es la mitigación que cierra el camino mientras el parche no se aplica.",
          },
        },
      ],
    },
    {
      heading: "Lo que aún no sabemos / límites de este artículo",
      blocks: [
        {
          type: "p",
          text: "Este artículo fue elaborado a partir de los registros CVE de Microsoft y de la publicación del Cyber Security News, con verificación el 12 de noviembre de 2026. No hay telemetría propia de CyDef sobre estas vulnerabilidades ni explotación observada internamente.",
        },
        {
          type: "p",
          text: "Microsoft informó que la CVE-2026-97015 no era conocida públicamente ni había evidencia de explotación en la fecha de publicación. No hay, hasta la fecha de verificación, información pública sobre explotación activa de ninguna de las dos fallas, ni atribución de autoría. Este texto se actualizará cuando haya información nueva verificable.",
        },
      ],
    },
    {
      heading: "Próximos pasos",
      blocks: [
        {
          type: "list",
          items: [
            "Relevar los dispositivos Windows con BitLocker del entorno, con versión y build.",
            "Comprobar la aplicabilidad de cada CVE en los registros oficiales de Microsoft.",
            "Aplicar las actualizaciones de noviembre de 2026, priorizando dispositivos con datos sensibles.",
            "Revisar los controles de acceso físico y confirmar que los equipos alcanzaron las builds corregidas.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Microsoft Security Response Center: CVE-2026-97015",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-97015",
    },
    {
      label:
        "Microsoft Security Response Center: CVE-2026-119832",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-119832",
    },
    {
      label:
        "CVE Program: CVE-2026-97015",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-97015",
    },
    {
      label:
        "CVE Program: CVE-2026-119832",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-119832",
    },
    {
      label:
        "Cyber Security News: Windows BitLocker Vulnerabilities Allow Attackers to Bypass Security Feature",
      url: "https://cybersecuritynews.com/windows-bitlocker-security-bypass/",
    },
  ],
  changelog: [
    "2026-11-12: primera versión, basada en los registros CVE de Microsoft y en la publicación del Cyber Security News, verificados en esta fecha.",
  ],
};
