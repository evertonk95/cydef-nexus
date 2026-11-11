import type { BlogPost } from "./posts";

/**
 * Windows Active Directory: desbordamiento de búfer basado en pila permite
 * ejecución remota de código (CVE-2026-119948, ES). Contenido elaborado a partir
 * de la guía de actualización del MSRC y de la publicación del Cyber Security News,
 * verificados el 11 de noviembre de 2026.
 * Portada: public/assets/blog/windows-active-directory-rce-thumb.webp
 */
export const windowsActiveDirectoryRcePostEs: BlogPost = {
  slug: "windows-active-directory-rce-cve-2026-119948",
  title:
    "Windows Active Directory: desbordamiento de búfer permite ejecución remota de código por un atacante autenticado",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Microsoft corrigió el 10 de noviembre de 2026 una falla de desbordamiento de búfer basado en pila en Windows Active Directory (CVE-2026-119948) que puede permitir que un atacante autenticado ejecute código por la red. La explotación exige privilegios bajos, no requiere interacción del usuario y tiene una complejidad de ataque alta.",
  date: "11 de noviembre de 2026",
  dateISO: "2026-11-11",
  readTime: "8 min de lectura",
  image: "/assets/blog/windows-active-directory-rce-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "Windows",
    "Active Directory",
    "CVE-2026-119948",
    "Desbordamiento de búfer",
    "Ejecución remota de código",
    "Patch Tuesday",
    "Microsoft",
    "Inteligencia de Amenazas",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "El 10 de noviembre de 2026, en su ciclo mensual de actualizaciones (Patch Tuesday), Microsoft divulgó una vulnerabilidad en **Windows Active Directory** que puede permitir que un atacante autenticado ejecute código por la red. La falla recibió el identificador **CVE-2026-119948** y la clasificación **Important**, con una puntuación base de **CVSS 3.1 de 7,5**.",
        },
        {
          type: "p",
          text: "La causa identificada es un **desbordamiento de búfer basado en pila**: un programa escribe más datos en la memoria de la pila que el espacio reservado para ellos, lo que puede sobrescribir datos adyacentes y, bajo condiciones específicas, alterar el flujo de ejecución del programa. Microsoft confirma que el resultado puede incluir la capacidad de ejecutar código remoto.",
        },
        {
          type: "p",
          text: "La evaluación del CVSS indica privilegios bajos, ninguna interacción del usuario y una complejidad de ataque alta. Esto significa que la falla no se describe como un ataque no autenticado que funciona contra cualquier sistema Windows accesible por la red, y que deben existir condiciones específicas para que la explotación tenga éxito.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "Lo que merece atención aquí no es la etiqueta de gravedad aislada, sino la combinación de tres factores: la falla vive en Active Directory, un componente central de autenticación y autorización en entornos corporativos; la explotación exige solo privilegios bajos, lo que ya coloca al atacante dentro de la red; y la complejidad alta significa que el riesgo real depende de la configuración y del contexto. La respuesta correcta es tratar esto como prioridad de actualización en controladores de dominio y en sistemas Windows afectados, sin asumir que el acceso a la red y una credencial válida garantizan la explotación.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipo CyDef. Guía de actualización del MSRC y publicación del Cyber Security News verificadas el 11 de noviembre de 2026.",
        },
      ],
    },
    {
      heading: "Resumen ejecutivo",
      blocks: [
        {
          type: "p",
          text: "Lo que se sabe hasta el 11 de noviembre de 2026, con base en la guía de actualización del Microsoft Security Response Center (MSRC) y en la publicación analizada:",
        },
        {
          type: "list",
          items: [
            "**CVE:** CVE-2026-119948, en Windows Active Directory.",
            "**Tipo de falla:** desbordamiento de búfer basado en pila.",
            "**Clasificación:** Important, con una puntuación base de CVSS 3.1 de 7,5.",
            "**Prerrequisitos:** privilegios bajos, sin interacción del usuario y complejidad de ataque alta.",
            "**Resultado posible:** ejecución remota de código por un atacante autenticado, por la red.",
            "**Impacto:** alto potencial sobre la confidencialidad, la integridad y la disponibilidad.",
            "**Divulgación:** 10 de noviembre de 2026, en el Patch Tuesday de noviembre.",
            "**Explotación conocida:** ninguna, y sin divulgación pública previa en el momento de la publicación.",
            "**Reportada por:** investigador anónimo.",
            "**Evaluación de Microsoft:** explotación clasificada como menos probable y madurez del código de explotación como no comprobada.",
          ],
        },
      ],
    },
    {
      heading: "Productos y versiones afectadas",
      blocks: [
        {
          type: "p",
          text: "La cobertura varía por versión y por arquitectura. Los productos e instalaciones listados en la guía de actualización:",
        },
        {
          type: "table",
          table: {
            headers: ["Producto", "Instalación / arquitectura"],
            rows: [
              ["Windows Server 2025", "Standard y Server Core"],
              ["Windows Server 2022", "Standard y Server Core"],
              ["Windows Server 2019", "Standard y Server Core"],
              ["Windows Server 2016", "Standard y Server Core"],
              ["Windows 11, versión 26H2", "x64 y ARM64"],
              ["Windows 11, versión 26H1", "x64 y ARM64"],
              ["Windows 11, versión 25H2", "x64 y ARM64"],
              ["Windows 11, versión 24H2", "x64 y ARM64"],
              ["Windows 11, versión 23H2", "x64 y ARM64"],
              ["Windows 10, versión 22H2", "32 bits, x64 y ARM64"],
              ["Windows 10, versión 21H2", "32 bits, x64 y ARM64"],
              ["Windows 10, versión 1809", "32 bits y x64"],
              ["Windows 10, versión 1607", "32 bits y x64"],
            ],
          },
        },
        {
          type: "p",
          text: "La lista cubre sistemas de escritorio y servidores, incluidas las instalaciones Server Core, que concentran el rol de controlador de dominio en muchas organizaciones. Esa amplitud es lo que convierte la actualización en un esfuerzo de inventario antes de ser un clic.",
        },
      ],
    },
    {
      heading: "Actualizaciones oficiales y builds corregidas",
      blocks: [
        {
          type: "p",
          text: "Microsoft publicó el paquete correspondiente a cada producto y versión. Aplicar el KB correcto, en la build corregida, es lo que cierra la exposición.",
        },
        {
          type: "table",
          table: {
            headers: ["Producto / versión", "KB", "Build(s) corregida(s)"],
            rows: [
              ["Windows Server 2025", "KB5131080 / KB5131077", "10.0.26100.33822 / 10.0.26100.33730"],
              ["Windows Server 2022", "KB5131090", "10.0.20348.5870"],
              ["Windows Server 2019", "KB5131085", "10.0.17763.9487"],
              ["Windows Server 2016", "KB5131291", "10.0.14393.9688"],
              ["Windows 11, versión 26H2", "KB5132061 / KB5132043", "10.0.26300.9974 / 10.0.26300.9911"],
              ["Windows 11, versión 26H1", "KB5132059", "10.0.28000.3501"],
              ["Windows 11, versión 25H2", "KB5132061 / KB5132043", "10.0.26200.9974 / 10.0.26200.9911"],
              ["Windows 11, versión 24H2", "KB5132061 / KB5132043", "10.0.26100.9974 / 10.0.26100.9911"],
              ["Windows 11, versión 23H2", "KB5131087", "10.0.22631.7711"],
              ["Windows 10, versión 22H2", "KB5131096", "10.0.19045.7846"],
              ["Windows 10, versión 21H2", "KB5131096", "10.0.19044.7846"],
              ["Windows 10, versión 1809", "KB5131085", "10.0.17763.9487"],
              ["Windows 10, versión 1607", "KB5131291", "10.0.14393.9688"],
            ],
          },
        },
        {
          type: "p",
          text: "Un punto operativo relevante: cada sistema necesita el paquete correspondiente a su propia versión y arquitectura. No existe un único paquete que cubra todos los releases, así que aplicar una actualización genérica en todos los sistemas no sustituye la verificación por release.",
        },
      ],
    },
    {
      heading: "Qué exige la explotación y qué no está establecido",
      blocks: [
        {
          type: "p",
          text: "El registro de la CVE delimita con precisión lo que se puede afirmar y lo que permanece abierto. Vale la pena separar ambas cosas.",
        },
        {
          type: "list",
          items: [
            "**No es un ataque no autenticado:** la explotación requiere privilegios bajos, lo que presupone un atacante ya autenticado en el entorno.",
            "**No garantiza SYSTEM ni control de dominio:** el registro no establece que la explotación conceda privilegios SYSTEM o el control de todo el dominio.",
            "**Método de solicitud no divulgado:** la función afectada, la solicitud de red exacta y un método de ataque funcional no se detallaron en el aviso.",
            "**Complejidad alta:** deben existir condiciones específicas, como ajustes de protocolo o configuraciones particulares, para que ocurra la explotación.",
            "**Ninguna organización objetivo específica:** la publicación no identifica un tipo de organización como especialmente afectado.",
          ],
        },
        {
          type: "p",
          text: "Esa delimitación importa porque evita dos errores opuestos: minimizar la falla por no haber explotación conocida y, al mismo tiempo, tratarla como equivalente a una falla de acceso no autenticado o de escalamiento a SYSTEM.",
        },
      ],
    },
    {
      heading: "Recomendaciones de mitigación",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventariar** los sistemas Windows en las versiones afectadas, incluidas las instalaciones Server Core y los controladores de dominio.",
            "**Aplicar** la actualización oficial correspondiente a cada versión y arquitectura.",
            "**Confirmar** la instalación y verificar que cada sistema alcanzó la build corregida, no solo el mensaje de éxito del panel.",
            "**Restringir** el acceso de red a los sistemas afectados a las conexiones necesarias mientras no se pueda aplicar la actualización.",
            "**Monitorear** los registros de seguridad en busca de actividades sospechosas relacionadas con los sistemas afectados.",
            "**Revisar** las configuraciones de protocolo y de red de los sistemas afectados.",
            "**Mantener** un inventario actualizado de versiones, arquitecturas y actualizaciones instaladas.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Actualización inmediata o contención de red",
            body: "Cuando la actualización no se pueda aplicar de inmediato, el control pasa a ser la contención de red: restringir el acceso a los sistemas vulnerables permitiendo solo las conexiones necesarias, y seguir los comunicados oficiales de Microsoft mientras se monitorean los sistemas afectados.",
          },
        },
      ],
    },
    {
      heading: "Lo que aún no sabemos / límites de este artículo",
      blocks: [
        {
          type: "p",
          text: "Este artículo fue elaborado a partir de la guía de actualización del MSRC y de la publicación del Cyber Security News, con verificación el 11 de noviembre de 2026. No hay telemetría propia de CyDef sobre esta vulnerabilidad ni explotación observada internamente.",
        },
        {
          type: "p",
          text: "Permanecen abiertos la función afectada, la solicitud de red exacta y un método de ataque funcional, que Microsoft no detalló en el aviso. Como Microsoft clasificó la explotación como menos probable y la madurez del código de explotación como no comprobada, el panorama puede cambiar si aparece una prueba de concepto pública. Este texto se actualizará cuando haya información nueva verificable.",
        },
      ],
    },
    {
      heading: "Próximos pasos",
      blocks: [
        {
          type: "list",
          items: [
            "Relevar los sistemas Windows afectados en el entorno, con versión, arquitectura y rol (servidor, Server Core, controlador de dominio).",
            "Planificar la aplicación de las actualizaciones de noviembre de 2026 por los KB listados arriba, priorizando controladores de dominio y sistemas expuestos.",
            "Confirmar, tras la aplicación, que cada sistema alcanzó la build corregida.",
            "Mientras la actualización no esté aplicada, restringir el acceso de red al mínimo necesario.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Microsoft Security Response Center: CVE-2026-119948",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-119948",
    },
    {
      label:
        "Cyber Security News: Windows Active Directory RCE Vulnerability Allows Attacker to Execute Code Over a Network",
      url: "https://cybersecuritynews.com/windows-active-directory-rce-vulnerability/",
    },
    {
      label: "CVE Program: CVE-2026-119948",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-119948",
    },
  ],
  changelog: [
    "2026-11-11: primera versión, basada en la guía de actualización del MSRC y en la publicación del Cyber Security News, verificadas en esta fecha.",
  ],
};
