// CyDef Blog - Traducción editorial al español del artículo Click2Shell (fuente: canónico PT, 2026-09-21). Revisión humana vía PR.
import type { BlogPost } from "./posts";

/**
 * Click2Shell: falla en el instalador de temas de WordPress (ES).
 * Traducción del canónico PT (posts.click2shell-wordpress.ts), con verificación en 2026-09-21.
 * Contenido elaborado a partir de la publicación analizada por Cyber Security News
 * (18/09/2026), del informe técnico de pwn.ai y del lanzamiento de WordPress 7.1.1.
 * La revisión humana de esta traducción ocurre en el PR.
 * Capa: public/assets/blog/click2shell-wordpress-thumb.webp
 */
export const click2shellWordpressPostEs: BlogPost = {
  slug: "click2shell-wordpress-instalacao-tema-execucao-remota",
  title:
    "Click2Shell: falla en WordPress instala un tema desde el enlace y lleva a la ejecución remota de código",
  category: "Inteligencia de Amenazas",
  excerpt:
    "Una cadena de explotación en el recurso de visualización de temas de WordPress instala silenciosamente un tema del directorio oficial después de que un administrador autenticado abre un enlace malicioso. Encadenada con código inseguro del tema instalado, la falla termina en ejecución remota de código en el servidor. La corrección llegó en la versión 7.1.1.",
  date: "21 de septiembre de 2026",
  dateISO: "2026-09-21",
  readTime: "9 min de lectura",
  image: "/assets/blog/click2shell-wordpress-thumb.webp",
  author: "Equipo CyDef",
  tags: [
    "WordPress",
    "Click2Shell",
    "Ejecución remota de código",
    "Inyección en selector jQuery",
    "Theme Installer",
    "Customizer",
    "Gestión de Vulnerabilidades",
    "Hardening",
    "Blue Team",
    "SOC",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "WordPress publicó el 17 de septiembre de 2026 la versión **7.1.1**, que corrige una falla en el recurso de visualización de temas explotada en una cadena bautizada como **Click2Shell**. El problema de base estaba en el núcleo del CMS y permitía instalar, de forma silenciosa, un tema elegido por el atacante desde el directorio oficial de WordPress.org.",
        },
        {
          type: "p",
          text: "La falla aislada no entrega ejecución de código: es una **primitiva de instalación forzada**. Lo que convierte el caso en compromiso del servidor es el encadenamiento con un tema que carga código PHP inseguro. En el escenario demostrado por los investigadores, el tema **Mobile Repair Zone 2.5.4** exponía un manejador AJAX sin verificación de nonce y sin verificación de capacidad, lo que resultó en ejecución de código con los permisos de la cuenta del servidor web.",
        },
        {
          type: "p",
          text: "El vector exige interacción humana, pero no exige una cuenta en el sitio: el atacante solo necesita que un **administrador autenticado** abra un enlace especialmente construido. La sesión del administrador proporciona la capacidad de instalación y el nonce, y el propio JavaScript confiable de WordPress ejecuta la acción sensible en nombre del atacante.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Evaluación CyDef",
            body: "Riesgo alto para cualquier sitio WordPress con cuentas administrativas activas y personalización de tema habilitada, y riesgo aún mayor en hospedaje compartido: la ejecución en la cuenta del servidor web alcanza credenciales de base de datos y archivos de otros contextos que convivan en el mismo entorno. La combinación de instalación silenciosa con ausencia de cambio visual es lo que hace que la actividad sea difícil de percibir sin monitoreo dedicado.",
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
          text: "Lo que se sabe hasta el 21 de septiembre de 2026, con base en la publicación analizada, en el informe técnico de pwn.ai y en el lanzamiento de corrección de WordPress:",
        },
        {
          type: "list",
          items: [
            "**Identificador:** en la divulgación, WordPress todavía no había publicado un CVE definitivo para la falla de núcleo; la cadena se referencia públicamente como Click2Shell.",
            "**Severidad:** la instalación forzada aislada fue clasificada como alta, con CVSS 3.1 de 7.1; la cadena completa con ejecución remota de código fue considerada crítica.",
            "**Productos afectados:** WordPress Core anterior a 7.1.1 y ramas de seguridad soportadas anteriores a la corrección correspondiente, con retroportabilidad hasta 4.7.",
            "**Vector:** enlace especialmente construido, abierto por un administrador autenticado, que dispara la instalación y la visualización de un tema inactivo del directorio oficial.",
            "**Requisito humano:** sí. El atacante no necesita una cuenta en el sitio, pero depende de la sesión autenticada de un administrador.",
            "**Segunda etapa:** tema instalado con código de preactivación inseguro, que expone un manejador AJAX sin nonce y sin verificación de capacidad.",
            "**Impacto final:** ejecución remota de código con los permisos de la cuenta del servidor web, acceso al wp-config.php y a credenciales de base de datos, lectura de datos de WordPress y WooCommerce, alteración de archivos y contenido, creación de usuarios y robo de secretos disponibles para el proceso PHP.",
            "**Corrección:** actualización a WordPress 7.1.1 o a la versión corregida de la rama soportada en uso. La corrección del selector entró en el changeset 63664.",
            "**Explotación en campo:** la divulgación pública no presentó evidencia de explotación en ataques reales.",
          ],
        },
      ],
    },
    {
      heading: "Qué es la vulnerabilidad",
      blocks: [
        {
          type: "p",
          text: "La raíz del problema es una **inyección en selector jQuery** en la ruta del instalador de temas. El valor del tema enviado en la URL se procesa de dos formas inconsistentes: la API de temas de WordPress.org canonicaliza la entrada a un slug válido del catálogo, mientras que el navegador del administrador mantiene la puntuación original y la inserta en un selector jQuery.",
        },
        {
          type: "p",
          text: "Caracteres de selector especialmente construidos escapan de la coincidencia de atributo prevista, recorren la tarjeta de tema retornada y alcanzan el control real de instalación, que WordPress entonces acciona de forma programática. Es una ruptura de validación: la entrada que debería identificar un elemento del catálogo pasa a interpretarse como estructura ejecutable de selector.",
        },
        {
          type: "p",
          text: "La corrección en el changeset 63664 restringe la coincidencia a una tarjeta genuina de la interfaz y aplica **escapeSelector()** de jQuery al slug derivado de la URL antes de montar el selector. Con eso, comillas, combinadores y sintaxis de comentario inyectados pasan a tratarse como caracteres literales del slug, y no como estructura de CSS.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Punto de atención",
            body: "El tema instalado permanece inactivo y la apariencia del sitio no cambia. No hay señal visible para el administrador, lo que explica por qué la segunda etapa de la cadena es decisiva para el atacante y por qué la detección debe venir de telemetría, no de inspección visual.",
          },
        },
      ],
    },
    {
      heading: "Cómo funciona la cadena Click2Shell",
      blocks: [
        {
          type: "list",
          items: [
            "El atacante arma una URL con el valor de tema manipulado, capaz de escapar de la coincidencia de atributo dentro del instalador.",
            "La URL se entrega a un administrador autenticado, que la accede con la sesión activa en el panel.",
            "WordPress.org canonicaliza el valor como slug del catálogo, y el navegador del administrador inserta la puntuación original en el selector jQuery.",
            "El selector manipulado alcanza el control legítimo de instalación, accionado de forma programática por el JavaScript del propio panel.",
            "Un tema actual del directorio oficial se instala y permanece inactivo, sin alterar la apariencia del sitio.",
            "La sesión del administrador se usa para abrir la visualización del tema en el Customizer, lo que carga el PHP del tema inactivo.",
            "El tema inseguro expone un manejador AJAX sin verificación de nonce y sin verificación de capacidad.",
            "El manejador acepta detalles de plugin y una URL de paquete controladas por el atacante, descarga y descomprime el archivo enviado y carga su punto de entrada PHP.",
            "El resultado es ejecución de código con los permisos de la cuenta del servidor web.",
          ],
        },
        {
          type: "p",
          text: "Vale registrar la limitación de la primera etapa: la falla de núcleo **no permite instalar un archivo arbitrario de tema**. Instala un paquete del catálogo confiable y mantiene el tema inactivo. El compromiso solo ocurre cuando existe, en el entorno, un tema con código de preactivación inseguro que sirva de puente entre un paquete inactivo y PHP controlado por el atacante.",
        },
      ],
    },
    {
      heading: "La segunda etapa: el tema que sirve de puente",
      blocks: [
        {
          type: "p",
          text: "Durante la visualización en el Customizer, WordPress carga el PHP del tema inactivo para renderizar la vista previa. Ese es el momento en que el código de preactivación pasa a ejecutarse. En el caso demostrado, el tema **Mobile Repair Zone 2.5.4** registraba un manejador AJAX accesible a usuarios autenticados y sin las dos verificaciones que deberían existir: verificación de nonce y verificación de capacidad.",
        },
        {
          type: "p",
          text: "Sin esas verificaciones, el manejador aceptaba datos arbitrarios de plugin y una URL de paquete, descargaba el archivo indicado, lo descomprimía en el servidor y cargaba su punto de entrada. Cualquier tema o plugin con ese mismo patrón produce el mismo efecto cuando se encadena a la falla de núcleo.",
        },
        {
          type: "callout",
          callout: {
            kind: "exemplo",
            title: "El patrón que importa para su inventario",
            body: "El problema de la segunda etapa no es específico del tema usado en la demostración: es la ausencia de verificación de nonce y de capacidad en manejadores AJAX que aceptan paquetes externos. Además de actualizar el núcleo, vale rastrear el inventario de temas y plugins en busca de ese patrón, incluso en elementos inactivos.",
          },
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "Ejecución de código con los permisos de la cuenta del servidor web.",
            "Acceso al wp-config.php y a las credenciales de base de datos de la aplicación.",
            "Lectura de datos de WordPress y WooCommerce, incluida información de clientes y pedidos, cuando estén presentes.",
            "Alteración de archivos y de contenido publicado, con riesgo de desfiguración y de inyección de contenido.",
            "Creación de usuarios y alteración de permisos dentro del panel.",
            "Robo de secretos disponibles para el proceso PHP, como claves de API y tokens de integraciones.",
            "Riesgo ampliado en hospedaje compartido, donde la cuenta comprometida puede alcanzar otros contextos del mismo entorno.",
          ],
        },
      ],
    },
    {
      heading: "Detección: dónde buscar",
      blocks: [
        {
          type: "list",
          items: [
            "Solicitudes a **theme-install.php** que no correspondan a una acción legítima de instalación registrada por el equipo.",
            "Llamadas a **admin-ajax.php** asociadas a flujos del Customizer, especialmente con origen inusual o en ventanas fuera del horario de mantenimiento.",
            "Temas instalados recientemente que nadie reconoce, incluidos temas inactivos.",
            "Archivos PHP inesperados en directorios de tema y de uploads.",
            "Alteraciones en archivos, en contenido y en cuentas administrativas, con atención a usuarios creados fuera del proceso de aprovisionamiento.",
            "Patrones de acceso administrativo desde orígenes nuevos, correlacionados en el tiempo con las solicitudes anteriores.",
          ],
        },
      ],
    },
    {
      heading: "Mitigación",
      blocks: [
        {
          type: "p",
          text: "La corrección oficial es la actualización del núcleo. Después de ella, las acciones a continuación reducen la superficie y ayudan a identificar compromiso anterior:",
        },
        {
          type: "list",
          items: [
            "Actualizar WordPress a la versión **7.1.1 o superior**.",
            "Aplicar la versión corregida correspondiente en las ramas de seguridad soportadas, incluidas las que recibieron retroportabilidad hasta 4.7.",
            "Verificar si las actualizaciones automáticas se aplicaron de hecho en los entornos de producción.",
            "Revisar temas y plugins instalados recientemente y eliminar lo que no tiene uso justificado.",
            "Inspeccionar archivos PHP inesperados y alteraciones en cuentas de usuario.",
            "Investigar solicitudes sospechosas a theme-install.php.",
            "Investigar llamadas sospechosas a endpoints admin-ajax.php relacionados con el Customizer.",
            "Verificar alteraciones no autorizadas en archivos, contenido y usuarios administrativos.",
            "Revisar el patrón de nonce y de verificación de capacidad en los manejadores AJAX de temas y plugins propios.",
          ],
        },
      ],
    },
    {
      heading: "Cuando la actualización no puede aplicarse de inmediato",
      blocks: [
        {
          type: "list",
          items: [
            "Restringir el acceso a las cuentas administrativas, con autenticación multifactor y principio de menor privilegio.",
            "Monitorear solicitudes de instalación de temas y llamadas administrativas del Customizer.",
            "Reducir al mínimo el número de administradores activos y revisar cuentas con privilegios elevados que no sean necesarias.",
            "Mantener copias de seguridad verificadas y restaurables, con prueba periódica de restauración.",
          ],
        },
        {
          type: "p",
          text: "Esas medidas reducen la ventana de exposición, pero no corrigen la falla. La actualización del núcleo sigue siendo la acción que elimina la primitiva de instalación forzada.",
        },
      ],
    },
    {
      heading: "Lo que todavía no sabemos / límites de este artículo",
      blocks: [
        {
          type: "p",
          text: "Este artículo fue elaborado a partir de la publicación analizada, del informe técnico de los investigadores y del lanzamiento de corrección de WordPress, con verificación el 21 de septiembre de 2026. No hay telemetría propia de CyDef sobre este caso, ninguna explotación observada internamente y ninguna atribución de autoría hecha aquí.",
        },
        {
          type: "p",
          text: "Hasta la fecha de verificación, no había evidencia pública de explotación en ataques reales ni CVE definitivo publicado para la falla de núcleo. Los números de versión corregida, el alcance de las retroportabilidades y la lista de temas o plugins que sirven de segunda etapa deben confirmarse en las fuentes oficiales antes de cualquier decisión de cambio en producción. Este texto se actualizará cuando haya información nueva verificable.",
        },
      ],
    },
    {
      heading: "Próximos pasos",
      blocks: [
        {
          type: "list",
          items: [
            "Inventariar todos los sitios WordPress bajo su responsabilidad, incluidos entornos de homologación y sitios olvidados.",
            "Confirmar la versión del núcleo en cada uno y priorizar los que permiten acceso administrativo desde internet.",
            "Planificar la ventana de actualización para la versión 7.1.1 o para la corregida de la rama en uso.",
            "Ejecutar la búsqueda en logs por theme-install.php y por llamadas al Customizer vía admin-ajax.php.",
            "Revisar el inventario de temas y plugins en cuanto a manejadores AJAX sin nonce y sin verificación de capacidad.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cyber Security News: Click2Shell WordPress Flaw Lets Attackers Gain RCE With a Single Malicious Link",
      url: "https://cybersecuritynews.com/click2shell-wordpress-vulnerability/",
    },
    {
      label: "pwn.ai: análisis técnico de la cadena Click2Shell",
      url: "https://pwn.ai/blog/click2shell",
    },
    {
      label: "WordPress 7.1.1 security update (Cyber Security News)",
      url: "https://cybersecuritynews.com/wordpress-7-1-1-security-update/",
    },
    {
      label: "WordPress Core changeset 63664 (corrección del selector en el instalador de temas)",
      url: "https://core.trac.wordpress.org/changeset/63664",
    },
  ],
  changelog: [
    "2026-09-21: primera versión, basada en la publicación analizada (18/09/2026), en el informe técnico de pwn.ai y en el lanzamiento de WordPress 7.1.1 (17/09/2026).",
  ],
};
